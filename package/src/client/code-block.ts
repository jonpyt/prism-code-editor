/** @module code-blocks */

import { addListener, doc } from "../core.js"
import { createCopyButton } from "../extensions/copyButton/index.js"
import { addOverlay } from "../utils/index.js"

export type PrismCodeBlock = {
	/** Outermost element of the code block. */
	readonly container: HTMLPreElement
	/** `<code>` element wrapping the lines and overlays. */
	readonly wrapper: HTMLElement
	/**
	 * Collection containing the overlays as the first element. The rest of the elements
	 * are the code lines. This means the first line starts at index 1.
	 */
	readonly lines: HTMLCollectionOf<HTMLDivElement>
	/** The code of the code block. */
	readonly code: string
	/** The language of the code block. */
	readonly language: string
}

/**
 * Runs a callback function for each code block under the root in document order. If a
 * callback has previously been run for a code block, it's skipped.
 *
 * The callback function takes the code block as the first argument. The second parameter
 * is any additional properties passed when the code block was created. These options
 * were stringified to JSON and parsed.
 * @param root Root to search for code blocks under.
 * @param callback Function to run for each code block.
 * @returns An array with all visited code blocks in document order.
 */
const forEachCodeBlock = <T extends {}>(
	root: Document | Element,
	callback: (codeBlock: PrismCodeBlock, options: T) => void,
) => {
	let els = root.getElementsByClassName("prism-code-editor") as HTMLCollectionOf<HTMLPreElement>
	let i = 0
	let result: PrismCodeBlock[] = []

	while (i < els.length) {
		const element = els[i++]
		const json = element.dataset.props

		if (!json) continue

		const wrapper = element.firstChild as HTMLElement
		const lines = wrapper.children as HTMLCollectionOf<HTMLDivElement>
		const code = wrapper.textContent!.slice(0, -1)
		const codeBlock = {
			container: element,
			wrapper,
			lines,
			code,
			language: /language-(\S*)/.exec(element.className)![1],
		}

		element.removeAttribute("data-props")
		callback(codeBlock, JSON.parse(json))
		result.push(codeBlock)
	}

	return result
}

/**
 * @param selector Selector used to specify which lines to omit from the resulting code.
 * @returns A function that returns the code inside a code block without any lines that
 * match the specified selector.
 */
const omitLines = (selector: string) => (codeBlock: PrismCodeBlock) => {
	let result = ""
	let lines = codeBlock.lines
	let i = 0
	let line: HTMLDivElement
	while ((line = lines[++i])) {
		if (!line.matches(selector)) result += line.textContent
	}
	return result.slice(0, -1)
}

/**
 * Adds a copy button to a code block. Requires styles from
 * `prism-code-editor/copy-button.css`.
 *
 * By default, the copy button is only shown when the code block is hovered. To always
 * show it, change the default opacity with the following CSS:
 *
 * ```less
 * button.pce-copy {
 *   opacity: 1; // or a lower value for a semi-transparent button
 * }
 * ```
 * @param codeBlock Code block to add the copy button to.
 * @param getCode Function used to get the copied code. Can be used to e.g. omit deleted
 * lines.
 */
const addCopyButton = (
	codeBlock: PrismCodeBlock,
	getCode?: (codeBlock: PrismCodeBlock) => string,
) => {
	const container = createCopyButton()
	const btn = container.firstChild as HTMLButtonElement

	addListener(btn, "click", () => {
		btn.setAttribute("aria-label", "Copied!")
		if (!navigator.clipboard?.writeText(getCode ? getCode(codeBlock) : codeBlock.code)) {
			const selection = getSelection()!
			const range = new Range()
			selection.removeAllRanges()
			selection.addRange(range)
			range.setStartAfter(codeBlock.lines[0])
			range.setEndAfter(codeBlock.wrapper)
			doc!.execCommand("copy")
			range.collapse()
		}
	})

	addListener(btn, "pointerenter", () => btn.setAttribute("aria-label", "Copy"))

	addOverlay(codeBlock, container)
}

export { forEachCodeBlock, addCopyButton, omitLines }
export * from "./hover.js"
