import { createEditor, EditorOptions, PrismEditor } from ".."
import { defaultCommands, editHistory } from "../extensions/commands"
import { copyButton } from "../extensions/copyButton"
import "../prism/languages/js-templates"
import "../prism/languages/jsdoc"
import "../prism/languages/css-extras"
import "../prism/languages/markdown"
import "../prism/languages/regex"
import "../extensions/copyButton/copy.css"
import "../extensions/folding/folding.css"
import "../extensions/autocomplete/style.css"
import "../extensions/autocomplete/icons.css"
import "../extensions/guides.css"
import { cursorPosition, customCursor } from "../extensions/cursor/index"
import { indentGuides } from "../extensions/guides"
import guides from "../prism/core?raw"
import readme from "/readme.md?raw"
import { matchBrackets } from "../extensions/matchBrackets"
import { highlightBracketPairs } from "../extensions/matchBrackets/highlight"
import { highlightCurrentWord, highlightSelectionMatches, searchWidget } from "../extensions/search"
import "../extensions/search/search.css"
import "../extensions/search/invisibles.css"
import "../extensions/cursor/cursor.css"
import "../languages"
import "../layout.css"
import "../code-block.css"
import "../rtl-layout.css"
import "../scrollbar.css"
import { addBasicEditor, addReadonlyEditor, PrismEditorElement } from "../webComponent"
import "./style.css"
import { matchTags } from "../extensions/matchTags"
import { addOverscroll } from "../tooltips"
import { getClosestToken } from "../utils"
import { autoComplete, completeFromList, registerCompletions } from "../extensions/autocomplete"
import {
	completeKeywords,
	jsCompletion,
	jsContext,
	jsDocCompletion,
	jsSnipets,
	jsxTagCompletion,
} from "../extensions/autocomplete/javascript"
import {
	markupCompletion,
	htmlTags,
	globalHtmlAttributes,
	globalSvgAttributes,
	svgTags,
	mathMLTags,
	globalMathMLAttributes,
} from "../extensions/autocomplete/markup"
import { fuzzyFilter } from "../extensions/autocomplete/filter"
import { cssCompletion } from "../extensions/autocomplete/css"
import { globalReactAttributes, reactTags } from "../extensions/autocomplete/javascript/reactData"
import { showInvisibles } from "../extensions/search/invisibles"
import { renderCodeBlock } from "../ssr/code-block"
import { rainbowBrackets } from "../ssr"
import { addCopyButton, forEachCodeBlock } from "../client/code-block"
import { addHoverDescriptions, highlightBracketPairsOnHover } from "../client/hover"
import { vueCompletion } from "../extensions/autocomplete/vue"
import { svelteCompletion } from "../extensions/autocomplete/svelte"
import { svelteBlockSnippets } from "../extensions/autocomplete/svelte/snippets"

const runBtn = <HTMLButtonElement>document.getElementById("run"),
	wrapper = document.querySelector<HTMLDivElement>(".editor-wrapper")!,
	tabs = wrapper.querySelectorAll(".tab"),
	errorEl = <HTMLDivElement>wrapper.querySelector(".error")!,
	errorMessage = <HTMLPreElement>errorEl.lastElementChild,
	createEditorWrapper = (container: ParentNode | null, options: EditorOptions) =>
		createEditor(
			container,
			options,
			cursorPosition(),
			indentGuides(),
			matchTags(),
			matchBrackets(),
			highlightBracketPairs(),
			copyButton(),
			highlightSelectionMatches(),
			searchWidget(),
			defaultCommands(),
			editHistory(),
			showInvisibles(),
			customCursor(),
			autoComplete({
				filter: fuzzyFilter,
				// closeOnBlur: false,
			}),
		),
	startCode = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Prism code editor</title>
  <script src="prism.js" data-manual></script>
  <link rel="stylesheet" href="src/style.css">
  <style>
    
  </style>
</head>
<body>
  
  <script>
    
  </script>
</body>
</html>`

let currentOptions = `const code = '${startCode.replace(/\n/g, "\\n")}'

