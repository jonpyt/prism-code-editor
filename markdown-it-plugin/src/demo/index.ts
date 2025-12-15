import "prism-code-editor/layout.css"
import "prism-code-editor/rtl-layout.css"
import "prism-code-editor/code-block.css"
import "prism-code-editor/scrollbar.css"
import "prism-code-editor/search.css"
import "prism-code-editor/invisibles.css"
import "prism-code-editor/copy-button.css"
import "prism-code-editor/themes/github-dark.css"
import "prism-code-editor/guides.css"
import "./style.css"

import "prism-code-editor/prism/languages/common"
import "prism-code-editor/languages/common"
import { createEditor, EditorExtension } from "prism-code-editor"
import { indentGuides } from "prism-code-editor/guides"
import { matchBrackets } from "prism-code-editor/match-brackets"
import { highlightBracketPairs } from "prism-code-editor/highlight-brackets"
import { matchTags } from "prism-code-editor/match-tags"
import { searchWidget, highlightSelectionMatches, showInvisibles } from "prism-code-editor/search"
import { addOverscroll } from "prism-code-editor/tooltips"
import { defaultCommands, editHistory } from "prism-code-editor/commands"
import { cursorPosition } from "prism-code-editor/cursor"
import { rainbowBrackets } from "prism-code-editor/ssr"
import {
	addCopyButton,
	forEachCodeBlock,
	highlightBracketPairsOnHover,
	highlightTagPairsOnHover,
} from "prism-code-editor/code-blocks"
import { mountEditorsUnder } from "prism-code-editor/client"
import { markdown, options } from "./code"
import { prismCodeEditor } from "../plugin"
import markdownItWrapperlessFenceRule from "@olets/markdown-it-wrapperless-fence-rule"
import MarkdownIt from "markdown-it"
import markdownItAttrs from "markdown-it-attrs"

let timeout: number
let allowDragging: boolean
let configActive: boolean
let scrollPos: [number, number] = [0, 0]

const wrappers = document.getElementsByClassName("wrapper") as HTMLCollectionOf<HTMLDivElement>
const errorEl = document.querySelector<HTMLDivElement>(".error")!
const markdownContainer = document.querySelector<HTMLDivElement>("#markdown")!
const dragbar = document.querySelector<HTMLButtonElement>("#dragbar")!
const errorMessage = <HTMLPreElement>errorEl.lastElementChild
const tabs = wrappers[0].getElementsByClassName("tab")

const updateWidth = (pos: number) => {
	const matches = media.matches
	const offset = Math.max(0, Math.min((100 * pos) / (matches ? innerHeight : innerWidth), 100))
	wrappers[+matches].style.flexBasis = offset + "%"
	wrappers[+!matches].style.flexBasis = 100 - offset + "%"
}

const toggleActive = () => {
	for (const tab of tabs) tab.classList.toggle("active")
	const current = (configActive ? optionsEditor : markdownEditor).container
	const newEditor = (configActive ? markdownEditor : optionsEditor).container
	const next: [number, number] = [current.scrollLeft, current.scrollTop]
	current.replaceWith(newEditor)
	newEditor.scrollTo(...scrollPos)
	scrollPos = next
	configActive = !configActive
}

const media = matchMedia("(max-aspect-ratio: 1 / 1)")

const run = () => {
	try {
		const options = Function(
			"rainbowBrackets",
			optionsEditor.value + "\n;return options",
		)(rainbowBrackets)
		const md = MarkdownIt()

		md.renderer.rules.fence = markdownItWrapperlessFenceRule
		md.use(markdownItAttrs, {
			leftDelimiter: "[",
			rightDelimiter: "]",
		})
		md.use(prismCodeEditor, options)

		const file = md.render(markdownEditor.value)

		markdownContainer.innerHTML = file
		mountEditorsUnder(markdownContainer, getExtensions)
		forEachCodeBlock(markdownContainer, codeBlock => {
			addCopyButton(codeBlock)
			highlightBracketPairsOnHover(codeBlock)
			highlightTagPairsOnHover(codeBlock)
		})
		errorEl.setAttribute("aria-hidden", "true")
	} catch (error) {
		errorEl.removeAttribute("aria-hidden")
		errorMessage.textContent = (<Error>error).message
	}
}

const getExtensions = (): EditorExtension[] => [
	indentGuides(),
	matchBrackets(),
	highlightBracketPairs(),
	matchTags(),
	searchWidget(),
	highlightSelectionMatches(),
	showInvisibles(),
	defaultCommands(),
	editHistory(),
	cursorPosition(),
]

const markdownEditor = createEditor(
	wrappers[0],
	{
		language: "markdown",
		value: markdown,
		insertSpaces: false,
	},
	...getExtensions(),
)

const optionsEditor = createEditor(
	null,
	{
		language: "js",
		value: options,
		insertSpaces: false,
	},
	...getExtensions(),
)

addOverscroll(optionsEditor)
addOverscroll(markdownEditor)

onpointerup = () => {
	allowDragging = false
}

addEventListener("touchend", () => {
	allowDragging = false
})

addEventListener("touchmove", e => {
	if (allowDragging) updateWidth(e.changedTouches[0][media.matches ? "pageY" : "pageX"])
})

onmousemove = e => {
	if (allowDragging) updateWidth(e[media.matches ? "pageY" : "pageX"])
}

onclick = e => {
	const target = <HTMLElement>e.target
	if (target.matches(".tab:not(.active)")) toggleActive()
}

dragbar.onpointerdown = () => {
	allowDragging = true
}

optionsEditor.options.onUpdate = markdownEditor.options.onUpdate = () => {
	clearTimeout(timeout)
	timeout = setTimeout(run, 500)
}

run()
