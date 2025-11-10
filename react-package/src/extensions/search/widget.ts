import { useEffect } from "react"
import { addListener, doc, numLines, preventDefault } from "../../core"
import { InputSelection, PrismEditor } from "../../types"
import { useEditorReplace } from "./replace"
import {
	addOverlay,
	getModifierCode,
	regexEscape,
	isMac,
	isWebKit,
	getLineBefore,
} from "../../utils"
import { getStyleValue } from "../../utils/other"
import {
	addListener2,
	createTemplate,
	getLineEnd,
	getLineStart,
	updateNode,
} from "../../utils/local"

const shortcut = ` (Alt+${isMac ? "Cmd+" : ""}`

const template = /* @__PURE__ */ createTemplate(
	`<div class=prism-search-container style=display:flex;align-items:flex-start;justify-content:flex-end><div dir=ltr class=prism-search><button type=button aria-expanded=false title="Toggle Replace" class=pce-expand></button><div spellcheck=false><div><div class="pce-input pce-find"><input autocorrect=off autocapitalize=off placeholder=Find aria-label=Find><button type=button class=prev-match title="Previous Match (Shift+Enter)"></button><button type=button class=next-match title="Next Match (Enter)"></button><div class=search-error></div></div><button type=button class=pce-close title="Close (Esc)"></button></div><div class="pce-input pce-replace"><input autocorrect=off autocapitalize=off placeholder=Replace aria-label=Replace><button type=button title=(Enter)>Replace</button><button type=button title=(${
		isMac ? "Cmd" : "Ctrl+Alt"
	}+Enter)>All</button></div><div class=pce-options><div class=pce-match-count>0<span> of </span>0</div><button type=button aria-pressed=false class=pce-regex title="RegExp Search${shortcut}R)"><span aria-hidden=true></span></button><button type=button aria-pressed=false title="Preserve Case${shortcut}P)"><span aria-hidden=true>Aa</span></button><button type=button aria-pressed=false class=pce-whole title="Match Whole Word${shortcut}W)"><span aria-hidden=true>ab</span></button><button type=button aria-pressed=false class=pce-in-selection title="Find in Selection${shortcut}L)">`,
)

const toggleAttr = (el: Element, name: string) =>
	el.setAttribute(name, (el.getAttribute(name) == "false") as any)

export interface SearchWidget {
	/**
	 * Hides the search widget and removes most event listeners.
	 * @param focusTextarea Whether the editor's `textarea` should gain focus. Defaults to true.
	 */
	close(focusTextarea?: boolean): void
	/**
	 * Opens the search widget.
	 * @param focusInput Whether the widgets's search input should gain focus. Defaults to true.
	 */
	open(focusInput?: boolean): void
}

/**
 * Hook that adds a widget for search and replace functionality.
 * This requires styling from `prism-react-editor/search.css`.
 *
 * The widget can be opened/closed programmatically with the
 * `editor.extensions.searchWidget` object once effects have been run.
 */
