import * as fs from "node:fs/promises"

/**
 * @typedef CSSData
 * @property {number} version
 * @property {Property[]} properties
 * @property {{ name: string }[]} atDirectives
 * @property {{ name: string }[]} pseudoClasses
 * @property {{ name: string }[]} pseudoElements
 *
 * @typedef Property
 * @property {string} name
 * @property {string} syntax
 * @property {{ name: string }[]?} values
 * @property {number} relevance
 */

/** @type {CSSData} */
const data = JSON.parse(
	await fs.readFile("./node_modules/@vscode/web-custom-data/data/browsers.css-data.json", {
		encoding: "utf-8",
	}),
)

const colors = [
	"aliceblue",
	"antiquewhite",
	"aqua",
	"aquamarine",
	"azure",
	"beige",
	"bisque",
	"black",
	"blanchedalmond",
	"blue",
	"blueviolet",
	"brown",
	"burlywood",
	"cadetblue",
	"chartreuse",
	"chocolate",
	"coral",
	"cornflowerblue",
	"cornsilk",
	"crimson",
	"cyan",
	"darkblue",
	"darkcyan",
	"darkgoldenrod",
	"darkgray",
	"darkgreen",
	"darkgrey",
	"darkkhaki",
	"darkmagenta",
	"darkolivegreen",
	"darkorange",
	"darkorchid",
	"darkred",
	"darksalmon",
	"darkseagreen",
	"darkslateblue",
	"darkslategray",
	"darkslategrey",
	"darkturquoise",
	"darkviolet",
	"deeppink",
	"deepskyblue",
	"dimgray",
	"dimgrey",
	"dodgerblue",
	"firebrick",
	"floralwhite",
	"forestgreen",
	"fuchsia",
	"gainsboro",
	"ghostwhite",
	"gold",
	"goldenrod",
	"gray",
	"green",
	"greenyellow",
	"grey",
	"honeydew",
	"hotpink",
	"indianred",
	"indigo",
	"ivory",
	"khaki",
	"lavender",
	"lavenderblush",
	"lawngreen",
	"lemonchiffon",
	"lightblue",
	"lightcoral",
	"lightcyan",
	"lightgoldenrodyellow",
	"lightgray",
	"lightgreen",
	"lightgrey",
	"lightpink",
	"lightsalmon",
	"lightseagreen",
	"lightskyblue",
	"lightslategray",
	"lightslategrey",
	"lightsteelblue",
	"lightyellow",
	"lime",
	"limegreen",
	"linen",
	"magenta",
	"maroon",
	"mediumaquamarine",
	"mediumblue",
	"mediumorchid",
	"mediumpurple",
	"mediumseagreen",
	"mediumslateblue",
	"mediumspringgreen",
	"mediumturquoise",
	"mediumvioletred",
	"midnightblue",
	"mintcream",
	"mistyrose",
	"moccasin",
	"navajowhite",
	"navy",
	"oldlace",
	"olive",
	"olivedrab",
	"orange",
	"orangered",
	"orchid",
	"palegoldenrod",
	"palegreen",
	"paleturquoise",
	"palevioletred",
	"papayawhip",
	"peachpuff",
	"peru",
	"pink",
	"plum",
	"powderblue",
	"purple",
	"rebeccapurple",
	"red",
	"rosybrown",
	"royalblue",
	"saddlebrown",
	"salmon",
	"sandybrown",
	"seagreen",
	"seashell",
	"sienna",
	"silver",
	"skyblue",
	"slateblue",
	"slategray",
	"slategrey",
	"snow",
	"springgreen",
	"steelblue",
	"tan",
	"teal",
	"thistle",
	"tomato",
	"transparent",
	"turquoise",
	"violet",
	"wheat",
	"white",
	"whitesmoke",
	"yellow",
	"yellowgreen",
]

const cssValues = new Set(colors)
const excludedProperties = new Set(["font-family", "font-feature-settings", "unicode-range"])

const functions = new Set([
	"calc",
	"min",
	"max",
	"clamp",
	"round",
	"mod",
	"rem",
	"sin",
	"cos",
	"asin",
	"acos",
	"atan",
	"atan2",
	"pow",
	"sqrt",
	"hypot",
	"log",
	"exp",
	"abs",
	"sign",
	"rgb",
	"hsl",
	"hwb",
	"lch",
	"oklch",
	"lab",
	"oklab",
	"color",
	"color-mix",
	"linear-gradient",
	"radial-gradient",
	"conic-gradient",
	"repeating-linear-gradient",
	"repeating-radial-gradient",
	"repeating-conic-gradient",
	"image-set",
	"cross-fade",
	"paint",
	"counters",
	"ellipse",
	"rect",
	"xywh",
	"polygon",
	"shape",
	"env",
	"var",
	"cubic-bezier",
	"steps",
	"view",
	"anchor",
	"anchor-size",
])

