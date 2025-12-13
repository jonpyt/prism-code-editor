import { Suspense, lazy, useEffect, useLayoutEffect, useMemo, useState } from "react"
import { Editor } from "../core"
import core from "../core?raw"
import "../themes/github-dark.css"
import "../layout.css"
import "../scrollbar.css"
import "../code-block.css"
import "../extensions/copy-button/copy.css"
import "../extensions/folding/folding.css"
import "../extensions/autocomplete/style.css"
import "../extensions/autocomplete/icons.css"
import "../extensions/cursor/cursor.css"
import "../prism/languages/tsx"
import "../prism/languages/jsdoc"
import "./style.css"
import "../extensions/search/search.css"
import "../extensions/search/invisibles.css"
import "../languages/jsx"
import { useBracketMatcher } from "../extensions/match-brackets"
import { useHighlightBracketPairs } from "../extensions/match-brackets/highlight"
import { IndentGuides } from "../extensions/guides"
import { useHighlightSelectionMatches, useShowInvisibles } from "../extensions/search"
import { useOverscroll } from "../extensions/overscroll"
import { useHighlightMatchingTags, useTagMatcher } from "../extensions/match-tags"
import { useDefaultCommands, useEditHistory } from "../extensions/commands"
import { useCopyButton } from "../extensions/copy-button"
import { useSearchWidget } from "../extensions/search/widget"
import { languages } from "../prism"
import { loadTheme } from "../themes"
import { useCursorPosition, useCustomCursor } from "../extensions/cursor"
import {
	fuzzyFilter,
	completeFromList,
	registerCompletions,
	useAutoComplete,
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
import {
	CodeBlock,
	CopyButton,
	HighlightBracketPairsOnHover,
	HighlightTagPairsOnHover,
	HoverDescriptions,
	rainbowBrackets,
} from "../code-block"
import { svelteBlockSnippets, svelteCompletion } from "../extensions/autocomplete/svelte"
import { vueCompletion } from "../extensions/autocomplete/vue"
import { usePrismEditor } from "../extensions"

const ReadOnly = lazy(() => import("./readOnly"))

const Extensions = () => {
	const [editor, props] = usePrismEditor()
	useBracketMatcher(editor)
	useHighlightBracketPairs(editor)
	useOverscroll(editor)
	useTagMatcher(editor)
	useHighlightMatchingTags(editor)
	useDefaultCommands(editor)
	useEditHistory(editor)
	useSearchWidget(editor)
	useHighlightSelectionMatches(editor)
	useCopyButton(editor)
	useCursorPosition(editor)
	useShowInvisibles(editor)
	useAutoComplete(editor, {
		filter: fuzzyFilter,
	})
	useCustomCursor(editor, { animate: true, smooth: true })

	useLayoutEffect(() => {
		editor.container?.scrollTo(0, 0)
	}, [props.value])

	if (props.readOnly) {
		return (
			<Suspense>
				<ReadOnly />
			</Suspense>
		)
	}
}

const coreCode = core.replace(/<T [ \w]+>/g, "")
const themeStyle = document.querySelector("style")!
const onTokenize = rainbowBrackets()

function App() {
	const [langs, setLangs] = useState(["tsx", "firestore-security-rules"])
	const [lang, setLang] = useState("tsx")
	const [value, setValue] = useState(coreCode)
	const [readOnly, setReadOnly] = useState(false)
	const [codeBlock, setCodeBlock] = useState(false)

	useEffect(() => {
		let timeout = setTimeout(() => {
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
			})
		}, 500)
		return () => clearTimeout(timeout)
	}, [])

	return (
		<>
			<div>
				<label>
					Theme:
					<div className="select">
						<select
							defaultValue="Github Dark"
							onInput={e => {
								const theme = (e.target as HTMLSelectElement).value.toLowerCase().replace(/ /g, "-")
								loadTheme(theme).then(css => {
									themeStyle.textContent = css!
								})
							}}
						>
							<option>Atom One Dark</option>
							<option>Dracula</option>
							<option>Github Dark</option>
							<option>Github Dark Dimmed</option>
							<option>Github Light</option>
							<option>Night Owl</option>
							<option>Night Owl Light</option>
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
					<div className="select">
						<select
							value={lang}
							onInput={e => {
								const lang = e.currentTarget.value
								import("./examples").then(mod => {
									setLang(lang)
									setValue(mod.default[lang] || coreCode)
								})
							}}
						>
							{useMemo(() => langs.map(lang => <option key={lang}>{lang}</option>), [langs])}
						</select>
					</div>
				</label>
				<label>
					<input type="checkbox" onInput={e => setReadOnly(e.currentTarget.checked)} />
					Read-only
				</label>
				<label>
					<input type="checkbox" onInput={e => setCodeBlock(e.currentTarget.checked)} />
					Code block
				</label>
			</div>
			{codeBlock ? (
				<CodeBlock
					language={lang}
					code={value}
					lineNumbers
					guideIndents
					wordWrap
					onTokenize={onTokenize}
				>
					<HoverDescriptions
						callback={types => {
							if (types.includes("string")) return ["This is a string token."]
						}}
					/>
					<CopyButton />
					<HighlightTagPairsOnHover />
					<HighlightBracketPairsOnHover />
				</CodeBlock>
			) : (
				<Editor readOnly={readOnly} language={lang} value={value} insertSpaces={false}>
					<Extensions />
					<IndentGuides />
				</Editor>
			)}
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
