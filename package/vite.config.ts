import { defineConfig, Plugin } from "vite"
import MagicString from "magic-string"
import dts from "vite-plugin-dts"
import fs from "node:fs/promises"

const entries: Record<string, string> = {
	index: "src/index.ts",
	"extensions/guides": "src/extensions/guides.ts",
	"extensions/commands": "src/extensions/commands.ts",
	"extensions/cursor": "src/extensions/cursor/index.ts",
	"setups/index": "src/setups/index.ts",
	webComponent: "src/webComponent.ts",
	"extensions/matchBrackets/index": "src/extensions/matchBrackets/index.ts",
	"extensions/matchBrackets/highlight": "src/extensions/matchBrackets/highlight.ts",
	"extensions/matchTags": "src/extensions/matchTags.ts",
	"extensions/search/index": "src/extensions/search/index.ts",
	"extensions/search/api": "src/extensions/search/api.ts",
	cursor: "src/extensions/cursor/cursor.css",
	guides: "src/extensions/guides.css",
	search: "src/extensions/search/search.css",
	invisibles: "src/extensions/search/invisibles.css",
	copy: "src/extensions/copyButton/copy.css",
	"extensions/copyButton/index": "src/extensions/copyButton/index.ts",
	"extensions/folding/index": "src/extensions/folding/index.ts",
	"extensions/autocomplete/index": "src/extensions/autocomplete/index.ts",
	"extensions/autocomplete/css/index": "src/extensions/autocomplete/css/index.ts",
	"extensions/autocomplete/markup/index": "src/extensions/autocomplete/markup/index.ts",
	"extensions/autocomplete/javascript/index": "src/extensions/autocomplete/javascript/index.ts",
	"extensions/autocomplete/vue/index": "src/extensions/autocomplete/vue/index.ts",
	"extensions/autocomplete/svelte/index": "src/extensions/autocomplete/svelte/index.ts",
	autocomplete: "src/extensions/autocomplete/style.css",
	"autocomplete-icons": "src/extensions/autocomplete/icons.css",
	"ssr/index": "src/ssr/index.ts",
	"client/index": "src/client/index.ts",
	"client/code-block": "src/client/code-block.ts",
	folding: "src/extensions/folding/folding.css",
	tooltips: "src/tooltips.ts",
	scrollbar: "src/scrollbar.css",
	"rtl-layout": "src/rtl-layout.css",
	layout: "src/layout.css",
	"code-block": "src/code-block.css",
	"themes/index": "src/themes/index.ts",
	"utils/index": "src/utils/index.ts",
	"prism/index": "src/prism/index.ts",
	"prism/utils/index": "src/prism/utils/index.ts",
	"prism/languages/index": "src/prism/languages/index.js",
	"prism/languages/common": "src/prism/languages/common.js",
}

await Promise.all([
	fs
		.readFile(new URL("./src/prism/tests/dependencies.json", import.meta.url), {
			encoding: "utf-8",
		})
		.then(file => {
			const dependencyGraph = <Record<string, string[]>>JSON.parse(file)
			for (const name in dependencyGraph)
				entries[`prism/languages/${name}`] = `src/prism/languages/${name}.js`
		}),
	fs.readdir(new URL("./src/themes", import.meta.url)).then(files =>
		files.forEach(name => {
			if (name.slice(-4) == ".css") {
				entries["themes/" + name.slice(0, -4)] = "src/themes/" + name
			}
		}),
	),
	fs.readdir(new URL("./src/languages", import.meta.url)).then(files =>
		files.forEach(name => {
			if (name.slice(-3) == ".ts") {
				entries["languages/" + name.slice(0, -3)] = "src/languages/" + name
			}
		}),
	),
])

const simpleRegexMinifier: Plugin = {
	name: "simple-regex-minifier",
	renderChunk(code) {
		const str = new MagicString(code)
		str.replace(/\[\\\\?s\\\\?S\]/g, "[^]")
		str.replace(/([^\\])\\t/g, "$1\t")

		// inline-regex-source plugin used by Prism's build system
		// https://github.com/PrismJS/prism/blob/v1.29.0/gulpfile.js/index.js#L33
		str.replace(
			/\/((?:[^\n\r[\\\/]|\\.|\[(?:[^\n\r\\\]]|\\.)*\])+)\/\s*\.\s*source\b/g,
			(m, source: string) => {
				// escape backslashes
				source = source.replace(/\\(.)/g, (m, g1: string) => {
					// characters like /\n/ can just be kept as "\n" instead of being escaped to "\\n"
					if (/[nrt0/]/.test(g1)) {
						return m
					}
					if ("\\" == g1) {
						return "\\\\\\\\" // escape using 4 backslashes
					}
					return "\\\\" + g1
				})
				// escape single quotes
				source = source.replace(/'/g, "\\'")
				// wrap source in single quotes
				return "'" + source + "'"
			},
		)
		return {
			code: str.toString(),
			map: str.generateMap({ hires: true }),
		}
	},
}

export default defineConfig({
	build: {
		cssCodeSplit: true,
		sourcemap: true,
		cssMinify: "esbuild",
		minify: false,
		lib: {
			entry: entries,
			formats: ["es"],
		},
		target: ["es2021", "safari14"],
	},
	plugins: [
		dts({
			beforeWriteFile(filePath) {
				if (filePath.includes("languages/shared")) {
					return false
				}
			},
		}),
		simpleRegexMinifier,
	],
})
