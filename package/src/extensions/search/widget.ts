import { InputSelection, BasicExtension } from "../../index.js"
import { createTemplate, preventDefault, addListener, numLines, doc } from "../../core.js"
import {
	regexEscape,
	getModifierCode,
	isMac,
	isWebKit,
	addOverlay,
	getLineBefore,
} from "../../utils/index.js"
import { createReplaceAPI } from "./replace.js"
import { getLineEnd, getLineStart, getStyleValue, updateNode } from "../../utils/local.js"

const shortcut = ` (Alt+${isMac ? "Cmd+" : ""}`

const template = /* @__PURE__ */ createTemplate(
	`<div class=prism-search-container style=display:flex;align-items:flex-start;justify-content:flex-end><div dir=ltr class=prism-search><button type=button aria-expanded=false title="Toggle Replace" class=pce-expand></button><div spellcheck=false><div><div class="pce-input pce-find"><input autocorrect=off autocapitalize=off placeholder=Find aria-label=Find><button type=button class=pce-prev title="Previous Match (Shift+Enter)"></button><button type=button class=pce-next title="Next Match (Enter)"></button><div class=search-error></div></div><button type=button class=pce-close title="Close (Esc)"></button></div><div class="pce-input pce-replace"><input autocorrect=off autocapitalize=off placeholder=Replace aria-label=Replace><button type=button title=(Enter)>Replace</button><button type=button title=(${
		isMac ? "Cmd" : "Ctrl+Alt"
	}+Enter)>All</button></div><div class=pce-options><div class=pce-match-count>0<span> of </span>0</div><button type=button aria-pressed=false class=pce-regex title="RegExp Search${shortcut}R)"><span aria-hidden=true></span></button><button type=button aria-pressed=false title="Preserve Case${shortcut}P)"><span aria-hidden=true>Aa</span></button><button type=button aria-pressed=false class=pce-whole title="Match Whole Word${shortcut}W)"><span aria-hidden=true>ab</span></button><button type=button aria-pressed=false class=pce-in-selection title="Find in Selection${shortcut}L)">`,
)

const toggleAttr = (el: Element, name: string) =>
	el.setAttribute(name, <any>(el.getAttribute(name) == "false"))

export interface SearchWidget extends BasicExtension {
	/** The search widget's outer element. */
	readonly element: HTMLDivElement
	/**
	 * Hides the search widget and removes most event listeners.
	 * @param focusTextarea Whether the editor's `textarea` should gain focus. Defaults to true.
	 */
	close: (focusTextarea?: boolean) => void
	/**
	 * Opens the search widget.
	 * @param focusInput Whether the widgets's search input should gain focus. Defaults to true.
	 */
	open: (focusInput?: boolean) => void
}

/**
 * Extension that adds a widget for search and replace functionality.
 * This extension needs styles from `prism-code-editor/search.css`.
 *
 * Once added to an editor the widget can be opened/closed programmatically with the
 * `editor.extensions.searchWidget` object.
 */
