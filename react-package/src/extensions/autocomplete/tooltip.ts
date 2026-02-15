import { InputSelection, PrismEditor } from "../.."
import { preventDefault, useStableRef } from "../../core"
import { useTooltip } from "../../tooltips"
import {
	addOverlay,
	getLanguage,
	getLineBefore,
	getModifierCode,
	insertText,
	prevSelection,
	setSelection,
} from "../../utils"
import { useCursorPosition } from "../cursor"
import { AutoCompleteConfig, Completion, CompletionContext, CompletionDefinition } from "./types"
import { searchTemplate } from "../search/search"
import { updateMatched } from "./utils"
import { getStyleValue } from "../../utils/other"
import { addListener2, createTemplate, updateNode } from "../../utils/local"
import { useEffect, useMemo } from "react"

let count = 0

const tooltipTemplate = /* @__PURE__ */ createTemplate(
	'<div class="pce-ac-wrapper pce-ac-top"><div class=pce-ac-tooltip><ul role=listbox></ul></div><div class=pce-ac-docs tabindex=-1><button class=pce-ac-close tabindex=-1 title=Close></button><button class=pce-ac-toggle tabindex=-1 title="Read More"></button><div class=pce-ac-content>',
)
const rowTemplate = /* @__PURE__ */ createTemplate(
	"<li class=pce-ac-row role=option><div></div><div class=pce-ac-label> </div><div class=pce-ac-details><span> ",
)

const map: Record<string, CompletionDefinition<any>> = {}

/**
 * Registers completion sources for a set of languages.
 * If any of the languages already have completion sources, they're overridden.
 * @param langs Array of languages you want the completions to apply for.
 * @param definition Defines the completion sources for the languages along with additional
 * properties on the context passed to the completion sources.
 */
const registerCompletions = <T extends object>(
	langs: string[],
	definition: CompletionDefinition<T>,
) => {
	langs.forEach(lang => (map[lang] = definition))
}

/**
 * Extension adding basic autocomplete to an editor. For autocompletion to work, you need to
 * {@link registerCompletions} for specific languages.
 *
 * @param config Object used to configure the extension. The `filter` property is required.
 *
 * Requires the {@link useCursorPosition} extension to work.
 *
 * Requires styling from `prism-react-editor/autocomplete.css` in addition to a stylesheet
 * for icons. `prism-react-editor/autocomplete-icons.css` adds some icons from VSCode, but
 * you can use your own icons instead.
 *
 * @see {@link Completion.icon} for how to style your own icons.
 */
