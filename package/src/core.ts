import type {
	EditorOptions,
	PrismEditor,
	KeyCommandCallback,
	Language,
	InputCommandCallback,
	EditorEventMap,
	InputSelection,
	EditorExtension,
} from "./types.js"
import { highlightTokens, languages, tokenizeText, TokenStream } from "./prism/index.js"

/**
 * Creates a code editor using the specified container and options.
 * @param container Element to append the editor to or a selector.
 * This can also be a `ShadowRoot` or `DocumentFragment` for example.
 * If omitted, you must manually append `editor.container` to the DOM.
 * @param options Options the editor is initialized with.
 * If omitted, the editor won't function until you call `editor.setOptions`.
 * @param extensions Extensions added before the first render. You can still add extensions later.
 * @returns Object to interact with the created editor.
 */
const createEditor = <T extends {} = {}>(
	container?: ParentNode | string | null,
	options?: (Partial<EditorOptions<T>> & Omit<T, keyof EditorOptions>) | null,
	...extensions: EditorExtension<T>[]
): PrismEditor<T> => {
	let language: string
	let prevLines: string[] = []
	let activeLine: HTMLDivElement
	let value = ""
	let activeLineNumber: number
	let focused = false
	let handleSelectionChange = true
	let tokens: TokenStream = []
	let readOnly: boolean
	let lineCount = 0

	const scrollContainer = editorTemplate()
	const wrapper = <HTMLDivElement>scrollContainer.firstChild
	const lines = <HTMLCollectionOf<HTMLDivElement>>wrapper.children
	const overlays = lines[0]
	const textarea = <HTMLTextAreaElement>overlays.firstChild
	const currentOptions = { language: "text", value } as EditorOptions & T
	const currentExtensions = new Set(extensions)
	const listeners: {
		[P in keyof EditorEventMap]?: Set<EditorEventMap<T>[P]>
	} = {}

	const setOptions = (options: Partial<EditorOptions> & Partial<Omit<T, keyof EditorOptions>>) => {
		Object.assign(currentOptions, options)
		let isNewVal = value != (value = options.value ?? value)
		let isNewLang = language != (language = currentOptions.language)

		readOnly = !!currentOptions.readOnly
		scrollContainer.style.tabSize = <any>currentOptions.tabSize || 2
		textarea.inputMode = readOnly ? "none" : ""
		textarea.setAttribute("aria-readonly", <any>readOnly)
		updateClassName()
		updateExtensions()

		if (isNewVal) {
			if (!focused) textarea.remove()
			textarea.value = value
			textarea.selectionEnd = 0
			if (!focused) overlays.prepend(textarea)
		}

		if (isNewVal || isNewLang) {
			update()
		}
	}

	const update = () => {
		tokens = tokenizeText((value = textarea.value), languages[language] || {})
		dispatchEvent("tokenize", tokens, language, value)

		let newLines = highlightTokens(tokens).split("\n")
		let start = 0
		let end2 = lineCount
		let end1 = (lineCount = newLines.length)

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
			scrollContainer.style.setProperty(
				"--number-width",
				(0 | Math.log10(lineCount)) + 1 + ".001ch",
			)
		}

		dispatchEvent("update", value)
		dispatchSelection(true)
		if (handleSelectionChange) setTimeout(setTimeout, 0, () => (handleSelectionChange = true))

		prevLines = newLines
		handleSelectionChange = false
	}

	const updateExtensions = (newExtensions?: EditorExtension<T>[]) => {
		;(newExtensions || currentExtensions).forEach(extension => {
			if (typeof extension == "object") {
				extension.update(self, currentOptions)
				if (newExtensions) currentExtensions.add(extension)
			} else {
				extension(self, currentOptions)
				if (!newExtensions) currentExtensions.delete(extension)
			}
		})
	}

	const updateClassName = ([start, end] = getInputSelection()) => {
		scrollContainer.className = `prism-code-editor language-${language}${
			currentOptions.lineNumbers == false ? "" : " show-line-numbers"
		} pce-${currentOptions.wordWrap ? "" : "no"}wrap${currentOptions.rtl ? " pce-rtl" : ""} pce-${
			start < end ? "has" : "no"
		}-selection${focused ? " pce-focus" : ""}${readOnly ? " pce-readonly" : ""}${
			currentOptions.class ? " " + currentOptions.class : ""
		}`
	}

	const getInputSelection = (): InputSelection => [
		textarea.selectionStart,
		textarea.selectionEnd,
		textarea.selectionDirection,
	]

	const keyCommandMap: Record<string, KeyCommandCallback | null> = {
		Escape() {
			textarea.blur()
		},
	}

	const inputCommandMap: Record<string, InputCommandCallback | null> = {}

	const dispatchEvent = <T extends keyof EditorEventMap>(
		name: T,
		...args: Parameters<EditorEventMap[T]>
	) => {
		// @ts-expect-error
		listeners[name]?.forEach(handler => handler.apply(self, args))
		// @ts-expect-error
		currentOptions["on" + name[0].toUpperCase() + name.slice(1)]?.(...args, self)
	}

	const dispatchSelection = (force?: boolean) => {
		if (force || handleSelectionChange) {
			const selection = getInputSelection()
			const newLine =
				lines[(activeLineNumber = numLines(value, 0, selection[selection[2] < "f" ? 0 : 1]))]

			if (newLine != activeLine) {
				activeLine?.classList.remove("active-line")
				newLine.classList.add("active-line")
				activeLine = newLine
			}
			updateClassName(selection)
			dispatchEvent("selectionChange", selection, value)
		}
	}

	const self: PrismEditor<T> = {
		container: scrollContainer,
		wrapper,
		lines,
		textarea,
		get activeLine() {
			return activeLineNumber
		},
		get value() {
			return value
		},
		options: currentOptions,
		get focused() {
			return focused
		},
		get tokens() {
			return tokens
		},
		inputCommandMap,
		keyCommandMap,
		extensions: {},
		setOptions,
		update,
		getSelection: getInputSelection,
		addExtensions(...extensions) {
			updateExtensions(extensions)
		},
		on: (name, handler) => {
			;(listeners[name] ||= new Set<any>()).add(handler)
			return () => listeners[name]!.delete(handler)
		},
		remove() {
			scrollContainer.remove()
		},
	}

	addListener(textarea, "keydown", e => {
		keyCommandMap[e.key]?.(e, getInputSelection(), value) && preventDefault(e)
	})

	addListener(textarea, "beforeinput", e => {
		if (
			readOnly ||
			(e.inputType == "insertText" && inputCommandMap[e.data!]?.(e, getInputSelection(), value))
		)
			preventDefault(e)
	})
	addListener(textarea, "input", update)
	addListener(textarea, "blur", () => {
		selectionChange = null
		focused = false
		updateClassName()
	})
	addListener(textarea, "focus", () => {
		selectionChange = dispatchSelection
		focused = true
		updateClassName()
	})
	// For browsers that support selectionchange on textareas
	addListener(textarea, "selectionchange", e => {
		dispatchSelection()
		preventDefault(e)
	})

	getElement(container)?.append(scrollContainer)
	options && setOptions(options)
	return self
}

