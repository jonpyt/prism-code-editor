import type { Plugin } from "unified"
import type { Root, Element, ElementContent } from "hast"
import { visitParents } from "unist-util-visit-parents"
import { fromHtml } from "hast-util-from-html"
import { createCodeBlock, createEditor, parseMeta } from "./utils.js"
import { PcePluginOptions } from "./types.js"
import { numLines } from "prism-code-editor"
import { highlightTokens, languages, tokenizeText } from "prism-code-editor/prism"

export const prismCodeEditor: Plugin<[PcePluginOptions?], Root> = ({
	editorsOnly,
	defaultEditorProps,
	defaultCodeBlockProps,
	customRenderer,
	inline,
	silenceWarnings,
	trimEndingNewline = true,
} = {}) => {
	return tree => {
		const nodes: [Element, Element, Element, string][] = []
		const spans: [Element, string][] = []

		visitParents(tree, { type: "element", tagName: "code" }, (node, ancestors) => {
			const [grandParent, parent] = ancestors.slice(-2) as Element[]
			const children = node.children
			const text = children[0]

			if (children[1] || text.type != "text") return
			if (parent.tagName != "pre") {
				if (inline) spans.push([node, text.value])
			} else if (!parent.children[1]) {
				nodes.push([node, parent, grandParent, text.value])
			}
		})

		nodes.forEach(([codeEl, pre, parent, code]) => {
			if (trimEndingNewline && code.slice(-1) == "\n") {
				code = code.slice(0, -1)
			}

			const properties = codeEl.properties
			const meta = ((codeEl.data as any)?.meta || properties.metastring || "") as string
			const props = parseMeta(meta, numLines(code))
			const isEditor = props.editor

			if (editorsOnly && isEditor == null) return

			props.value = code
			delete props.editor

			let className = properties.className
			if (Array.isArray(className)) className = className.join(" ")

			const lang = (
				(typeof className == "string" && /\blanguage-(\S+)/.exec(className)?.[1]) ||
				"text"
			)
				.replace(/\b\+\+/g, "pp")
				.replace(/\b#/g, "sharp")

			props.language = lang

			if (!languages[lang] && !silenceWarnings) {
				console.warn(
					`rehype-prism-code-editor: Unregistered language '${lang}' found in code block. Syntax highlighting will be disabled.`,
				)
			}

			const renderFunc = isEditor ? createEditor : createCodeBlock
			const merged = {
				...(isEditor ? defaultEditorProps : defaultCodeBlockProps),
				...props,
			}
			const html = customRenderer
				? customRenderer(merged, renderFunc, !!isEditor)
				: renderFunc(merged)
			const children = parent.children

			children[children.indexOf(pre)] = fromHtml(html, { fragment: true }).children[0] as Element
		})

		spans.forEach(([codeEl, text]) => {
			const langStart = text.lastIndexOf("{:")

			if (langStart < 1 || text.slice(-1) != "}") return
			const lang = text.slice(langStart + 2, -1)
			const code = text.slice(0, langStart)
			const grammar = languages[lang]

			if (!grammar) {
				if (!silenceWarnings)
					console.warn(
						`rehype-prism-code-editor: Unregistered language '${lang}' found in inline code. Highlighting is skipped.`,
					)
				return
			}
			const properties = codeEl.properties
			const className = properties.className
			const langClass = "language-" + lang
			const tokens = tokenizeText(code, grammar)

			inline!.tokenizeCallback?.(tokens, lang)
			if (Array.isArray(className)) className.push(langClass)
			else if (typeof className == "string") properties.className = [className, langClass]
			else properties.className = langClass

			codeEl.children = fromHtml(highlightTokens(tokens), { fragment: true })
				.children as ElementContent[]
		})
	}
}
