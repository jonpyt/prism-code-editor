import { defineConfig } from "astro/config"
import starlight from "@astrojs/starlight"
import starlightTypeDoc from "starlight-typedoc"
import prismCodeEditor from "rehype-prism-code-editor"
import { indentGuides, rainbowBrackets } from "prism-code-editor/ssr"
import { languages } from "prism-code-editor/prism"
import "prism-code-editor/prism/languages/common"
import "prism-code-editor/prism/languages/jsdoc"
import "prism-code-editor/prism/languages/svelte"
import "prism-code-editor/prism/languages/vue"

languages.selector = {
	selector: {
		pattern: /[^]+/,
		inside: languages.css.selector.inside,
	},
}

/** @type {import("rehype-prism-code-editor").PcePluginOptions} */
const pluginOptions = {
	editorsOnly: true,
	defaultCodeBlockProps: {
		guideIndents: true,
		lineNumbers: true,
		wordWrap: true,
	},
	defaultEditorProps: {
		overlays: [indentGuides],
	},
	customRenderer(props, defaultRenderer) {
		const file = props.file
		delete props.file
		props.tokenizeCallback = rainbowBrackets(props._pairs)
		return `<div class="not-content code-block">${
			file ? `<figcaption class="code-title"><span>${file}</span></figcaption>` : ""
		}${defaultRenderer(props)}</div>`
	},
	inline: {},
}

// https://astro.build/config
export default defineConfig({
	markdown: {
		rehypePlugins: [[prismCodeEditor, pluginOptions]],
	},
	integrations: [
		starlight({
			title: "Prism code editor",
			components: {
				ThemeSelect: "./src/components/ThemeSelect.astro",
				ThemeProvider: "./src/components/ThemeProvider.astro",
				MobileMenuFooter: "./src/components/MobileMenuFooter.astro",
			},
			social: [
				{
					icon: "github",
					label: "GitHub",
					href: "https://github.com/jonpyt/prism-code-editor",
				},
			],
			plugins: [
				// Generate the documentation.
				starlightTypeDoc({
					entryPoints: [
						"../package/src/index.ts",
						"../package/src/utils/index.ts",
						"../package/src/extensions/guides.ts",
						"../package/src/extensions/commands.ts",
						"../package/src/extensions/cursor/index.ts",
						"../package/src/setups/index.ts",
						"../package/src/webComponent.ts",
						"../package/src/extensions/autocomplete/index.ts",
						"../package/src/extensions/autocomplete/javascript/index.ts",
						"../package/src/extensions/autocomplete/markup/index.ts",
						"../package/src/extensions/autocomplete/css/index.ts",
						"../package/src/extensions/autocomplete/vue/index.ts",
						"../package/src/extensions/autocomplete/svelte/index.ts",
						"../package/src/extensions/matchBrackets/index.ts",
						"../package/src/extensions/matchBrackets/highlight.ts",
						"../package/src/extensions/matchTags.ts",
						"../package/src/extensions/search/index.ts",
						"../package/src/extensions/search/api.ts",
						"../package/src/extensions/copyButton/index.ts",
						"../package/src/extensions/folding/index.ts",
						"../package/src/tooltips.ts",
						"../package/src/client/index.ts",
						"../package/src/client/code-block.ts",
						"../package/src/ssr/index.ts",
						"../package/src/themes/index.ts",
						"../package/src/prism/index.ts",
						"../package/src/prism/utils/index.ts",
					],
					tsconfig: "../package/tsconfig.json",
					output: "api-reference",
					typeDoc: {
						excludeExternals: true,
					},
				}),
			],
			sidebar: [
				{
					label: "Guides",
					items: [
						{ label: "Introduction", slug: "guides/introduction" },
						{ label: "Getting Started", slug: "guides/getting-started" },
						{ label: "Advanced Usage", slug: "guides/advanced-usage" },
						{ label: "Usage with Frameworks", slug: "guides/usage-with-frameworks" },
						{ label: "Usage in Forms", slug: "guides/usage-in-forms" },
						{ label: "Working with Prism", slug: "guides/working-with-prism" },
						{ label: "Handling Tab", slug: "guides/handling-tab" },
						{ label: "Keyboard Handling", slug: "guides/keyboard-handling" },
						{ label: "Language Specific Behavior", slug: "guides/language-specific-behavior" },
						{ label: "Styling", slug: "guides/styling" },
						{ label: "Extensions", slug: "guides/extensions" },
						{ label: "Custom Cursor", slug: "guides/custom-cursor" },
						{ label: "Searching", slug: "guides/searching" },
						{ label: "Autocomplete", slug: "guides/autocomplete" },
						{ label: "Code Folding", slug: "guides/code-folding" },
						{ label: "Tooltips", slug: "guides/tooltips" },
						{ label: "Server-side Rendering", slug: "guides/server-side-rendering" },
						{ label: "Code Blocks", slug: "guides/code-blocks" },
					],
				},
				{
					label: "Markdown plugins",
					items: [
						{ label: "Getting Started", slug: "markdown-plugins/getting-started" },
						{ label: "Configuration", slug: "markdown-plugins/configuration" },
						{ label: "Features", slug: "markdown-plugins/features" },
					],
				},
				{
					label: "Playground",
					slug: "playground",
				},
				{
					label: "API reference",
					items: [
						"autocomplete",
						"client",
						"code-blocks",
						"code-folding",
						"commands",
						"copy-button",
						"cursor",
						"guides",
						"highlight-brackets",
						"index",
						"match-brackets",
						"match-tags",
						"prism",
						"search",
						"setups",
						"ssr",
						"themes",
						"tooltips",
						"utils",
						"web-component",
					].map(module => ({
						label: module,
						collapsed: true,
						autogenerate: {
							directory: "api-reference/" + module,
							collapsed: true,
						},
					})),
				},
			],
		}),
	],
})
