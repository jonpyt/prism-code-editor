import {
	For,
	createComponent,
	createRenderEffect,
	createSignal,
	mergeProps,
	on,
	onMount,
	untrack,
} from "solid-js"
import type {
	EditorProps,
	Language,
	PrismEditor,
	InputCommandCallback,
	InputSelection,
	KeyCommandCallback,
	Extension,
} from "./types"
import { TokenStream, highlightTokens, languages, tokenizeText } from "./prism"
import { insert, style, template } from "solid-js/web"

/**
 * The core editor component of the library.
 * @param props Props to customize some of the appearance and behavior of the editor.
 * @returns The container for the editor.
 */
const Editor = (props: Partial<EditorProps>) => {
	let handleSelecionChange = true
	let activeLine: Element
	let prevLines: string[] = []
	let language = ""
	let value = ""
	let prevValue: string
	let prevClass: string
	let activeLineNumber = 0
	let lineCount = 0
	let isFirstRender = true
	let editorProps: EditorProps = mergeProps({ language: "text", value }, props)

	const container = editorTemplate() as HTMLDivElement
	const wrapper = container.firstChild as HTMLDivElement
	const lines = wrapper.children as HTMLCollectionOf<HTMLDivElement>
	const overlays = lines[0]
	const textarea = overlays.firstChild as HTMLTextAreaElement

	const getInputSelection = (): InputSelection => [
		textarea.selectionStart,
		textarea.selectionEnd,
		textarea.selectionDirection,
	]

	const [selection, setSelection] = createSignal(getInputSelection())
	const [focused, setFocused] = createSignal(false)
	const [tokens, setTokens] = createSignal<TokenStream>([])

	const updateSelection = (force?: boolean) => {
		if (force || handleSelecionChange) {
			const selection = getInputSelection()
			const newLine =
				lines[(activeLineNumber = numLines(value, 0, selection[selection[2] < "f" ? 0 : 1]))]

			if (newLine != activeLine) {
				activeLine?.classList.remove("active-line")
				newLine.classList.add("active-line")
				activeLine = newLine
			}

			setSelection(selection)
		}
	}

	const keyCommandMap: Record<string, KeyCommandCallback | null> = {
		Escape() {
			textarea.blur()
		},
	}

	const inputCommandMap: Record<string, InputCommandCallback | null> = {}

	const update = () => {
		setTokens(tokenizeText((value = textarea.value), languages[language] || {}))
	}

	const editor: PrismEditor = {
		inputCommandMap,
		keyCommandMap,
		extensions: {},
		props: editorProps,
		get value() {
			return value
		},
		selection,
		tokens,
		focused,
		get activeLine() {
			return activeLineNumber
		},
		container,
		wrapper,
		lines,
		textarea,
		update,
		getSelection: getInputSelection,
	}

	createRenderEffect(() => {
		let readOnly = !!editorProps.readOnly
		textarea.inputMode = readOnly ? "none" : ""
		textarea.setAttribute("aria-readonly", readOnly as any)
	})

	createRenderEffect(() => {
		let propClass = editorProps.class
		let newClass = `prism-code-editor language-${editorProps.language}${
			editorProps.lineNumbers == false ? "" : " show-line-numbers"
		} pce-${editorProps.wordWrap ? "" : "no"}wrap${editorProps.rtl ? " pce-rtl" : ""} pce-${
			selection()[0] < selection()[1] ? "has" : "no"
		}-selection${focused() ? " pce-focus" : ""}${editorProps.readOnly ? " pce-readonly" : ""}${
			propClass ? " " + propClass : ""
		}`
		if (prevClass != newClass) container.className = prevClass = newClass
	})

	createRenderEffect(() => {
		container.style.tabSize = editorProps.tabSize || (2 as any)
	})

	createRenderEffect(
		on(selection, s => {
			if (!isFirstRender) editorProps.onSelectionChange?.(s, value, editor)
		}),
	)

	createRenderEffect(() => {
		tokens()
		if (isFirstRender) return
		let newLines = highlightTokens(tokens()).split("\n")
		let start = 0
		let end2 = lineCount
		let end1 = (lineCount = newLines.length)

		// Manual dom manipulation is significantly faster here than using the <For> control flow
		while (newLines[start] == prevLines[start] && start < end1) ++start
		while (end1 && newLines[--end1] == prevLines[--end2]);

		if (start == end1 && start == end2) lines[start + 1].innerHTML = newLines[start] + "\n"
		else {
			let insertStart = end2 < start ? end2 : start - 1
			let i = insertStart
			let newHTML = ""

			while (i < end1) newHTML += `<div class=pce-line aria-hidden=true>${newLines[++i]}\n</div>`
			for (i = end1 < start ? end1 : start - 1; i < end2; i++) lines[start + 1].remove()
			if (newHTML) lines[insertStart + 1].insertAdjacentHTML("afterend", newHTML)
			container.style.setProperty("--number-width", Math.ceil(Math.log10(lineCount + 1)) + ".001ch")
		}

		updateSelection(true)
		if (handleSelecionChange) setTimeout(setTimeout, 0, () => (handleSelecionChange = true))

		prevLines = newLines
		handleSelecionChange = false
	})

	createRenderEffect(
		on(tokens, () => {
			if (!isFirstRender) editorProps.onUpdate?.(value, editor)
		}),
	)

	createRenderEffect(() => {
		let newValue = editorProps.value
		let isFocused = untrack(focused)
		if (prevValue != newValue) {
			if (!isFocused) textarea.remove()
			textarea.value = prevValue = newValue
			textarea.selectionEnd = 0
			if (!isFocused) overlays.prepend(textarea)
		}
		language = editorProps.language
		isFirstRender = false
		update()
	})

	createRenderEffect<Record<string, string>>(
		prev => style(container, props.style as Record<string, string>, prev)!,
	)

	onMount(() => {
		editorProps.onMount?.(editor)
	})

	addListener(textarea, "keydown", e => {
		keyCommandMap[e.key]?.(e, getInputSelection(), value) && preventDefault(e)
	})
	addListener(textarea, "beforeinput", e => {
		if (
			editorProps.readOnly ||
			(e.inputType == "insertText" && inputCommandMap[e.data!]?.(e, getInputSelection(), value))
		)
			preventDefault(e)
	})
	addListener(textarea, "input", update)
	addListener(textarea, "blur", () => {
		selectionChange = null
		setFocused(false)
	})

	addListener(textarea, "focus", () => {
		selectionChange = updateSelection
		setFocused(true)
	})

	// For browsers that support selectionchange on textareas
	addListener(textarea, "selectionchange", e => {
		updateSelection()
		preventDefault(e)
	})

	insert(
		overlays,
		createComponent(For, {
			get each() {
				return editorProps.extensions
			},
			children: (extension: Extension) => extension(editor)!,
		}),
		null,
	)

	return container
}

