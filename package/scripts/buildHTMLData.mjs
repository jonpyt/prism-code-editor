import fs from "node:fs/promises"

/**
 * @typedef HTMLData
 * @property {number} version
 * @property {HTMLTag[]} tags
 * @property {Attribute[]} globalAttributes
 * @property {ValueSet[]} valueSets
 *
 * @typedef HTMLTag
 * @property {string} name
 * @property {Attribute[]} attributes
 *
 * @typedef Attribute
 * @property {string} name
 * @property {string | undefined} valueSet
 *
 * @typedef ValueSet
 * @property {string} name
 * @property {AttrValue[]} values
 *
 * @typedef AttrValue
 * @property {string} name
 */

/** @type {HTMLData} */
const data = JSON.parse(
	await fs.readFile("./node_modules/@vscode/web-custom-data/data/browsers.html-data.json", {
		encoding: "utf-8",
	}),
)

/** @type {Set<string>} */
const usedValueSets = new Set()

/** @param {string | undefined} name */
const getAttrVariable = name => {
	if (!name || name == "v") return "null"
	usedValueSets.add(name)
	return "attrValue" + name[0].toUpperCase() + name.slice(1)
}

/** @param {string} name */
const getPropName = name => {
	return name.includes("-") ? `"${name}"` : name
}

const lines = [
	"// generated from @vscode/web-custom-data package",
	"",
	'import { AttributeConfig, TagConfig } from "../types.js"',
	"",
	"",
	"const htmlEventHandlers: AttributeConfig = {",
]

const globals = new Set()

data.globalAttributes.find(attr => attr.name == "inputmode").valueSet = "im"
data.globalAttributes.find(attr => attr.name == "contenteditable").valueSet = "ce"

data.globalAttributes.forEach(({ name, valueSet }) => {
	if (name.slice(0, 2) != "on" || globals.has(name)) return
	globals.add(name)
	lines.push(`\t${getPropName(name)}: ${getAttrVariable(valueSet)},`)
})

lines.push("}", "", "const ariaAttributes: AttributeConfig = {")

data.globalAttributes.forEach(({ name, valueSet }) => {
	if (name.slice(0, 5) != "aria-" || globals.has(name)) return
	globals.add(name)
	lines.push(`\t${getPropName(name)}: ${getAttrVariable(valueSet)},`)
})

lines.push(
	"}",
	"",
	"const globalHtmlAttributes: AttributeConfig = {",
	"\t...ariaAttributes,",
	"\t...htmlEventHandlers,",
)

data.globalAttributes.forEach(attr => {
	if (globals.has(attr.name)) return
	globals.add(attr.name)
	lines.push(`\t${getPropName(attr.name)}: ${getAttrVariable(attr.valueSet)},`)
})

lines.push("}", "", "const empty: AttributeConfig = {}", "", "const htmlTags: TagConfig = {")

data.tags.forEach(tag => {
	const attrs = tag.attributes
	if (!attrs.length) lines.push(`\t${tag.name}: empty,`)
	else {
		lines.push(`\t${tag.name}: {`)
		const seen = new Set()
		attrs.forEach(attr => {
			if (seen.has(attr.name) || globals.has(attr.name)) return
			seen.add(attr.name)
			lines.push(`\t\t${getPropName(attr.name)}: ${getAttrVariable(attr.valueSet)},`)
		})
		lines.push("\t},")
	}
})

/** @type {string[]} */
const valueSets = []

data.valueSets.push({
	name: "ce",
	values: ["true", "false", "plaintext-only"].map(name => ({ name })),
})

data.valueSets.find(set => set.name == "im").values = [
	"none",
	"text",
	"decimal",
	"numeric",
	"tel",
	"search",
	"email",
	"url",
].map(name => ({ name }))

lines.push(
	"}",
	"",
	"export {",
	"\tglobalHtmlAttributes,",
	"\thtmlTags,",
	"\tariaAttributes,",
	"\thtmlEventHandlers,",
)

data.valueSets.forEach(valueSet => {
	if (usedValueSets.has(valueSet.name)) {
		let setName = getAttrVariable(valueSet.name)
		let line = `const ${setName} = [`
		let hasBools = !!valueSet.values.find(value => value.name == "true")

		lines.push(`\t${setName},`)
		if (hasBools) line += '"true", "false"'

		valueSet.values.forEach(({ name }, i) => {
			if (/^true$|^false$|^doc-|\s/.test(name)) return
			if (i || hasBools) line += ", "
			line += `"${name}"`
		})
		valueSets.push(line + "]")
	}
})

lines.splice(4, 0, ...valueSets)
lines.push("}", "")

fs.writeFile("./src/extensions/autocomplete/markup/data.ts", lines.join("\r\n"))
