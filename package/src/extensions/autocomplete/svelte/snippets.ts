import { Completion } from "../types.js"
import { renderSnippet } from "../utils.js"

const renderDocs = (item: Completion) => [renderSnippet(`{${item.insert}}`, "svelte")]

const svelteBlockSnippets: Completion[] = [
	{
		label: "#await",
		icon: "keyword",
		insert: "#await promise then value}\n\t\n{/await",
		tabStops: [7, 14, 20, 25, 28],
		renderDocs,
	},
	{
		label: "#await then",
		icon: "keyword",
		insert: "#await promise}\n\t\n{:then value}\n\t\n{/await",
		tabStops: [7, 14, 17, 17, 25, 30, 33],
		renderDocs,
	},
	{
		label: "#await catch",
		icon: "keyword",
		insert: "#await promise}\n\t\n{:then value}\n\t\n{:catch error}\n\t\n{/await",
		tabStops: [7, 14, 17, 17, 25, 30, 33, 33, 42, 47, 50],
		renderDocs,
	},
	{
		label: "#each",
		icon: "keyword",
		insert: "#each items as item}\n\t\n{/each",
		tabStops: [6, 11, 15, 19, 22],
		renderDocs,
	},
	{
		label: "#if",
		icon: "keyword",
		insert: "#if condition}\n\t\n{/if",
		tabStops: [4, 13, 16],
		renderDocs,
	},
	{
		label: "#key",
		icon: "keyword",
		insert: "#key value}\n\t\n{/key",
		tabStops: [5, 10, 13],
		renderDocs,
	},
	{
		label: "#snippet",
		icon: "keyword",
		insert: "#snippet name(params)}\n\t\n{/snippet",
		tabStops: [9, 13, 14, 20, 24],
		renderDocs,
	},
	{
		label: "@const",
		icon: "keyword",
		insert: "@const name = value",
		tabStops: [7, 11, 14, 19],
		renderDocs,
	},
	{
		label: "@debug",
		icon: "keyword",
	},
	{
		label: "@html",
		icon: "keyword",
	},
	{
		label: "@render",
		icon: "keyword",
		insert: "@render snippet(params)",
		tabStops: [8, 15, 16, 22],
		renderDocs,
	},
	{
		label: ":catch",
		icon: "keyword",
	},
	{
		label: ":else",
		icon: "keyword",
	},
	{
		label: ":else if",
		icon: "keyword",
	},
	{
		label: ":then",
		icon: "keyword",
	},
]

export { svelteBlockSnippets }