/** Equivalent to `document` in a browser setting, `null` otherwise. */
const doc = "u" > typeof window ? document : null

/** Object storing all language specific behavior. */
const languageMap: Record<string, Language> = {}

const editorTemplate = /* @__PURE__ */ template(
	"<div><div class=pce-wrapper><div class=pce-overlays><textarea class=pce-textarea spellcheck=false autocapitalize=off autocomplete=off>",
)

const preventDefault = (e: Event) => {
	e.preventDefault()
	e.stopImmediatePropagation()
}

const addListener = <T extends keyof HTMLElementEventMap>(
	target: HTMLElement,
	type: T,
	listener: (this: HTMLElement, ev: HTMLElementEventMap[T]) => any,
	options?: boolean | AddEventListenerOptions,
) => target.addEventListener(type, listener, options)

/**
 * Counts number of lines in the string between `start` and `end`.
 * If start and end are omitted, the whole string is searched.
 */
const numLines = (str: string, start = 0, end = Infinity) => {
	let count = 1
	for (; (start = str.indexOf("\n", start) + 1) && start <= end; count++);
	return count
}
// @ts-expect-error Allow adding listener to document
if (doc) addListener(doc, "selectionchange", () => selectionChange?.())

let selectionChange: null | ((force?: boolean) => void)

export { Editor, addListener, preventDefault, doc, languageMap, numLines, selectionChange }