cssValues.add("unset")
cssValues.add("initial")
cssValues.add("revert")
cssValues.add("revert-layer")
cssValues.add("pre")
cssValues.add("pre-wrap")
cssValues.add("white-space")
cssValues.add("linear")
cssValues.add("ease")
cssValues.add("ease-in")
cssValues.add("ease-in-out")
cssValues.add("ease-out")

data.properties.forEach(({ name, values }) => {
	if (excludedProperties.has(name) || name[0] == "-") return
	values?.forEach(({ name: value }) => {
		if (value[0] == "-") return
		const bracketIndex = value.indexOf("(")
		const isFunction = bracketIndex >= 0
		const name = isFunction ? value.slice(0, bracketIndex) : value

		if (isFunction && !cssValues.has(name)) functions.add(name)
		if (!isFunction && functions.has(name)) functions.delete(name)
		cssValues.add(name)
	})
})

functions.forEach(f => cssValues.add(f))

const lines = [
	"// generated from @vscode/web-custom-data package",
	"",
	'import { Completion } from "../types.js"',
	"",
	"const toCompletions = (prefix: string, icon: string, values: string): Completion[] => {",
	'\treturn values.split(",").map(val => val.includes("(") ?',
	'\t\t{ label: prefix + val.slice(0, -2), icon: "function", insert: prefix + val, tabStops: [val.length + prefix.length - 1] } :',
	"\t\t{ label: prefix + val, icon }",
	"\t)",
	"}",
	"",
]

let line = 'const cssValues = /* @__PURE__ */ toCompletions("", "enum", "'

cssValues.forEach(val => {
	line += val + (functions.has(val) ? "()" : "") + ","
})

lines.push(line.slice(0, -1) + '")', "")

line = 'const atRules = /* @__PURE__ */ toCompletions("@", "keyword", "'

data.atDirectives.forEach(({ name }) => {
	if (name[1] != "-") line += name.slice(1) + ","
})

lines.push(line.slice(0, -1) + '")', "")

const pseudos = new Set()
functions.clear()

data.pseudoClasses.forEach(({ name: value }) => {
	value = value.slice(1)
	if (value[0] == "-") return
	const bracketIndex = value.indexOf("(")
	const isFunction = bracketIndex >= 0
	const name = isFunction ? value.slice(0, bracketIndex) : value

	if (isFunction && !pseudos.has(name)) functions.add(name)
	if (!isFunction && functions.has(name)) functions.delete(name)
	pseudos.add(name)
})

functions.add("has")
functions.add("is")
functions.add("where")
functions.add("dir")
functions.add("lang")
functions.add("matches")
functions.add("state")
functions.add("host")
functions.add("host-context")
functions.add("not")
functions.add("nth-child")
functions.add("nth-of-type")
functions.add("nth-last-child")
functions.add("nth-last-of-type")

line = 'const pseudoClasses = /* @__PURE__ */ toCompletions(":", "function", "'
pseudos.forEach(pseudo => {
	line += pseudo + (functions.has(pseudo) ? "()" : "") + ","
})

lines.push(line.slice(0, -1) + '")', "")

pseudos.clear()
functions.clear()

data.pseudoElements.forEach(({ name: value }) => {
	value = value.slice(2)
	if (value[0] == "-") return
	const bracketIndex = value.indexOf("(")
	const isFunction = bracketIndex >= 0
	const name = isFunction ? value.slice(0, bracketIndex) : value

	if (isFunction && !pseudos.has(name)) functions.add(name)
	if (!isFunction && functions.has(name)) functions.delete(name)
	pseudos.add(name)
})

functions.add("part")
functions.add("slotted")
functions.add("highlight")
functions.add("picker")

line = 'const pseudoElements = /* @__PURE__ */ toCompletions("::", "function", "'

pseudos.forEach(pseudo => {
	line += pseudo + (functions.has(pseudo) ? "()" : "") + ","
})

lines.push(line.slice(0, -1) + '")', "")

lines.push("export { cssValues, atRules, pseudoClasses, pseudoElements }", "")

fs.writeFile("./src/extensions/autocomplete/css/data.ts", lines.join("\r\n"))
