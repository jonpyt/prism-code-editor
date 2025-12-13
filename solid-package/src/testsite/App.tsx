import {
	createSignal,
	type Component,
	createEffect,
	For,
	batch,
	on,
	Show,
	createRenderEffect,
} from "solid-js"
import { Editor } from "../core"
import "../prism/languages/typescript"
import "../prism/languages/jsdoc"
import "../themes/github-dark.css"
import "./style.css"
import "../languages/clike"
import "../layout.css"
import "../scrollbar.css"
import "../code-block.css"
import "../extensions/folding/folding.css"
import "../extensions/copy-button/copy.css"
import "../extensions/search/search.css"
import "../extensions/search/invisibles.css"
import "../extensions/autocomplete/style.css"
import "../extensions/autocomplete/icons.css"
import "../extensions/cursor/cursor.css"
import { matchBrackets } from "../extensions/match-brackets"
import { highlightBracketPairs } from "../extensions/match-brackets/highlight"
import { indentGuides } from "../extensions/guides"
import { searchWidget } from "../extensions/search/widget"
import { highlightSelectionMatches, showInvisibles } from "../extensions/search"
import core from "../core?raw"
import { highlightMatchingTags, matchTags } from "../extensions/match-tags"
import { cursorPosition, customCursor } from "../extensions/cursor"
import { defaultCommands, editHistory } from "../extensions/commands"
import {
	blockCommentFolding,
	bracketFolding,
	markdownFolding,
	readOnlyCodeFolding,
	tagFolding,
} from "../extensions/folding"
import { copyButton } from "../extensions/copy-button"
import { Extension } from ".."
import { addTooltip } from "../tooltips"
import { languages } from "../prism"
import { loadTheme } from "../themes"
import { overscroll } from "../extensions/overscroll"
import {
	autoComplete,
	completeFromList,
	fuzzyFilter,
	registerCompletions,
} from "../extensions/autocomplete"
import {
	jsCompletion,
	completeKeywords,
	globalReactAttributes,
	jsContext,
	jsDocCompletion,
	jsSnipets,
	jsxTagCompletion,
	reactTags,
} from "../extensions/autocomplete/javascript"
import {
	globalHtmlAttributes,
	globalMathMLAttributes,
	globalSvgAttributes,
	htmlTags,
	markupCompletion,
	mathMLTags,
	svgTags,
} from "../extensions/autocomplete/markup"
import { cssCompletion } from "../extensions/autocomplete/css"
import { addTextareaListener } from "../utils/local"
import { CodeBlock } from "../code-block"
import { rainbowBrackets } from "../code-block/brackets"
import { addCopyButton } from "../code-block/copy"
import {
	addHoverDescriptions,
	highlightBracketPairsOnHover,
	highlightTagPairsOnHover,
} from "../code-block/hover"
import { vueCompletion } from "../extensions/autocomplete/vue"
import { svelteBlockSnippets, svelteCompletion } from "../extensions/autocomplete/svelte"

const tooltip: Extension = editor => {
	const { show, hide, element } = addTooltip(
		editor,
		<div class="tooltip">Cannot edit read-only editor.</div>,
		false,
	)

	addTextareaListener(
		editor,
		"beforeinput",
		() => {
			if (editor.props.readOnly) show()
		},
		true,
	)
	addTextareaListener(editor, "click", hide)
	createEffect(on(editor.selection, hide))
	return element
}

const themeStyle = document.querySelector("style")!

const App: Component = () => {
	let select!: HTMLSelectElement
	const [langs, setLangs] = createSignal(["typescript", "firestore-security-rules"])
	const [lang, setLang] = createSignal("typescript")
	const [value, setValue] = createSignal(core)
	const [readOnly, setReadOnly] = createSignal(false)
	const [codeBlock, setCodeBlock] = createSignal(false)

	const extensions: Extension[] = [
		matchBrackets(),
		customCursor(),
		searchWidget(),
		indentGuides(),
		highlightBracketPairs(),
		highlightSelectionMatches(),
		matchTags(),
		highlightMatchingTags(),
		cursorPosition(),
		defaultCommands(),
		editHistory(),
		tooltip,
		copyButton(),
		overscroll(),
		showInvisibles(),
		autoComplete({
			filter: fuzzyFilter,
		}),
		editor => {
			createRenderEffect(() => {
				editor.props.value
				editor.container.scrollTo(0, 0)
			})
		},
	]

	const readExtensions = extensions.concat(
		readOnlyCodeFolding(blockCommentFolding, markdownFolding, tagFolding, bracketFolding),
	)

	setTimeout(() => {
		import("../languages")
		import("../prism/languages").then(() => {
			setLangs(
				Object.keys(languages)
					.filter(
						(name, i, keys) =>
							i > 3 && languages[name] != languages[keys[i - 1]] && !/[^i]doc|regex/.test(name),
					)
					.sort(),
			)
			select.value = "typescript"
		})
	}, 500)

	return (
		<>
			<div>
				<label>
					Theme:
					<div class="select">
						<select
							onInput={e => {
								const theme = (e.target as HTMLSelectElement).value.toLowerCase().replace(/ /g, "-")
								loadTheme(theme).then(css => {
									themeStyle.textContent = css!
								})
							}}
						>
							<option>Atom One Dark</option>
							<option>Dracula</option>
							<option selected>Github Dark</option>
							<option>Github Dark Dimmed</option>
							<option>Github Light</option>
							<option>Night Owl</option>
							<option>Prism</option>
							<option>Prism Okaidia</option>
							<option>Prism Solarized Light</option>
							<option>Prism Tomorrow</option>
							<option>Prism Twilight</option>
							<option>VS Code Dark</option>
							<option>VS Code Light</option>
						</select>
					</div>
				</label>
				<label>
					Language:
					<div class="select">
						<select
							ref={select}
							onInput={() => {
								const lang = select.value
								import("./examples").then(mod => {
									batch(() => {
										setLang(lang)
										setValue(mod.default[lang] || core)
									})
								})
							}}
						>
							<For each={langs()}>{lang => <option>{lang}</option>}</For>
						</select>
					</div>
				</label>
				<label>
					<input type="checkbox" onInput={e => setReadOnly(e.target.checked)} />
					Read-only
				</label>
				<label>
					<input type="checkbox" onInput={e => setCodeBlock(e.currentTarget.checked)} />
					Code block
				</label>
			</div>
			<Show
				when={codeBlock()}
				fallback={
					<Editor
						readOnly={readOnly()}
						language={lang()}
						value={value()}
						insertSpaces={false}
						extensions={readOnly() ? readExtensions : extensions}
					/>
				}
			>
				<CodeBlock
					language={lang()}
					code={value()}
					lineNumbers
					guideIndents
					wordWrap
					onTokenize={rainbowBrackets()}
					overlays={[
						addCopyButton,
						addHoverDescriptions(types => {
							if (types.includes("string")) return ["This is a string token."]
						}),
						highlightBracketPairsOnHover(),
						highlightTagPairsOnHover(),
					]}
				/>
			</Show>
		</>
	)
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

registerCompletions(["css"], {
	sources: [cssCompletion()],
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

export default App
