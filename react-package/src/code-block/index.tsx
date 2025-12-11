import { createContext, ReactNode, useMemo, JSX, useContext } from "react"
import { highlightTokens, languages, tokenizeText, TokenStream } from "../prism"
import { useStableRef } from "../core"

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
	 * `IndentGuides` editor extension. Does not work with `rtl`. @default false
	 */
	guideIndents?: boolean
	/**
	 * Whether the code block uses right to left directionality. Requires styles from
	 * `prism-react-editor/rtl-layout.css` to work. @default false
	 */
	rtl?: boolean
	/** Inline styles for the container element. */
	style?: Omit<React.CSSProperties, "tabSize" | "counterReset">
	/** Additional classes for the container element. */
	className?: string
	/**
	 * Callback that can be used to modify the tokens before they're stringified to HTML.
	 * Can be used to add rainbow brackets for example.
	 */
	onTokenize?(tokens: TokenStream): void
	/**
	 * Components that modify the code block. Examples include adding a copy button, hover
	 * descriptions, and bracket pair highlighting on hover.
	 */
	children?: ReactNode
}

export type PrismCodeBlock = {
	/** Outermost element of the code block. */
	container?: HTMLPreElement
	/** `<code>` element wrapping the lines and overlays. */
	wrapper?: HTMLElement
	/**
	 * Collection containing the overlays as the first element. The rest of the elements
	 * are the code lines. This means the first line starts at index 1.
	 */
	lines?: HTMLCollectionOf<HTMLDivElement>
}

const CodeBlockContext = createContext<[PrismCodeBlock, CodeBlockProps, JSX.Element[]] | null>(null)

/**
 * Hook used to access the code block and its props.
 *
 * @throws {Error} when called outside a code block.
 * 
 * @example
 * const [codeBlock, props, codeLines] = usePrismCodeBlock()
 */
const usePrismCodeBlock = () => {
	const context = useContext(CodeBlockContext)

	if (!context) throw Error("'usePrismCodeBlock' called outside code block")

	return context
}

/**
 * Component that creates a code block with syntax highlighting. Requires styles from
 * `prism-react-editor/code-block.css` in addition to the normal layout.
 */
const CodeBlock = (props: CodeBlockProps) => {
	const {
		onTokenize,
		guideIndents,
		rtl,
		wordWrap,
		preserveIndent = !!wordWrap,
		code,
		language,
		tabSize = 2,
		lineNumbers,
		lineNumberStart,
		className,
	} = props
	const hasGuides = !!guideIndents && !rtl
	const lnOffset = lineNumberStart! - 1 || 0

	const normalizedCode = useMemo(() => {
		return preserveIndent ? code.replace(/\t/g, " ".repeat(tabSize)) : code
	}, [code, preserveIndent && tabSize])

	const lines = useMemo(() => {
		let tokens = tokenizeText(
			normalizedCode.includes("\r") ? normalizedCode.replace(/\r\n?/g, "\n") : normalizedCode,
			languages[language] || {},
		)
		onTokenize?.(tokens)
		return highlightTokens(tokens).split("\n")
	}, [onTokenize, language, normalizedCode])

	const indents = useMemo(() => {
		if (preserveIndent || hasGuides) {
			const lines = code.split("\n")
			const l = lines.length
			const result = Array<number>(l).fill(0)

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
	}, [preserveIndent || hasGuides, code, tabSize])

	const codeLines = useMemo(() => {
		const keymap: Record<string, number> = {}
		const getKey = (html: string) => {
			return html + "\n" + (keymap[html] = (keymap[html] || 0) + 1)
		}

		return lines.map((html, i) => (
			<div
				className="pce-line"
				key={getKey(html)}
				style={{
					["--indent" as any]: `${indents?.[i] || 0}ch`,
				}}
				dangerouslySetInnerHTML={{ __html: html + "\n" }}
			/>
		))
	}, [lines, indents])

	const codeBlock = useStableRef<PrismCodeBlock>({})

	return (
		<pre
			className={`prism-code-editor language-${language}${
				lineNumbers ? " show-line-numbers" : ""
			} pce-${wordWrap ? "" : "no"}wrap${rtl ? " pce-rtl" : ""}${
				preserveIndent ? " pce-preserve" : ""
			}${hasGuides ? " pce-guides" : ""}${className ? " " + className : ""}`}
			ref={useStableRef((el: HTMLPreElement | null) => {
				if (el) {
					codeBlock.container = el
					codeBlock.lines = (codeBlock.wrapper = el.firstChild as HTMLElement)
						.children as HTMLCollectionOf<HTMLDivElement>
				}
			})}
			style={{
				...props.style,
				["--tab-size" as any]: tabSize,
				["--number-width" as any]: (0 | Math.log10(lines.length + lnOffset)) + 1 + ".001ch",
				counterReset: `line ${lnOffset}`,
			}}
		>
			<code className="pce-wrapper">
				<div className="pce-overlays">
					<CodeBlockContext.Provider value={[codeBlock, props, codeLines]}>
						{props.children}
					</CodeBlockContext.Provider>
				</div>
				{codeLines}
			</code>
		</pre>
	)
}

export * from "./brackets"
export * from "./copy"
export * from "./hover"
export { CodeBlock, usePrismCodeBlock }
