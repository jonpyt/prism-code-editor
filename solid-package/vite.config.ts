import { defineConfig } from "vite"
import solidPlugin from "vite-plugin-solid"
import dts from "vite-plugin-dts"
import fs from "node:fs/promises"
// import devtools from 'solid-devtools/vite'

const entries: Record<string, string> = {
	index: "src/index.ts",
	"extensions/guides": "src/extensions/guides.ts",
	"extensions/commands": "src/extensions/commands.ts",
	"extensions/cursor/index": "src/extensions/cursor/index.ts",
	"extensions/match-brackets/index": "src/extensions/match-brackets/index.ts",
	"extensions/match-brackets/highlight": "src/extensions/match-brackets/highlight.ts",
	"extensions/match-tags": "src/extensions/match-tags.ts",
	"extensions/search/index": "src/extensions/search/index.ts",
	"extensions/search/api": "src/extensions/search/api.ts",
	cursor: "src/extensions/cursor/cursor.css",
	search: "src/extensions/search/search.css",
	invisibles: "src/extensions/search/invisibles.css",
	copy: "src/extensions/copy-button/copy.css",
	"extensions/copy-button/index": "src/extensions/copy-button/index.ts",
	"extensions/folding/index": "src/extensions/folding/index.ts",
	"extensions/autocomplete/index": "src/extensions/autocomplete/index.ts",
	"extensions/autocomplete/css/index": "src/extensions/autocomplete/css/index.ts",
	"extensions/autocomplete/markup/index": "src/extensions/autocomplete/markup/index.ts",
	"extensions/autocomplete/javascript/index": "src/extensions/autocomplete/javascript/index.ts",
	"extensions/autocomplete/svelte/index": "src/extensions/autocomplete/svelte/index.ts",
	"extensions/autocomplete/vue/index": "src/extensions/autocomplete/vue/index.ts",
	autocomplete: "src/extensions/autocomplete/style.css",
	"autocomplete-icons": "src/extensions/autocomplete/icons.css",
	"extensions/overscroll": "src/extensions/overscroll.ts",
	"code-block/index": "src/code-block/index.ts",
	folding: "src/extensions/folding/folding.css",
	setups: "src/setups.ts",
	tooltips: "src/tooltips.tsx",
	scrollbar: "src/scrollbar.css",
	"rtl-layout": "src/rtl-layout.css",
	layout: "src/layout.css",
	"code-block": "src/code-block.css",
	"themes/index": "src/themes/index.ts",
	"utils/index": "src/utils/index.ts",
	"prism/index": "src/prism/index.js",
	"prism/utils": "src/prism/utils.js",
}

await Promise.all([
	fs.readdir(new URL("./src/prism/languages", import.meta.url)).then(files =>
		files.forEach(name => {
			entries["prism/languages/" + name.slice(0, -3)] = "src/prism/languages/" + name
		}),
	),
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

export default defineConfig({
	plugins: [
		/* 
    Uncomment the following line to enable solid-devtools.
    For more info see https://github.com/thetarnav/solid-devtools/tree/main/packages/extension#readme
    */
		// devtools(),
		solidPlugin(),
		dts({
			beforeWriteFile(filePath) {
				if (filePath.includes("languages/shared")) {
					return false
				}
			},
		}),
	],
	server: {
		port: 3000,
	},
	build: {
		cssCodeSplit: true,
		sourcemap: true,
		cssMinify: "esbuild",
		minify: false,
		rollupOptions: {
			external: ["solid-js", "solid-js/web"],
		},
		lib: {
			entry: entries,
			formats: ["es"],
		},
		target: ["es2021", "safari14"],
	},
})