/**
 * Almost identical to {@link createEditor}, but instead of appending the editor to your
 * element, the editor replaces it.
 *
 * The `textContent` of the placeholder will be the code in the editor unless `options.value` is defined.
 * @param placeholder Node or selector which will be replaced by the editor.
 * @param options Options the editor is initialized with.
 * @param extensions Extensions added before the first render. You can still add extensions later.
 * @returns Object to interact with the created editor.
 */
const editorFromPlaceholder = <T extends {} = {}>(
	placeholder: string | ChildNode,
	options: Partial<EditorOptions<T>> & Omit<T, keyof EditorOptions>,
	...extensions: EditorExtension<T>[]
) => {
	const el = getElement(placeholder)!
	const editor = createEditor<T>(
		null,
		Object.assign({ value: el.textContent }, options),
		...extensions,
	)
	el.replaceWith(editor.container)
	return editor
}

/** Equivalent to `document` in a browser setting, `null` otherwise. */
const doc = "u" > typeof window ? document : null

const templateEl = /* @__PURE__ */ doc?.createElement("div")

const createTemplate = <T extends Element = HTMLDivElement>(html: string, node?: Node) => {
	if (templateEl) {
		templateEl.innerHTML = html
		node = templateEl.firstChild!
	}
	return () => <T>node!.cloneNode(true)
}

const addListener = <T extends keyof HTMLElementEventMap>(
	target: HTMLElement,
	type: T,
	listener: (this: HTMLElement, ev: HTMLElementEventMap[T]) => any,
	options?: boolean | AddEventListenerOptions,
) => target.addEventListener(type, listener, options)

const getElement = <T extends Node>(el?: T | string | null) =>
	typeof el == "string" ? doc!.querySelector<HTMLElement>(el) : el

/**
 * Counts number of lines in the string between `start` and `end`.
 * If start and end are omitted, the whole string is searched.
 */
const numLines = (str: string, start = 0, end = Infinity) => {
	let count = 1
	for (; (start = str.indexOf("\n", start) + 1) && start <= end; count++);
	return count
}

/** Object storing all language specific behavior. */
const languageMap: Record<string, Language> = {}

const editorTemplate = /* @__PURE__ */ createTemplate(
	"<div><div class=pce-wrapper><div class=pce-overlays><textarea class=pce-textarea spellcheck=false autocapitalize=off autocomplete=off>",
)

const preventDefault = (e: Event) => {
	e.preventDefault()
	e.stopImmediatePropagation()
}

const setSelectionChange = (f?: (force?: boolean) => void) => (selectionChange = f)

let selectionChange: null | undefined | ((force?: boolean) => void)

// @ts-expect-error Allow adding listener to document
if (doc) addListener(doc, "selectionchange", () => selectionChange?.())

export {
	createEditor,
	languageMap,
	numLines,
	createTemplate,
	getElement,
	preventDefault,
	editorFromPlaceholder,
	addListener,
	selectionChange,
	setSelectionChange,
	doc,
}
