/** @module autocomplete/svelte */

import { braces } from "../../../prism/utils/jsx-shared.js"
import { re } from "../../../prism/utils/shared.js"
import { htmlEventHandlers } from "../markup/data.js"
import {
	getTagMatch,
	globalHtmlAttributes,
	globalSvgAttributes,
	htmlTags,
	svgTags,
} from "../markup/index.js"
import { AttributeConfig, Completion, CompletionSource, TagConfig } from "../types.js"
import { attrSnippet, completionsFromRecords, optionsFromKeys } from "../utils.js"

/**
 * Pattern used to determine if a string ends inside a Svelte or Astro tag. The pattern
 * has two capturing groups: the tag's name and the last attribute's name.
 */
const svelteTag = /* @__PURE__ */ re(
	/<$|<(?![\d!])([^\s%=<>/]+)(?:\s(?:\s*([^\s{=<>/]+)(?:\s*=\s*(?!\s)(?:"[^"]*(?:"|$)|'[^']*(?:'|$)|[^\s{=<>/"']+(?!\S])|<0>)?|(?![^\s=]))|\s*<0>)*)?\s*$/
		.source,
	[braces],
)

const globalBinds = [
	"innerHTML",
	"textContent",
	"innerText",
	"contentRect",
	"contentBoxSize",
	"borderBoxSize",
	"devicePixelContentBoxSize",
	"focused",
	"this",
]

const mediaBinds = [
	"readyState",
	"duration",
	"buffered",
	"played",
	"seekable",
	"seeking",
	"ended",
	"muted",
	"volume",
	"currentTime",
	"playbackRate",
	"paused",
]

const bindAttrs: Record<string, string[] | undefined> = {
	audio: mediaBinds,
	input: ["checked", "files", "group", "indeterminate", "value"],
	select: ["value"],
	textarea: ["value"],
	video: mediaBinds.concat("videoHeight", "videoWidth"),
	"svelte:document": [
		"activeElement",
		"fullscreenElement",
		"pointerLockElement",
		"visibilityState",
	],
	"svelte:window": [
		"innerWidth",
		"innerHeight",
		"outerWidth",
		"outerHeight",
		"devicePixelRatio",
		"scrollX",
		"scrollY",
		"online",
	],
}

const svelteTags: TagConfig = {
	"svelte:boundary": {
		onerror: null,
	},
	"svelte:window": htmlEventHandlers,
	"svelte:document": htmlEventHandlers,
	"svelte:body": htmlEventHandlers,
	"svelte:head": htmlEventHandlers,
	"svelte:element": {
		...globalHtmlAttributes,
		this: null,
	},
	"svelte:options": {
		customElement: null,
		namespace: ["html", "svg", "mathml"],
		css: ["injected"],
		runes: null,
	},
}

const createCompletion = (label: string, icon?: Completion["icon"]): Completion => ({
	label,
	icon,
})

const tagNames = completionsFromRecords([htmlTags, svgTags, svelteTags], "property")

const enumerateAttrs = (attrs: AttributeConfig, result: Completion[] = []) => {
	for (let attr in attrs) {
		if (attr.slice(0, 2) == "on") {
			result.push(
				attrSnippet("on:" + attr.slice(2), "{}", "event"),
				attrSnippet(attr, "{}", "event"),
				attrSnippet(attr + "capture", "{}", "event"),
			)
		} else {
			result.push(createCompletion(attr, "enum"))
		}
	}
	return result
}

const addBinds = (binds: string[], options: Completion[]) => {
	for (let i = 0; i < binds.length; ) {
		options.push(attrSnippet("bind:" + binds[i++], "{}", "enum"))
	}
}

/**
 * Completion source that adds completion for HTML and SVG tags to Svelte. When configured,
 * it can also provide completions for specific Svelte components.
 * @param blockSnippets Snippets used to complete Svelte blocks such as `{#each}`.
 * @param components Used to configure autocompletion for Svelte components. This is an
 * object mapping each component's name to the properties available for that component.
 * @param nestedSource Completion source that will be used whenever the completion isn't
 * happening inside a tag or Svelte block. Can be used to provide completions for snippets
 * for example.
 */
const svelteCompletion =
	(
		blockSnippets?: Completion[],
		components?: TagConfig,
		nestedSource?: CompletionSource,
	): CompletionSource =>
	(context, editor) => {
		const tagMatch = getTagMatch(context, editor, svelteTag)

		if (tagMatch) {
			let [tag, tagName, lastAttr] = tagMatch
			let start = tagMatch.index
			let from = start + 1
			let options: Completion[] | undefined

			if (/\s/.test(tag)) {
				let tags = [htmlTags, svgTags, svelteTags, components]
				let globalAtts = [globalHtmlAttributes, globalSvgAttributes]
				let inAttrValue = /=\s*(?:"[^"]*|'[^']*|[^\s"'=]*)$/.test(tag)
				let i = 0
				let currentTags: TagConfig | undefined
				from = start + tag.search(/[^\s"'=]*$/)
				for (; (currentTags = tags[i]); i++) {
					let globals = globalAtts[i]
					let tagAttrs = currentTags[tagName]

					if (tagAttrs) {
						if (inAttrValue) {
							options = (globals?.[lastAttr] || tagAttrs[lastAttr])?.map(val =>
								createCompletion(val, "unit"),
							)
						} else {
							options = enumerateAttrs(tagAttrs, [])
							if (globals) enumerateAttrs(globals, options)
							if (bindAttrs[tagName]) addBinds(bindAttrs[tagName], options)
							if (globals || (i == 2 && "onclick" in tagAttrs)) addBinds(globalBinds, options)
						}

						break
					}
				}
			} else {
				options = components ? tagNames.concat(optionsFromKeys(components, "property")) : tagNames
			}

			if (options) {
				return {
					from,
					options,
				}
			}
		}

		if (tagMatch != false) {
			const blockMatch = blockSnippets && /\{[#@:]\w*$/.exec(context.lineBefore)
			if (blockMatch) {
				return {
					from: context.pos + 1 - blockMatch[0].length,
					options: blockSnippets,
				}
			}
			return nestedSource?.(context, editor)
		}
	}

export { svelteCompletion, svelteTag, svelteTags }
export * from "./snippets.js"
