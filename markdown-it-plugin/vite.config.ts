 import { defineConfig } from "vite"
import dts from "vite-plugin-dts"

export default defineConfig({
	build: {
		sourcemap: true,
		minify: false,
		lib: {
			entry: {
				index: "src/index.ts",
			},
			formats: ["es"],
		},
		target: ["es2021", "safari14"],
		rollupOptions: {
			external: [
				"markdown-it",
				"prism-code-editor",
				"prism-code-editor/prism",
				"prism-code-editor/ssr",
			],
		},
	},
	plugins: [dts({
		beforeWriteFile(filePath) {
			if (filePath.includes("demo/")) {
				return false
			}
		},
	})],
})
