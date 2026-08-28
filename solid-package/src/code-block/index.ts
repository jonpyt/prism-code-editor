import { Accessor, createComponent, createMemo, createRenderEffect, For, JSX } from "solid-js"
import { highlightTokens, languages, tokenizeText, TokenStream } from "../prism/index"
import { insert, style, template } from "solid-js/web"

export type CodeBlockProps = {
	/**
	 * Language used for syntax highlighting. If the language doesn't have a registered
	 * Prism grammar, syntax highlighting will be disabled.
	 */
	language: string
	/** Code in the code block. */
	code: string
	/** Number of spaces a tab is equal to. @default 2 */
	tabSize?: number
	/** Whether or not to display line numbers. @default false */
	lineNumbers?: boolean
	/** Line number of the first line. @default 1 */
	lineNumberStart?: number
	/** Whether or not lines can wrap. @default false */
	wordWrap?: boolean
	/**
	 * Whether or not indentation is preserved on wrapped lines. When `true`, tabs are
	 * replaced with spaces since Chrome doesn't render tabs properly with this enabled.
	 * Defaults to `true` when `wordWrap` is enabled.
	 */
	preserveIndent?: boolean
	/**
	 * Whether or not to display indentation guides. Does support `wordWrap` unlike the
	 * `indentGuides()` editor extension. Does not work with `rtl`. @default false
	 */
	guideIndents?: boolean
	/**
	 * Whether the code block uses right to left directionality. Requires styles from
	 * `solid-prism-editor/rtl-layout.css` to work. @default false
	 */
	rtl?: boolean
	/** Inline styles for the container element. */
	style?: Omit<JSX.CSSProperties, "tab-size" | "counter-reset">
	/** Additional classes for the container element. */
	class?: string
	/**
	 * Callback that can be used to modify the tokens before they're stringified to HTML.
	 * Can be used to add rainbow brackets for example.
	 */
	onTokenize?(tokens: TokenStream): void
	/**
	 * Array of functions that can be used to modify the code block. Examples include
	 * adding a copy button, hover descriptions, and bracket pair highlighting on hover.
	 */
	overlays?: CodeBlockOverlay[]
}

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
	/** Reactive accessor for the code in the code block after normalizing white space. */
	readonly value: string
}

export type CodeBlockOverlay = (
	codeBlock: PrismCodeBlock,
	props: CodeBlockProps,
) => JSX.Element | void

const block = /* @__PURE__ */ template("<pre><code class=pce-wrapper><div class=pce-overlays>")
const line = /* @__PURE__ */ template("<div class=pce-line>")

/**
 * Component that creates a code block with syntax highlighting. Requires styles from
 * `solid-prism-editor/code-block.css` in addition to the normal layout.
 *
 * Syntax highlighting will be disabled if the language doesn't have a registered Prism
 * grammar.
 */
const CodeBlock = (props: CodeBlockProps) => {
	const hasGuides = () => props.guideIndents && !props.rtl
	const preserve = () => props.preserveIndent ?? props.wordWrap
	const normalized = createMemo(() => {
		const temp = preserve() ? props.code.replace(/\t/g, " ".repeat(props.tabSize || 2)) : props.code
		return temp.includes("\r") ? temp.replace(/\r\n?/g, "\n") : temp
	})
	const lines = createMemo(() => {
		const tokens = tokenizeText(normalized(), languages[props.language] || {})
		props.onTokenize?.(tokens)
		return highlightTokens(tokens).split("\n")
	})
	const container = block() as HTMLPreElement
	const wrapper = container.firstChild as HTMLElement
	const lineEls = wrapper.children as HTMLCollectionOf<HTMLDivElement>

	const indents = createMemo(() => {
		if (preserve() || hasGuides()) {
			const code = normalized()
			const tabSize = props.tabSize || 2
			const lines = code.split("\n")
			const l = lines.length
			const result: number[] = Array(l).fill(0)

			for (let prevIndent = 0, emptyPos = -1, i = 0; i < l; i++) {
				let line = lines[i]
				let l = line.search(/\S/)
				let indent = 0
				if (l < 0) {
					if (emptyPos < 0) emptyPos = i
				} else {
					for (let i = 0; i < l; ) {
						indent += line[i++] == "\t" ? tabSize - (indent % tabSize) : 1
					}
					if (emptyPos + 1) {
						if (indent != prevIndent) prevIndent = Math.min(indent, prevIndent) + 1
						while (emptyPos < i) {
							result[emptyPos++] = prevIndent
						}
					}
					result[i] = prevIndent = indent
					emptyPos = -1
				}
			}
			return result
		}
	})

	const codeBlock: PrismCodeBlock = {
		container,
		wrapper,
		lines: lineEls,
		get value() {
			return normalized()
		},
	}

	insert(
		lineEls[0],
		createComponent(For, {
			get each() {
				return props.overlays
			},
			children: (overlay: CodeBlockOverlay) => overlay(codeBlock, props)!,
		}),
		null,
	)

	insert(
		wrapper,
		createComponent(For, {
			get each() {
				return lines()
			},
			children: (html: string, i: Accessor<number>) => {
				const div = line() as HTMLDivElement
				div.innerHTML = html + "\n"
				createRenderEffect(() => {
					div.style.setProperty("--indent", `${indents()?.[i()] || 0}ch`)
				})
				return div
			},
		}),
		null,
	)

	createRenderEffect(() => {
		let propClass = props.class
		container.className = `prism-code-editor language-${props.language}${
			props.lineNumbers ? " show-line-numbers" : ""
		} pce-${props.wordWrap ? "" : "no"}wrap${props.rtl ? " pce-rtl" : ""}${
			preserve() ? " pce-preserve" : ""
		}${hasGuides() ? " pce-guides" : ""}${propClass ? " " + propClass : ""}`
	})

	createRenderEffect<Record<string, string>>(
		prev => style(container, props.style as Record<string, string>, prev)!,
	)

	createRenderEffect(() => {
		const style = container.style
		const offset = props.lineNumberStart! - 1 || 0
		style.setProperty("--tab-size", props.tabSize || (2 as any))
		style.setProperty("--number-width", (0 | Math.log10(lines().length + offset)) + 1 + ".001ch")
		style.counterReset = `line ${offset}`
	})

	return container
}

export * from "./brackets"
export * from "./copy"
export * from "./hover"
export { CodeBlock }