export const searchWidget = (): SearchWidget => {
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

	const self: SearchWidget = editor => {
		editor.extensions.searchWidget = self

		const { textarea, wrapper, container, getSelection } = editor
		const replaceAPI = createReplaceAPI(editor)

		const startSearch = (selectMatch?: boolean) => {
			if (selectMatch && !isWebKit) textarea.setSelectionRange(...prevUserSelection)
			const error = replaceAPI.search(
				findInput.value,
				matchCase,
				wholeWord,
				useRegExp,
				searchSelection,
			)
			const index = error ? -1 : selectNext ? replaceAPI.next() : replaceAPI.closest()

			// @ts-expect-error Allow type coercion
			updateNode(current, index + 1)
			// @ts-expect-error Allow type coercion
			updateNode(total, replaceAPI.matches.length)
			findContainer.classList.toggle("pce-error", !!error)

			if (error) errorEl.textContent = error
			else if (selectMatch || selectNext) replaceAPI.selectMatch(index, prevMargin)
		}

		const keydown = (e: KeyboardEvent) => {
			// F or G + Ctrl/Cmd
			if (e.keyCode >> 1 == 35 && getModifierCode(e) == (isMac ? 0b0100 : 0b0010)) {
				preventDefault(e)
				open()
				let [start, end] = getSelection(),
					value = editor.value,
					word =
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

		const open = (focusInput = true) => {
			if (!isOpen) {
				isOpen = true
				if (marginTop == null) prevMargin = marginTop = getStyleValue(wrapper, "marginTop")
				prevUserSelection = getSelection()
				addOverlay(editor, searchContainer)
				updateMargin()
				resize()
				observer?.observe(container)
			}
			if (focusInput) findInput.select()
		}

		const close = (self.close = (focusTextarea = true) => {
			if (isOpen) {
				isOpen = false
				replaceAPI.stopSearch()
				searchContainer.remove()
				updateMargin()
				observer?.disconnect()
				focusTextarea && textarea.focus()
			}
		})

		const move = (next?: boolean) => {
			if (replaceAPI.matches[0]) {
				const index = replaceAPI[next ? "next" : "prev"]()
				replaceAPI.selectMatch(index, prevMargin)
				// @ts-expect-error Allow type coercion
				updateNode(current, index + 1)
			}
		}

		const updateMargin = () => {
			const newMargin = isOpen
				? getStyleValue(search, "top") + getStyleValue(search, "height")
				: marginTop
			const newScroll = container.scrollTop + newMargin - prevMargin

			wrapper.style.marginTop = isOpen ? newMargin + "px" : ""
			container.scrollTop = newScroll
			prevMargin = newMargin
		}

		const resize = () =>
			div.style.setProperty(
				"--search-width",
				`min(${container.clientWidth - 2}px - 2.4em - var(--padding-left),20em)`,
			)

		const observer = window.ResizeObserver && new ResizeObserver(resize)

		const replace = () => {
			selectNext = true
			const index = replaceAPI.replace(replaceInput.value)
			if (index != null) {
				// @ts-expect-error Allow type coercion
				updateNode(current, index + 1)
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

		const elementHandlerMap = new Map<HTMLElement, () => any>([
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

		addListener(textarea, "keydown", keydown)
		addListener(textarea, "beforeinput", () => {
			if (isOpen && searchSelection) currentSelection = getSelection()
		})
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
		})
		editor.on("selectionChange", selection => {
			if (isOpen && editor.focused) prevUserSelection = selection
		})

		addListener(searchContainer, "click", e => {
			const target = <HTMLElement>e.target
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
			const target = <HTMLElement>e.target
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

		self.open = focusInput => {
			open(focusInput)
			startSearch()
		}

		replaceAPI.container.className = "pce-matches"
	}

	const searchContainer = <HTMLDivElement>template()
	// @ts-expect-error
	const search = (self.element = <HTMLDivElement>searchContainer.firstChild)
	const [toggle, div] = <[HTMLButtonElement, HTMLDivElement]>(<unknown>search.children)
	const rows = div.children
	const [findContainer, closeEl] = <[HTMLDivElement, HTMLButtonElement]>(<unknown>rows[0].children)
	const [findInput, prevEl, nextEl, errorEl] = <
		[HTMLInputElement, HTMLButtonElement, HTMLButtonElement, HTMLDivElement]
	>(<unknown>findContainer.children)
	const [replaceInput, replaceEl, replaceAllEl] = <
		[HTMLInputElement, HTMLButtonElement, HTMLButtonElement]
	>(<unknown>rows[1].children)
	const [matchCount, useRegExpEl, matchCaseEl, wholeWordEl, inSelectionEl] = <
		[HTMLDivElement, HTMLButtonElement, HTMLButtonElement, HTMLButtonElement, HTMLButtonElement]
	>(<unknown>rows[2].children)
	const [current, , total] = <Text[]>(<unknown>matchCount.childNodes)

	self.open = self.close = () => {}

	return self
}
