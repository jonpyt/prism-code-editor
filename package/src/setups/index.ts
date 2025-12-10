import { EditorOptions, createEditor } from "../index.js"
import { doc, getElement } from "../core.js"
import { defaultCommands, editHistory } from "../extensions/commands.js"
import { copyButton } from "../extensions/copyButton/index.js"
import { readOnlyCodeFolding } from "../extensions/folding/index.js"
import { indentGuides } from "../extensions/guides.js"
import { highlightBracketPairs } from "../extensions/matchBrackets/highlight.js"
import { matchBrackets } from "../extensions/matchBrackets/index.js"
import { matchTags } from "../extensions/matchTags.js"
import { highlightSelectionMatches } from "../extensions/search/selection.js"
import { searchWidget } from "../extensions/search/widget.js"
import { EditorTheme, loadTheme } from "../themes/index.js"
import { showInvisibles } from "../extensions/search/invisibles.js"

export type SetupOptions = Partial<EditorOptions> & { theme: EditorTheme }

const addStyles = (shadow: ShadowRoot, styles: string, id: string) => {
	let style = shadow.getElementById(id)
	if (!style) {
		style = doc!.createElement("style")
		style.id = id
		shadow.append(style)
	}
	style.textContent = styles
}

/**
 * Adds an editor inside a shadow root to the given element and asynchronously loads the styles.
 * @param container Must be an element you can attach a shadow root to.
 * @param options Options to create the editor as well as the theme to use.
 * @param onLoad Function called when the styles are loaded and the editor is
 * appended to the DOM.
 * @returns Object to interact with the editor.
 */
const minimalEditor = (
	container: HTMLElement | string,
	options: SetupOptions,
	onLoad?: () => any,
) => {
	const el = getElement(container)!
	const shadow = el.shadowRoot || el.attachShadow({ mode: "open" })
	const editor = createEditor<{ theme: EditorTheme }>(null, null, {
		update(_, options) {
			if (theme != (theme = options.theme))
				loadTheme(theme).then(style => {
					if (style && theme == options.theme) addStyles(shadow, style, "theme")
				})
		},
	})
	const remove = editor.remove
	let removed: boolean
	let theme = options.theme

	editor.remove = () => {
		remove()
		removed = true
	}

	Promise.all([import("./styles"), loadTheme(options.theme)]).then(([style, theme]) => {
		if (!removed) {
			addStyles(shadow, style.default, "layout-style")
			addStyles(shadow, theme || "", "theme")
			shadow.append(editor.container)
			editor.setOptions(options)
			onLoad && onLoad()
		}
	})

	return editor
}

/**
 * Same as {@link minimalEditor}, but also adds the {@link indentGuides},
 * {@link highlightSelectionMatches},  {@link matchBrackets}, {@link highlightBracketPairs},
 * {@link defaultCommands}, {@link editHistory}, {@link searchWidget},
 * {@link showInvisibles}, and {@link matchTags} extensions and language specific
 * behavior.
 *
 * There's also an extension added that clears the history stack every time the value is
 * changed programmatically.
 */
const basicEditor = (
	container: HTMLElement | string,
	options: SetupOptions,
	onLoad?: () => any,
) => {
	import("./basic").then(mod => {
		addStyles(el.shadowRoot!, mod.style, "search-style")
		editor.addExtensions(...mod.basic())
	})

	const el = getElement(container)!
	const editor = minimalEditor(el, options, onLoad)

	return editor
}

/**
 * Same as {@link minimalEditor}, but also adds the {@link copyButton}, {@link matchBrackets},
 * {@link highlightBracketPairs}, {@link matchTags}, {@link indentGuides}, {@link highlightSelectionMatches},
 * and {@link readOnlyCodeFolding} extensions. No commands are added which makes this setup
 * best used with the `readOnly` option set to true.
 */
const readonlyEditor = (
	container: HTMLElement | string,
	options: SetupOptions,
	onLoad?: () => any,
) => {
	import("./readonly").then(mod => {
		mod.addExtensions(editor)
		addStyles(el.shadowRoot!, mod.style, "readonly-style")
	})

	const el = getElement(container)!
	const editor = minimalEditor(el, options, onLoad)

	return editor
}

export { basicEditor, minimalEditor, readonlyEditor }
