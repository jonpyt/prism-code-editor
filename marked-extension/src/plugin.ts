import { MarkedExtension } from "marked"
import { PcePluginOptions } from "./types"
import { createCodeBlock, createEditor, parseMeta } from "./utils"
import { numLines } from "prism-code-editor"
import { highlightTokens, languages, tokenizeText } from "prism-code-editor/prism"

export const prismCodeEditor = ({
	editorsOnly,
	defaultEditorProps,
	defaultCodeBlockProps,
	customRenderer,
	inline,
	silenceWarnings,
}: PcePluginOptions = {}): MarkedExtension => {
	return {
		renderer: {
			code(token) {
				const match = /(\S*)(.*)/.exec(token.lang || "")!
				const lang = match[1] || "text"
				const code = token.text
				const meta = parseMeta(match[2], numLines(code))
				const isEditor = meta.editor

				if (editorsOnly && isEditor == null) return false

				meta.value = code
				meta.language = lang
				delete meta.editor

				if (!languages[lang] && !silenceWarnings) {
					console.warn(
						`marked-prism-code-editor: Unregistered language '${lang}' found in code block. Syntax highlighting will be disabled.`,
					)
				}

				const renderFunc = isEditor ? createEditor : createCodeBlock
				const merged = {
					...(isEditor ? defaultEditorProps : defaultCodeBlockProps),
					...meta,
				}
				return customRenderer ? customRenderer(merged, renderFunc, !!isEditor) : renderFunc(merged)
			},
			codespan: token => {
				let text = token.text
				let langStart = text.lastIndexOf("{:")

				if (!inline || langStart < 1 || text.slice(-1) != "}") return false
				const lang = text.slice(langStart + 2, -1)
				const code = text.slice(0, langStart)
				const grammar = languages[lang]

				if (!grammar) {
					if (!silenceWarnings) {
						console.warn(
							`marked-prism-code-editor: Unregistered language '${lang}' found in inline code. Highlighting is skipped.`,
						)
					}
					return false
				}

				const tokens = tokenizeText(code, grammar)
				inline.tokenizeCallback?.(tokens, lang)

				return `<code class="language-${lang
					.replace(/&/g, "&amp;")
					.replace(/"/g, "&quot;")}">${highlightTokens(tokens)}</code>`
			},
		},
	}
}
