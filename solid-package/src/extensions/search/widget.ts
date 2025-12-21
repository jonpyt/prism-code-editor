import { createEffect, createSignal, on, onCleanup, onMount, untrack } from "solid-js"
import { addListener, doc, numLines, preventDefault } from "../../core"
import { Extension, InputSelection } from "../../types"
import { createReplaceAPI } from "./replace"
import { addTextareaListener, getLineEnd, getLineStart, updateNode } from "../../utils/local"
import { getLineBefore, getModifierCode, isMac, isWebKit, regexEscape } from "../../utils"
import { getStyleValue } from "../../utils/other"
import { TokenStream } from "../../prism"
import { template as _template } from "solid-js/web"

const shortcut = ` (Alt+${isMac ? "Cmd+" : ""}`

const template = /* @__PURE__ */ _template(
	`<div class=prism-search-container style=display:none;align-items:flex-start;justify-content:flex-end><div dir=ltr class=prism-search><button type=button aria-expanded=false title="Toggle Replace" class=pce-expand></button><div spellcheck=false><div><div class="pce-input pce-find"><input autocorrect=off autocapitalize=off placeholder=Find aria-label=Find><button type=button class=pce-prev title="Previous Match (Shift+Enter)"></button><button type=button class=pce-next title="Next Match (Enter)"></button><div class=search-error></div></div><button type=button class=pce-close title="Close (Esc)"></button></div><div class="pce-input pce-replace"><input autocorrect=off autocapitalize=off placeholder=Replace aria-label=Replace><button type=button title=(Enter)>Replace</button><button type=button title=(${
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
	close: (focusTextarea?: boolean) => void
	/**
	 * Opens the search widget.
	 * @param focusInput Whether the widgets's search input should gain focus. Defaults to true.
	 */
	open: (focusInput?: boolean) => void
}

/**
 * Extension that adds a widget for search and replace functionality.
 * This extension needs styles from `solid-prism-editor/search.css`.
 *
 * Once added to an editor the widget can be opened/closed programmatically with the
 * `editor.extensions.searchWidget` object.
 */
export const searchWidget = (): Extension => editor => {
	let currentSelection: InputSelection
	let prevUserSelection: InputSelection
	let prevLength = 0
	let prevMargin: number
	let selectNext = false
	let marginTop: number
	let prevTokens: TokenStream
	let matchCase: boolean
	let wholeWord: boolean
	let useRegExp: boolean
	let searchSelection: [number, number] | undefined

	const searchContainer = template() as HTMLDivElement
	const search = searchContainer.firstChild as HTMLDivElement
	const [toggle, div] = search.children as any as [HTMLButtonElement, HTMLDivElement]
	const rows = div.children
	const [findContainer, closeEl] = rows[0].children as any as [HTMLDivElement, HTMLButtonElement]
	const [findInput, prevEl, nextEl, errorEl] = findContainer.children as any as [
		HTMLInputElement,
		HTMLButtonElement,
		HTMLButtonElement,
		HTMLDivElement,
	]
	const [replaceInput, replaceEl, replaceAllEl] = rows[1].children as any as [
		HTMLInputElement,
		HTMLButtonElement,
		HTMLButtonElement,
	]
	const [matchCount, useRegExpEl, matchCaseEl, wholeWordEl, inSelectionEl] = rows[2]
		.children as any as [
		HTMLDivElement,
		HTMLButtonElement,
		HTMLButtonElement,
		HTMLButtonElement,
		HTMLButtonElement,
	]
	const [current, , total] = matchCount.childNodes as any as Text[]

	const { textarea, container, getSelection, wrapper } = editor
	const replaceAPI = createReplaceAPI(editor)
	const replaceContainer = replaceAPI.container

	const [isOpen, setOpen] = createSignal(false)
	const keyCodeButtonMap: Record<string, HTMLButtonElement> = {
		80 /* P */: matchCaseEl,
		87 /* W */: wholeWordEl,
		82 /* R */: useRegExpEl,
		76 /* L */: inSelectionEl,
	}

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

	const move = (next?: boolean) => {
		if (replaceAPI.matches[0]) {
			const index = replaceAPI[next ? "next" : "prev"]()
			replaceAPI.selectMatch(index, prevMargin)
			// @ts-expect-error Allow type coercion
			updateNode(current, index + 1)
		}
	}

	const updateMargin = () => {
		const newMargin = untrack(isOpen)
			? getStyleValue(search, "top") + getStyleValue(search, "height")
			: marginTop
		const newScroll = container.scrollTop + newMargin - prevMargin

		wrapper.style.marginTop = newMargin + "px"
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
		let index = replaceAPI.replace(replaceInput.value)
		if (index != null) {
			replaceAPI.selectMatch(index, prevMargin)
			// @ts-expect-error Allow type coercion
			updateNode(current, index + 1)
		}
		selectNext = false
	}

	const replaceAll = () => {
		replaceAPI.replaceAll(replaceInput.value)
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

	const open = (focusInput = true) => {
		if (!untrack(isOpen)) {
			if (marginTop == null) {
				prevMargin = marginTop = getStyleValue(wrapper, "marginTop")
			}
			prevUserSelection = getSelection()
			searchContainer.style.display = "flex"
			observer?.observe(container!)
			setOpen(true)
			updateMargin()
			resize()
		}
		if (focusInput) findInput.select()
	}

	const close = (focusTextarea = true) => {
		if (untrack(isOpen)) {
			searchContainer.style.display = "none"
			observer?.disconnect()
			focusTextarea && textarea.focus()
			replaceAPI.stopSearch()
			setOpen(false)
			updateMargin()
		}
	}

	const removeKeydown = addTextareaListener(editor, "keydown", keydown)
	const removeBeforeinput = addTextareaListener(editor, "beforeinput", () => {
		if (isOpen() && searchSelection) currentSelection = getSelection()
	})

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
					searchSelection = getSelection().slice(0, 2) as [number, number]

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

	createEffect(() => {
		if (isOpen() && editor.focused()) prevUserSelection = editor.selection()
	})

	createEffect(
		on(editor.selection, () => {
			if (isOpen() && editor.tokens() != prevTokens) {
				const value = editor.value
				if (searchSelection && currentSelection) {
					// This preserves the selection well for normal typing,
					// but for indenting, toggling comments, etc. it doesn't
					const diff = prevLength - (prevLength = value.length)
					const [, end] = currentSelection
					const [searchStart, searchEnd] = searchSelection

					if (end <= searchEnd) {
						searchSelection[1] -= diff
						if (end <= searchStart - +(diff < 0)) searchSelection[0] -= diff
					}
				}
				startSearch()
				prevTokens = editor.tokens()
			}
		}),
	)

	editor.extensions.searchWidget = {
		open(focusInput) {
			open(focusInput)
			startSearch()
		},
		close,
	}

	searchContainer.addEventListener("click", e => {
		const target = e.target as HTMLElement
		const remove = addTextareaListener(editor, "input", () => target.focus(), true)
		elementHandlerMap.get(target)?.()
		if (target.matches(".pce-options>button")) {
			toggleAttr(target, "aria-pressed")
			startSearch(true)
		}
		remove()
	})

	addListener(findInput, "input", () => isOpen() && startSearch(true))

	searchContainer.addEventListener("keydown", e => {
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

	onCleanup(() => {
		removeKeydown()
		removeBeforeinput()
		observer?.disconnect()
		delete editor.extensions.searchWidget
	})

	replaceContainer.className = "pce-matches"

	return [searchContainer, replaceContainer]
}