const useSearchWidget = (editor: PrismEditor) => {
	const replaceAPI = useEditorReplace(editor, "pce-matches")
	useEffect(() => {
		let prevLength: number
		let useRegExp: boolean
		let matchCase: boolean
		let wholeWord: boolean
		let searchSelection: [number, number] | undefined
		let isOpen: boolean
		let currentSelection: InputSelection
		let prevUserSelection: InputSelection
		let prevMargin: number
		let selectNext = false
		let marginTop: number

		const searchContainer = template()
		const search = searchContainer.firstChild as HTMLDivElement
		const [toggle, div] = search.children as unknown as [HTMLButtonElement, HTMLDivElement]
		const rows = div.children
		const [findContainer, closeEl] = rows[0].children as unknown as [
			HTMLDivElement,
			HTMLButtonElement,
		]
		const [findInput, prevEl, nextEl, errorEl] = findContainer.children as unknown as [
			HTMLInputElement,
			HTMLButtonElement,
			HTMLButtonElement,
			HTMLDivElement,
		]
		const [replaceInput, replaceEl, replaceAllEl] = rows[1].children as unknown as [
			HTMLInputElement,
			HTMLButtonElement,
			HTMLButtonElement,
		]
		const [matchCount, useRegExpEl, matchCaseEl, wholeWordEl, inSelectionEl] = rows[2]
			.children as unknown as [
			HTMLDivElement,
			HTMLButtonElement,
			HTMLButtonElement,
			HTMLButtonElement,
			HTMLButtonElement,
		]
		const [current, , total] = matchCount.childNodes as unknown as Text[]

		const { textarea, container, getSelection, wrapper } = editor

		const startSearch = (selectMatch?: boolean) => {
			if (selectMatch && !isWebKit) textarea!.setSelectionRange(...prevUserSelection)
			const error = replaceAPI.search(
				findInput.value,
				matchCase,
				wholeWord,
				useRegExp,
				searchSelection,
			)
			const index = error ? -1 : selectNext ? replaceAPI.next() : replaceAPI.closest()

			updateNode(current, (index + 1) as any)
			updateNode(total, replaceAPI.matches.length as any)
			findContainer.classList.toggle("pce-error", !!error)

			if (error) errorEl.textContent = error
			else if (selectMatch || selectNext) replaceAPI.selectMatch(index, prevMargin)
		}

		const keydown = (e: KeyboardEvent) => {
			// F or G + Ctrl/Cmd
			if (e.keyCode >> 1 == 35 && getModifierCode(e) == (isMac ? 0b0100 : 0b0010)) {
				preventDefault(e)
				open()
				let [start, end] = getSelection()
				let value = editor.value
				let word =
					value.slice(start, end) ||
					/[_\p{N}\p{L}]*$/u.exec(getLineBefore(value, start))![0] +
						/^[_\p{N}\p{L}]*/u.exec(value.slice(start))![0]
				if (/^$|\n/.test(word)) startSearch()
				else {
					if (useRegExp) word = regexEscape(word)
					doc!.execCommand("insertText", false, word)
					findInput.select()
				}
			}
		}

		const cleanups = [
			addListener2(textarea!, "keydown", keydown),
			addListener2(textarea!, "beforeinput", () => {
				if (isOpen && searchSelection) currentSelection = getSelection()
			}),
			editor.on("selectionChange", selection => {
				if (isOpen && editor.focused) prevUserSelection = selection
			}),
			editor.on("update", () => {
				if (!isOpen) return
				if (searchSelection && currentSelection) {
					// This preserves the selection well for normal typing,
					// but for indenting, toggling comments, etc. it doesn't
					const diff = prevLength - (prevLength = editor.value.length)
					const end = currentSelection[1]

					if (end <= searchSelection[1]) {
						searchSelection[1] -= diff
						if (end <= searchSelection[0] - +(diff < 0)) searchSelection[0] -= diff
					}
				}
				startSearch()
			}),
		]

		const open = (focusInput = true) => {
			if (!isOpen) {
				isOpen = true
				if (marginTop == null) prevMargin = marginTop = getStyleValue(wrapper!, "marginTop")
				prevUserSelection = getSelection()
				addOverlay(editor, searchContainer)
				updateMargin()
				resize()
				observer?.observe(container!)
			}
			if (focusInput) findInput.select()
		}

		const close = (focusTextarea = true) => {
			if (isOpen) {
				isOpen = false
				observer?.disconnect()
				replaceAPI.stopSearch()
				searchContainer.remove()
				updateMargin()
				if (focusTextarea) textarea!.focus()
			}
		}

		const move = (next?: boolean) => {
			if (replaceAPI.matches[0]) {
				const index = replaceAPI[next ? "next" : "prev"]()
				replaceAPI.selectMatch(index, prevMargin)
				updateNode(current, (index + 1) as any)
			}
		}

		const updateMargin = () => {
			const newMargin = isOpen
				? getStyleValue(search, "top") + getStyleValue(search, "height")
				: marginTop
			const newScroll = container!.scrollTop + newMargin - prevMargin

			wrapper!.style.marginTop = isOpen ? newMargin + "px" : ""
			container!.scrollTop = newScroll
			prevMargin = newMargin
		}

		const resize = () =>
			div.style.setProperty(
				"--search-width",
				`min(${container!.clientWidth - 2}px - 2.9em,20em)`,
			)

		const observer = window.ResizeObserver && new ResizeObserver(resize)

		const replace = () => {
			selectNext = true
			const index = replaceAPI.replace(replaceInput.value)
			if (index != null) {
				updateNode(current, (index + 1) as any)
				replaceAPI.selectMatch(index, prevMargin)
			}
			selectNext = false
		}

		const replaceAll = () => {
			replaceAPI.replaceAll(replaceInput.value)
		}

		const keyCodeButtonMap: Record<string, HTMLButtonElement> = {
			80 /* P */: matchCaseEl,
			87 /* W */: wholeWordEl,
			82 /* R */: useRegExpEl,
			76 /* L */: inSelectionEl,
		}

		const elementHandlerMap = new Map<HTMLElement, () => void>([
			[nextEl, () => move(true)],
			[prevEl, move],
			[closeEl, close],
			[replaceEl, replace],
			[replaceAllEl, replaceAll],
			[
				toggle,
				() => {
					toggleAttr(toggle, "aria-expanded")
					updateMargin()
				},
			],
			[matchCaseEl, () => (matchCase = !matchCase)],
			[useRegExpEl, () => (useRegExp = !useRegExp)],
			[wholeWordEl, () => (wholeWord = !wholeWord)],
			[
				inSelectionEl,
				() => {
					const value = editor.value
					if (searchSelection) searchSelection = undefined
					else {
						searchSelection = <[number, number]>getSelection().slice(0, 2)

						if (numLines(value, ...searchSelection) > 1) {
							searchSelection = [
								getLineStart(value, searchSelection[0]),
								getLineEnd(value, searchSelection[1]),
							]
						}
					}
					prevLength = value.length
				},
			],
		])

		addListener(searchContainer, "click", e => {
			const target = e.target as HTMLElement
			const remove = editor.on("update", () => target.focus())
			elementHandlerMap.get(target)?.()
			if (target.matches(".pce-options>button")) {
				toggleAttr(target, "aria-pressed")
				startSearch(true)
			}
			remove()
		})

		addListener(findInput, "input", () => isOpen && startSearch(true))

		addListener(searchContainer, "keydown", e => {
			const shortcut = getModifierCode(e)
			const target = e.target as HTMLElement
			const keyCode = e.keyCode
			const isFind = target == findInput
			if (shortcut == (isMac ? 5 : 1)) {
				if (keyCodeButtonMap[keyCode]) {
					preventDefault(e)
					keyCodeButtonMap[keyCode].click()
				}
			} else if (keyCode == 13 && target.tagName == "INPUT") {
				preventDefault(e)
				if (!shortcut) isFind ? move(true) : replaceEl.click()
				else if (shortcut == 8 && isFind) move()
				else if (shortcut == (isMac ? 4 : 3) && !isFind) replaceAllEl.click()
				target.focus()
			} else if (!shortcut && keyCode == 27) close()
			else keydown(e)
		})

		editor.extensions.searchWidget = {
			open(focusInput) {
				open(focusInput)
				startSearch()
			},
			close,
		}

		return () => {
			delete editor.extensions.searchWidget
			cleanups.forEach(c => c())
			close(false)
		}
	}, [])
}

export { useSearchWidget }
