import * as fs from "node:fs/promises"

const themes = [
	"atom-one-dark",
	"dracula",
	"github-dark-dimmed",
	"github-dark",
	"github-light",
	"night-owl-light",
	"night-owl",
	"prism-okaidia",
	"prism-solarized-light",
	"prism-twilight",
	"prism-tomorrow",
	"prism",
	"vs-code-dark",
	"vs-code-light",
]

let themeMod = await fs.readFile("dist/themes/index.js", "utf-8")
const regex = RegExp(`^(${themes.join("|")})(-\\w[\\w-]+)\.js$`)
const entries = await fs.readdir("dist", { withFileTypes: true })

for (const entry of entries) {
	const match = entry.name.match(regex)
	if (match) {
		themeMod = themeMod.replace(match[2], "")
		fs.rename(`dist/${entry.name}`, `dist/${match[1]}.js`)
	}
}

fs.writeFile("dist/themes/index.js", themeMod)

const dummyModule = `/** Used for autocompletion. This module doesn't have a default export. */
declare const _: never;
export default _;
`

;["dist/prism/languages/", "dist/languages/"].forEach(path => {
	fs.readdir(path).then(entries =>
		entries.forEach(entry => {
			if (entry.slice(-2) == "js") {
				const name = entry.slice(0, -3)
				fs.writeFile(path + name + ".d.ts", dummyModule)
			}
		}),
	)
})