const options = {
  language: 'html',
  insertSpaces: true,
  tabSize: 2,
  lineNumbers: true,
  readOnly: false,
  wordWrap: false,
  value: code,
  rtl: false,
  onUpdate(code) {},
  onSelectionChange([start, end, direction], code) {},
  onTokenize(tokens, language, code) {}
}`,
	activeEditor = 0,
	scrollPos: [number, number] = [0, 0]

let editor1 = createEditorWrapper(wrapper, {
	language: "html",
	value: startCode,
})

const editor = createEditorWrapper(wrapper, {
		language: "javascript",
		value: currentOptions,
		onUpdate(code) {
			runBtn.setAttribute("aria-hidden", <any>(currentOptions == code))
		},
	}),
	theme = <HTMLLinkElement>document.getElementById("theme"),
	themes = <HTMLSelectElement>document.getElementById("themes")

editor1.container.style.display = "none"
themes.oninput = () => {
	theme.href = theme.href.replace(/[^\/]+(?=\.css$)/, themes.value.toLowerCase().replace(/ /g, "-"))
}

const toggleActive = () => {
	for (const tab of tabs) tab.classList.toggle("active")
	const current = (activeEditor ? editor1 : editor).container
	const newEditor = (activeEditor ? editor : editor1).container
	newEditor.style.display = ""
	newEditor.scrollTo(...scrollPos)
	scrollPos = [current.scrollLeft, current.scrollTop]
	current.style.display = "none"

	if (!activeEditor) {
		runBtn.setAttribute("aria-hidden", "true")
		errorEl.setAttribute("aria-hidden", "true")
	} else runBtn.setAttribute("aria-hidden", <any>(currentOptions == editor.value))
	activeEditor = +!activeEditor
}

;(<HTMLDivElement>wrapper.firstElementChild).onclick = e => {
	const target = <HTMLElement>e.target
	if (target.matches(".tab:not(.active)")) toggleActive()
}

const tabSizeNode = new Text("2")
const tabSize = <HTMLInputElement>document.getElementById("tab-size")
tabSize.before(tabSizeNode)
tabSize.oninput = () => {
	readonlyEditor.tabSize = webComponent.tabSize = +(tabSizeNode.data = tabSize.value)
}

for (const attr of ["word-wrap", "readonly", "line-numbers"] as const) {
	document.getElementById(attr)!.onchange = () => {
		webComponent.toggleAttribute(attr)
		if (attr != "readonly") readonlyEditor.toggleAttribute(attr)
	}
}

const theme2 = <HTMLSelectElement>document.getElementById("themes2")!
theme2.oninput = () => {
	readonlyEditor.theme = webComponent.theme = theme2.value.toLowerCase().replace(/ /g, "-")
}

runBtn.onclick = () => {
	currentOptions = editor.value
	runBtn.setAttribute("aria-hidden", "true")
	let options: any
	try {
		options = new Function(currentOptions + "\n;return options")() || {}
	} catch (error) {
		errorEl.removeAttribute("aria-hidden")
		errorMessage.textContent = <string>error
		return
	}

	let newEditor: PrismEditor
	try {
		newEditor = createEditorWrapper(null, options)
	} catch (error) {
		errorEl.removeAttribute("aria-hidden")
		errorMessage.textContent = <string>error
		return
	}

	wrapper.append(newEditor.container)
	editor1.remove()
	editor1 = newEditor
	toggleActive()
	newEditor.textarea.focus()
}

addBasicEditor("prism-editor")

const webComponent = document.querySelector<PrismEditorElement>("prism-editor")!
const editor2 = webComponent.editor

webComponent.addEventListener("ready", () => {
	editor2.setOptions({
		value: guides.trimEnd(),
	})
	editor2.addExtensions(
		highlightCurrentWord(
			start => !getClosestToken(editor2, ".string, .comment, .keyword, .regex", 0, 0, start),
		),
	)
})

addReadonlyEditor("readonly-editor")

const readonlyEditor = document.querySelector<PrismEditorElement>("readonly-editor")!

readonlyEditor.addEventListener("ready", () => {
	readonlyEditor.editor.setOptions({
		value: readme,
	})
})

addOverscroll(editor)

document.querySelector<HTMLElement>("button.btn")!.onclick = () => {
	editor2.extensions.searchWidget!.open()
}

document.querySelector<HTMLFormElement>("#form")!.onsubmit = e => {
	e.preventDefault()
	const data = new FormData(e.target as HTMLFormElement)
	console.info(`===
Form submission results:
===
${data.get("editor")}`)
}

registerCompletions(["javascript", "js", "jsx", "tsx", "typescript", "ts"], {
	context: jsContext,
	sources: [
		jsCompletion(window),
		completeKeywords,
		jsDocCompletion,
		jsxTagCompletion(reactTags, globalReactAttributes),
		completeFromList(jsSnipets),
	],
})

registerCompletions(["html", "markup"], {
	sources: [
		markupCompletion(
			[
				{
					tags: htmlTags,
				},
				{
					tags: svgTags,
					globals: globalSvgAttributes,
				},
				{
					tags: mathMLTags,
					globals: globalMathMLAttributes,
				},
			],
			globalHtmlAttributes,
		),
	],
})

registerCompletions(["css"], {
	sources: [cssCompletion()],
})

registerCompletions(["vue"], {
	sources: [
		vueCompletion({
			MyComponent: {
				onevent: null,
				hello: ["world"],
			},
		}),
	],
})

registerCompletions(["svelte"], {
	sources: [
		svelteCompletion(svelteBlockSnippets, {
			MyComponent: {
				onevent: null,
				hello: ["world"],
			},
		}),
	],
})

document.body.insertAdjacentHTML(
	"beforeend",
	`<section>${renderCodeBlock({
		language: "javascript",
		value: guides,
		lineNumbers: true,
		guideIndents: true,
		wordWrap: true,
		tokenizeCallback: rainbowBrackets(),
	})}</section>`,
)

forEachCodeBlock(document, codeBlock => {
	addCopyButton(codeBlock)
	addHoverDescriptions(
		codeBlock,
		types => {
			if (types.includes("string")) return ["this is a string token."]
		},
		{},
	)
	highlightBracketPairsOnHover(codeBlock)
})

setTimeout(() => import("../prism/languages"), 500)