const useAutoComplete = (editor: PrismEditor, config: AutoCompleteConfig) => {
	const _config = useStableRef([config])
	const wrapper = useMemo(tooltipTemplate, [])
	const [show, _hide] = useTooltip(editor, wrapper)

	_config[0] = config

	useEffect(() => {
		let isOpen: boolean
		let isTyping: boolean
		let shouldOpen: boolean
		let currentOptions: [number, number[], number, number, Completion][]
		let numOptions: number
		let activeIndex: number
		let active: HTMLLIElement | undefined
		let pos: number
		let offset: number
		let rowHeight: number
		let stops: null | number[]
		let activeStop: number
		let currentSelection: InputSelection
		let prevLength: number
		let isDeleteForwards: boolean
		let tooltipPlacement: string
		let docsOption: Completion | null
		let docsEnabled: boolean
		let context: CompletionContext

		const windowSize = 13
		const container = editor.container!
		const textarea = editor.textarea!
		const getSelection = editor.getSelection
		const tabStopsContainer = searchTemplate()

		const [tooltip, docsWrapper] = wrapper.children as any as HTMLDivElement[]
		const [docsClose, docsToggle, docs] = docsWrapper.children as any as [
			HTMLButtonElement,
			HTMLButtonElement,
			HTMLDivElement,
		]
		const list = tooltip.firstChild as HTMLUListElement
		const id = (list.id = "pce-ac-" + count++)
		const rows = list.children as HTMLCollectionOf<HTMLLIElement>
		const prevIcons: string[] = []
		const hide = () => {
			if (isOpen) {
				_hide()
				textarea.removeAttribute("aria-controls")
				textarea.removeAttribute("aria-haspopup")
				textarea.removeAttribute("aria-activedescendant")
				if (docsEnabled) docsWrapper.remove()
				isOpen = false
			}
		}

		const measureRowHeight = () => {
			rowHeight = getStyleValue(rows[0], "height")
		}

		const updateRow = (index: number) => {
			const option = currentOptions[index + offset]
			const [iconEl, labelEl, detailsEl] = rows[index].children as HTMLCollectionOf<HTMLDivElement>
			const completion = option[4]
			const icon = completion.icon || "variable"

			updateMatched(labelEl, option[1], completion.label)
			updateNode(detailsEl.firstChild!.firstChild as Text, completion.detail || "")

			if (prevIcons[index] != icon) {
				iconEl.className = `pce-ac-icon pce-ac-icon-${(prevIcons[index] = icon)}`
				iconEl.style.color = `var(--pce-ac-icon-${icon})`
			}
		}

		const scrollActiveIntoView = () => {
			measureRowHeight()
			const scrollTop = tooltip.scrollTop
			const lower = rowHeight * activeIndex
			const upper = rowHeight * (activeIndex + 1) - tooltip.clientHeight

			tooltip.scrollTop = scrollTop > lower ? lower : scrollTop < upper ? upper : scrollTop
			updateOffset()
			updateActive()
		}

		const updateActive = () => {
			const oldActive = active
			active = rows[activeIndex - offset]
			oldActive?.removeAttribute("aria-selected")
			oldActive?.removeAttribute("aria-describedby")
			docsToggle.remove()
			if (active) {
				textarea.setAttribute("aria-activedescendant", active.id)
				active.setAttribute("aria-selected", true as any)

				if (currentOptions[activeIndex][4].renderDocs) {
					active.append(docsToggle)
					docsEnabled = !docsEnabled
					toggleDocs()
				} else {
					docsWrapper.remove()
				}
			} else if (oldActive) {
				textarea.removeAttribute("aria-activedescendant")
			}
		}

		const move = (decrement?: boolean) => {
			if (decrement) activeIndex = activeIndex ? activeIndex - 1 : numOptions - 1
			else activeIndex = activeIndex + 1 < numOptions ? activeIndex + 1 : 0
			scrollActiveIntoView()
		}

		const updateOffset = () => {
			const newOffset = Math.min(Math.floor(tooltip.scrollTop / rowHeight), numOptions - windowSize)
			if (newOffset == offset || newOffset < 0) return true

			offset = newOffset
			for (let i = 0; i < windowSize; ) updateRow(i++)

			list.style.paddingTop = offset * rowHeight + "px"
		}

		const insertOption = (index: number) =>
			insertCompletion(currentOptions[index][4], currentOptions[index][2], currentOptions[index][3])

		const insertCompletion = (completion: Completion, start: number, end = start) => {
			if (editor.props.readOnly) return
			let { label, tabStops: tabStops = [], insert } = completion
			let l = tabStops.length
			tabStops = tabStops.map(stop => stop + start)

			if (insert) {
				let indent = "\n" + getLineBefore(editor.value, pos).match(/\s*/)![0]
				let tab = editor.props.insertSpaces == false ? "\t" : " ".repeat(editor.props.tabSize || 2)
				let temp = tabStops.slice()

				insert = insert.replace(/\n|\t/g, (match, index: number) => {
					let replacement = match == "\t" ? tab : indent
					let diff = replacement.length - 1
					let i = 0
					while (i < l) {
						if (temp[i] > index + start) tabStops[i] += diff
						i++
					}

					return replacement
				})
			} else insert = label

			if (l % 2) tabStops[l] = tabStops[l - 1]

			insertText(editor, insert, start, end, tabStops[0], tabStops[1])

			if (l > 2) {
				if (!stops) addOverlay(editor, tabStopsContainer)
				stops = tabStops
				activeStop = 0
				prevLength = editor.value.length
				updateStops()
				currentSelection = getSelection()
				scrollTabStop()
			} else {
				editor.extensions.cursor?.scrollIntoView()
			}
		}

		const scrollTabStop = () => {
			tabStopsContainer.children[activeStop / 2].scrollIntoView({ block: "nearest" })
		}

		const moveActiveStop = (offset: number) => {
			activeStop += offset
			setSelection(editor, stops![activeStop], stops![activeStop + 1])
			scrollTabStop()
		}

		const clearStops = () => {
			tabStopsContainer.remove()
			stops = null
		}

		const updateStops = () => {
			let sorted: [number, number][] = []
			let i = 0
			for (; i < stops!.length; ) sorted[i / 2] = [stops![i++], stops![i++]]
			sorted.sort((a, b) => a[0] - b[0])
			updateMatched(tabStopsContainer, sorted.flat(), editor.value)
		}

		const getDocsPosition = () => {
			const width = container.clientWidth
			const scroll = Math.abs(container.scrollLeft)
			const pos = editor.extensions.cursor!.getPosition()
			const offset = editor.props.rtl ? pos.right : pos.left
			const fontSize = getStyleValue(container, "fontSize")

			if (width >= 46 * fontSize) {
				if (offset + 45.5 * fontSize < scroll + width) return tooltipPlacement + "-end"

				if (offset - 20.5 * fontSize > scroll) return tooltipPlacement + "-start"
			}

			return tooltipPlacement
		}

		const setDocsPosition = () => {
			wrapper.className = `pce-ac-wrapper pce-ac-${getDocsPosition()}`
		}

		const showDocs = () => {
			const option = currentOptions[activeIndex][4]

			if (option.renderDocs) {
				if (!docsWrapper.parentNode) wrapper.append(docsWrapper)
				if (docsOption != option) {
					docsOption = option
					docs.textContent = ""
					docs.append(...option.renderDocs(option, context, editor))
				}

				active?.setAttribute("aria-describedby", id + "d")
			}
		}

		const toggleDocs = () => {
			if (docsEnabled) docsWrapper.remove()
			else showDocs()

			docsEnabled = !docsEnabled
		}

		const startQuery = (explicit?: boolean) => {
			const [start, end, dir] = getSelection()
			const language = getLanguage(editor, (pos = dir < "f" ? start : end))
			const definition = map[language]
			const cursor = editor.extensions.cursor
			if (cursor && definition && (explicit || start == end) && !editor.props.readOnly) {
				const value = editor.value
				const lineBefore = getLineBefore(value, pos)
				const before = value.slice(0, pos)
				const filter = _config[0].filter
				context = {
					before,
					lineBefore,
					language,
					explicit: !!explicit,
					pos,
				}
				Object.assign(context, definition.context?.(context, editor))

				currentOptions = []
				definition.sources.forEach(source => {
					const result = source(context, editor)
					if (result) {
						const from = result.from
						const query = before.slice(from)

						result.options.forEach(option => {
							const filterResult = filter(query, option.label)
							if (filterResult) {
								filterResult[0] += option.boost || 0
								// @ts-expect-error Allow mutation
								filterResult.push(from, result.to ?? end, option)
								// @ts-expect-error Allow mutation
								currentOptions.push(filterResult)
							}
						})
					}
				})

				if (currentOptions[0]) {
					currentOptions.sort((a, b) => b[0] - a[0] || a[4].label.localeCompare(b[4].label))
					numOptions = currentOptions.length
					activeIndex = offset = 0

					for (let i = 0, l = numOptions < windowSize ? numOptions : windowSize; i < l; ) {
						updateRow(i++)
					}

					if (!isOpen) {
						const { clientHeight, clientWidth } = container
						const pos = cursor.getPosition()
						const max = Math.max(pos.bottom, pos.top)
						docsWrapper.style.maxWidth =
							tooltip.style.width = `min(25em, ${clientWidth}px - var(--padding-left) - 1em)`
						wrapper.style.maxHeight = `min(${max}px + .25em, ${clientHeight}px - 2em)`
					}

					list.style.paddingTop = ""
					list.style.height = rowHeight ? rowHeight * numOptions + "px" : 1.4 * numOptions + "em"
					tooltip.scrollTop = 0

					isOpen = true
					show(_config[0].preferAbove)
					tooltipPlacement = wrapper.parentElement!.style.top == "auto" ? "top" : "bottom"
					setDocsPosition()
					textarea.setAttribute("aria-controls", id)
					textarea.setAttribute("aria-haspopup", "listbox")
					updateActive()
				} else hide()
			} else hide()
		}

		const cleanUps = [
			addListener2(textarea, "mousedown", () => {
				if (stops) {
					setTimeout(() => {
						// Timeout runs before selectionChange, but after
						// the selection changes as a result of the click
						const [start, end] = getSelection()
						if (stops && (start < stops[activeStop] || end > stops[activeStop + 1])) {
							for (let i = 0, l = stops.length; i < stops.length; i += 2) {
								if (start >= stops[i] && end <= stops[i + 1]) {
									if (i + 3 > l) clearStops()
									else activeStop = i
									break
								}
							}
						}
					})
				}
			}),
			addListener2(
				textarea,
				"beforeinput",
				e => {
					let inputType = e.inputType
					let isDelete = inputType[0] == "d"
					let isInsert = inputType == "insertText"
					let data = e.data
					if (
						isOpen &&
						isInsert &&
						!prevSelection &&
						data &&
						!data[1] &&
						currentOptions[activeIndex][4].commitChars?.includes(data)
					) {
						insertOption(activeIndex)
					}

					if (stops) {
						currentSelection = getSelection()
						isDeleteForwards =
							isDelete && inputType[13] == "F" && currentSelection[0] == currentSelection[1]
					}
					isTyping =
						(!_config[0].explicitOnly || isOpen) &&
						(isTyping || (isInsert && !prevSelection) || (isDelete && isOpen))
				},
				true,
			),
			addListener2(textarea, "blur", e => {
				if (_config[0].closeOnBlur != false && !wrapper.contains(e.relatedTarget as Element)) hide()
			}),
			addListener2(
				textarea,
				"keydown",
				e => {
					let key = e.key
					let code = getModifierCode(e)
					let top: number
					let height: number
					let newActive: number

					if (key == " " && code == 2) {
						if (isOpen) toggleDocs()
						else startQuery(true)
						preventDefault(e)
					} else if (!code && isOpen) {
						if (/^Arrow[UD]/.test(key)) {
							move(key[5] == "U")
							preventDefault(e)
						} else if (/Tab|Enter/.test(key)) {
							insertOption(activeIndex)
							preventDefault(e)
						} else if (key == "Escape") {
							hide()
							preventDefault(e)
						} else if (key.slice(0, 4) == "Page") {
							measureRowHeight()
							top = tooltip.scrollTop
							height = tooltip.clientHeight
							if (key[4] == "U") {
								newActive = Math.ceil(top / rowHeight)
								activeIndex =
									activeIndex == newActive || newActive - 1 == activeIndex
										? Math.ceil(Math.max(0, (top - height) / rowHeight + 1))
										: newActive
							} else {
								top += height + 1
								newActive = Math.ceil(top / rowHeight - 2)
								activeIndex =
									activeIndex == newActive || newActive + 1 == activeIndex
										? Math.ceil(Math.min(numOptions - 1, (top + height) / rowHeight - 3))
										: newActive
							}
							scrollActiveIntoView()
							preventDefault(e)
						}
					} else if (stops) {
						if (!(code & 7) && key == "Tab") {
							if (!code) {
								moveActiveStop(2)
								if (activeStop + 3 > stops.length) clearStops()
								preventDefault(e)
							} else if (activeStop) {
								moveActiveStop(-2)
								preventDefault(e)
							}
						} else if (!code && key == "Escape") {
							clearStops()
							preventDefault(e)
						}
					}
				},
				true,
			),
			editor.on("update", () => {
				if (stops) {
					let value = editor.value
					let diff = prevLength - (prevLength = value.length)
					let [start, end] = currentSelection
					let i = 0
					let l = stops.length
					let activeStart = stops[activeStop]
					let activeEnd = stops[activeStop + 1]

					if (start < stops[activeStop] || end > activeEnd) {
						clearStops()
					} else {
						if (isDeleteForwards) end++
						if (end <= activeEnd) stops[activeStop + 1] -= diff
						if (end <= activeStart && diff > 0) stops[activeStop] -= diff
						for (; i < l; i += 2) {
							if (i != activeStop && stops[i] >= activeEnd) {
								stops[i] = Math.max(stops[i] - diff, stops[activeStop + 1])
								stops[i + 1] = Math.max(stops[i + 1] - diff, stops[activeStop + 1])
							}
						}
						updateStops()
					}
					isDeleteForwards = false
					currentSelection = getSelection()
				}
				shouldOpen = isTyping
			}),
			editor.on("selectionChange", selection => {
				if (stops && (selection[0] < stops[activeStop] || selection[1] > stops[activeStop + 1])) {
					clearStops()
				}
				if (shouldOpen) {
					shouldOpen = false
					startQuery()
				} else hide()
				isTyping = false
			}),
			() => {
				textarea.removeAttribute("aria-autocomplete")
				wrapper.append(docsWrapper)
				docsClose.after(docsToggle)
			},
			addListener2(container, "scroll", () => {
				if (isOpen) setDocsPosition()
			}),
			hide,
			clearStops,
			addListener2(tooltip, "scroll", () => {
				measureRowHeight()
				if (!updateOffset()) updateActive()
			}),
			addListener2(list, "mousedown", e => {
				if (e.target != docsToggle) {
					insertOption(
						[].indexOf.call(rows, (e.target as HTMLElement).closest("li") as never) + offset,
					)
				}
				preventDefault(e)
			}),
			addListener2(wrapper, "focusout", e => {
				if (_config[0].closeOnBlur != false && e.relatedTarget != textarea) hide()
			}),
			addListener2(docsClose, "click", toggleDocs),
			addListener2(docsClose, "mousedown", preventDefault),
			addListener2(docsToggle, "click", toggleDocs),
		]

		tabStopsContainer.className = "pce-tabstops"
		textarea.setAttribute("aria-autocomplete", "list")

		for (let i = list.childElementCount; i < windowSize; ) {
			list.append(rowTemplate())
			rows[i].id = id + "-" + i++
		}

		docsWrapper.id = id + "d"
		docsToggle.remove()
		docsWrapper.remove()

		editor.extensions.autoComplete = {
			startQuery,
			insertCompletion,
		}

		return () => {
			cleanUps.forEach(c => c())
			delete editor.extensions.autoComplete
		}
	}, [])
}

export { useAutoComplete, registerCompletions, map }
