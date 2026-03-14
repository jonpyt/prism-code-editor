import { escapeHtml } from "../prism/core.js"

const escapeQuotes = (html: string) => {
	return escapeHtml(html, /"/g, "&quot;")
}

export { escapeQuotes }
