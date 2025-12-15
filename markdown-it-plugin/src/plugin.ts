import MarkdownIt from "markdown-it"
import { PcePluginOptions } from "./types"
import { numLines } from "prism-code-editor"
import { createCodeBlock, createEditor, parseMeta } from "./utils"
import { highlightTokens, languages, tokenizeText } from "prism-code-editor/prism"

export const prismCodeEditor = (md: MarkdownIt, options: PcePluginOptions = {}) => {
	const {
		editorsOnly,
		defaultEditorProps,
		defaultCodeBlockProps,
		customRenderer,
		inline,
		silenceWarnings,
		trimEndingNewline = true,
	} = options

	md.options.highlight = (text, lang, attrs) => {
		const code = trimEndingNewline && text.slice(-1) == "\n" ? text.slice(0, -1) : text

		const meta = parseMeta(attrs, numLines(code))
		const isEditor = meta.editor

		if (editorsOnly && isEditor == null) return text

		meta.value = code
		meta.language = lang
		delete meta.editor

		if (!languages[lang] && !silenceWarnings) {
			console.warn(
				`markdown-it-prism-code-editor: Unregistered language '${lang}' found in code block. Syntax highlighting will be disabled.`,
			)
		}

		const renderFunc = isEditor ? createEditor : createCodeBlock
		const merged = {
			...(isEditor ? defaultEditorProps : defaultCodeBlockProps),
			...meta,
		}
		return customRenderer ? customRenderer(merged, renderFunc, !!isEditor) : renderFunc(merged)
	}

	if (inline) {
		const oldRule =
			md.renderer.rules.code_inline ||
			((tokens, idx, options, _, self) => self.renderToken(tokens, idx, options))

		md.renderer.rules.code_inline = (tokens, idx, options, env, self) => {
			const token = tokens[idx]
			const text = token.content
			const langStart = text.lastIndexOf("{:")

			if (langStart < 1 || text.slice(-1) != "}") return oldRule(tokens, idx, options, env, self)

			const lang = text.slice(langStart + 2, -1)
			const code = text.slice(0, langStart)
			const grammar = languages[lang]

			if (!grammar) {
				if (!silenceWarnings) {
					console.warn(
						`markdown-it-prism-code-editor: Unregistered language '${lang}' found in inline code. Highlighting is skipped.`,
					)
				}
				return oldRule(tokens, idx, options, env, self)
			}

			const prismTokens = tokenizeText(code, grammar)
			inline.tokenizeCallback?.(prismTokens, lang)

			token.attrJoin("class", "language-" + lang)

			return `<code${self.renderAttrs(token)}>${highlightTokens(prismTokens)}</code>`
		}
	}
}
