import {
	EditorEventMap,
	EditorExtension,
	EditorOptions,
	InputCommandCallback,
	InputSelection,
	KeyCommandCallback,
	numLines,
	PrismEditor,
} from "../index.js"
import { addListener, preventDefault, setSelectionChange } from "../core.js"
import { highlightTokens, languages, tokenizeText, TokenStream } from "../prism/index.js"
import { renderEditor } from "../ssr/index.js"

/**
 * Mounts all editors rendered by {@link renderEditor} under the specified root. Editors
 * are mounted in document order, and editors that have already been mounted are skipped.
 *
 * @param root Root element to search for editors under.
 * @param getExtensions Function used to get the extensions that should be added to each
 * editor. If the editors were created with extra options, these will be parsed from
 * JSON and passed to this function together with all other editor options. This is very
 * useful if you want to configure different extensions for different editors.
 * @returns Array of the mounted editors. These editors are in document order.
 */
const mountEditorsUnder = <T extends {} = {}>(
	root: Document | Element,
	getExtensions?: (options: EditorOptions & T) => EditorExtension<T>[] | undefined | null,
) => {
	let els = root.getElementsByClassName("prism-code-editor") as HTMLCollectionOf<HTMLDivElement>
	let i = 0
	let result: PrismEditor<T>[] = []

	while (i < els.length) {
		const element = els[i++]
		const dataset = element.dataset
		const json = dataset.options

		if (!json) continue

		let wrapper = element.firstChild as HTMLDivElement
		let lines = wrapper.children as HTMLCollectionOf<HTMLDivElement>
		let overlays = lines[0]
		let textarea = overlays.firstChild as HTMLTextAreaElement
		let language: string
		let prevLines: string[]
		let activeLine: HTMLDivElement
		let value: string
		let activeLineNumber: number
		let focused = textarea.matches(":focus")
		let handleSelectionChange = true
		let tokens: TokenStream = []
		let readOnly: boolean
		let lineCount: number
		let classPropStart = dataset.start
		let prevClass = element.className
		let html = ""
		let j = 1

		const style = element.style
		const currentOptions = {} as EditorOptions & T
		const listeners: {
			[P in keyof EditorEventMap]?: Set<EditorEventMap[P]>
		} = {}

		const tempClass = prevClass.slice(0, classPropStart as number | undefined)
		const tempOptions: EditorOptions & T = Object.assign(
			{
				language: /language-(\S*)/.exec(tempClass)![1],
				value: element.textContent!.slice(overlays.textContent!.length, -1),
				lineNumbers: tempClass.includes(" show"),
				readOnly: tempClass.includes(" pce-read"),
				rtl: tempClass.includes(" pce-rtl"),
				tabSize: +style.tabSize,
				wordWrap: tempClass.includes(" pce-wrap"),
				class: classPropStart && prevClass.slice(+classPropStart),
			},
			JSON.parse(json),
		)

		const currentExtensions = new Set(getExtensions?.(tempOptions))

		const setOptions = (options: Partial<EditorOptions & T>) => {
			Object.assign(currentOptions, options)
			let isNewVal = value != (value = options.value ?? value)
			let isNewLang = language != (language = currentOptions.language)

			readOnly = !!currentOptions.readOnly
			style.tabSize = <any>currentOptions.tabSize || 2
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
				style.setProperty("--number-width", (0 | Math.log10(lineCount)) + 1 + ".001ch")
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
			let classProp = currentOptions.class
			let newClass = `prism-code-editor language-${language}${
				currentOptions.lineNumbers == false ? "" : " show-line-numbers"
			} pce-${currentOptions.wordWrap ? "" : "no"}wrap${currentOptions.rtl ? " pce-rtl" : ""} pce-${
				start < end ? "has" : "no"
			}-selection${focused ? " pce-focus" : ""}${readOnly ? " pce-readonly" : ""}${
				classProp ? " " + classProp : ""
			}`
			if (newClass != prevClass) element.className = prevClass = newClass
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
			currentOptions["on" + name[0].toUpperCase() + name.slice(1)]?.apply(self, args)
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
			container: element,
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
				element.remove()
			},
		}

		lineCount = lines.length - 1
		while (j <= lineCount) {
			html += lines[j++].innerHTML
		}

		prevLines = html
			.slice(0, -1)
			.replace(/&gt;/g, ">")
			.replace(/&nbsp;/g, "\xa0")
			.split("\n")

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
			setSelectionChange()
			focused = false
			updateClassName()
		})
		addListener(textarea, "focus", () => {
			setSelectionChange(dispatchSelection)
			focused = true
			updateClassName()
		})
		// For browsers that support selectionchange on textareas
		addListener(textarea, "selectionchange", e => {
			dispatchSelection()
			preventDefault(e)
		})

		delete dataset.options
		setOptions(tempOptions)
		result.push(self)
	}

	return result
}

export { mountEditorsUnder }
