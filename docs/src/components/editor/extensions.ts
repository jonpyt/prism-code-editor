import "prism-code-editor/search.css"
import "prism-code-editor/copy-button.css"
import "prism-code-editor/invisibles.css"

import "prism-code-editor/languages/clike"
import "prism-code-editor/languages/jsx"
import "prism-code-editor/languages/html"
import "prism-code-editor/languages/xml"
import "prism-code-editor/languages/css"

import "prism-code-editor/prism/languages/jsdoc"
import "prism-code-editor/prism/languages/regex"

import { searchWidget, highlightSelectionMatches, showInvisibles } from "prism-code-editor/search"
import { copyButton } from "prism-code-editor/copy-button"
import { highlightBracketPairs } from "prism-code-editor/highlight-brackets"
import {
	defaultKeymap,
	editHistory,
	editorCommands,
	ignoreTab,
	setIgnoreTab,
} from "prism-code-editor/commands"
import { matchTags } from "prism-code-editor/match-tags"
import { editors } from "./mount"
import { cursorPosition } from "prism-code-editor/cursor"
import { indentGuides } from "prism-code-editor/guides"

editors.forEach(editor => {
	// Bad practice to mutate the options, but it won't cause issues here
	editor.options.insertSpaces = false
	editor.addExtensions(
		indentGuides(),
		editorCommands(defaultKeymap),
		editHistory(),
		searchWidget(),
		highlightBracketPairs(),
		highlightSelectionMatches(),
		copyButton(),
		cursorPosition(),
		matchTags(),
		showInvisibles(),
	)
})

// This allows keyboard navigators to easily tab past editors
addEventListener("keydown", e => {
	if (e.key == "Tab") {
		addEventListener(
			"focusin",
			e => {
				const active = e.target as HTMLElement
				if (active?.matches(".pce-textarea") && !ignoreTab) {
					setIgnoreTab(true)
					active.addEventListener(
						"blur",
						() => {
							setIgnoreTab(false)
						},
						{ once: true },
					)
				}
			},
			{ once: true },
		)
	}
})
