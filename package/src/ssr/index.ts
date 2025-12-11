import { EditorOptions } from "../index.js"
import { mountEditorsUnder } from "../client/index.js"
import { languages, highlightTokens, tokenizeText, TokenStream } from "../prism/index.js"
import { rainbowBrackets } from "./brackets.js"
import { escapeHtml } from "../prism/core.js"
import { escapeQuotes } from "./utils.js"

export type RenderOptions = Omit<EditorOptions, "onUpdate" | "onTokenize" | "onSelectionChange"> & {
	/**
	 * Callback that can be used to modify the tokens before they're stringified to HTML.
	 * If you're using an extension that modifies the tokens on the client, you should pass
	 * a function here that does the same modifications. If you don't, mounting the editor
	 * becomes more expensive. If you're adding rainbow brackets you can pass the
	 * {@link rainbowBrackets} function to this parameter.
	 */
	tokenizeCallback?(tokens: TokenStream, language: string): void
	/**
	 * Array of functions that render overlays. These functions are called in order with
	 * the render options for the editor. Any HTML returned is inserted inside the overlays
	 * element of the editor.
	 */
	overlays?: ((options: RenderOptions) => string | undefined)[]
}

/**
 * This function renders an editor as an HTML string. This is intended to the used with
 * server-side rendering (SSR) or static-site generation (SSG). The editor can the later
 * be made interactive on the client with the {@link mountEditorsUnder} function.
 *
 * @param options Options used for the editor. Any properties you define are stringified
 * to JSON, which will later be parsed by {@link mountEditorsUnder}. This is very useful
 * if you want to add extra configuration options used to customize how the editor is
 * mounted.
 */
const renderEditor = <T extends {} = {}>(options: RenderOptions & Omit<T, keyof RenderOptions>) => {
	let {
		language,
		value,
		lineNumbers,
		wordWrap,
		rtl,
		readOnly,
		tabSize,
		tokenizeCallback,
		overlays,
		class: userClass,
		...rest
	} = options

	let containerClass = `prism-code-editor language-${language}${
		lineNumbers == false ? "" : " show-line-numbers"
	} pce-${wordWrap ? "" : "no"}wrap${rtl ? " pce-rtl" : ""} pce-no-selection${
		readOnly ? " pce-readonly" : ""
	}`
	let html = `<div class="${escapeQuotes(containerClass + (userClass ? " " + userClass : ""))}"${
		userClass ? ` data-start=${containerClass.length + 1}` : ""
	} data-options='${escapeHtml(JSON.stringify(rest), /'/g, "&#39;")}' `

	let tokens = tokenizeText(
		value.includes("\r") ? value.replace(/\r\n?/g, "\n") : value,
		languages[language] || {},
	)
	tokenizeCallback?.(tokens, language)

	let lines = highlightTokens(tokens).split("\n")
	let l = lines.length
	let i = 0

	html +=
		`style=tab-size:${+tabSize! || 2};--number-width:${(0 | Math.log10(l)) + 1}.001ch>` +
		"<div class=pce-wrapper><div class=pce-overlays>" +
		"<textarea class=pce-textarea spellcheck=false autocapitalize=off autocomplete=off></textarea>"

	overlays?.forEach(overlay => {
		html += overlay(options) || ""
	})

	html += "</div>"

	while (i < l) {
		html += `<div class=${i ? "pce-line" : '"pce-line active-line"'} aria-hidden=true>${
			lines[i++]
		}\n</div>`
	}

	return html + "</div></div>"
}

export { renderEditor, rainbowBrackets }
export * from "./code-block.js"
export * from "./guides.js"
