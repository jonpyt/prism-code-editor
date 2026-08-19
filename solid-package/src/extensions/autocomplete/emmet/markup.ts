/** @module autocomplete/emmet */

import { Config, extract, ExtractOptions, markup, resolveConfig, UserConfig } from "emmet"
import { Completion, CompletionSource, TagConfig } from "../types"
import { getTagMatch } from "../markup"
import { JSContext } from "../javascript"
import { renderSnippet } from "../utils"
import { getClosestToken } from "../../../utils"

const replaceStopsWithCursors = (expanded: string, tabStops: number[]) => {
	let result = ""
	let i = 0
	let pos = 0
	while (i < tabStops.length) {
		result += expanded.slice(pos, (pos = tabStops[i + 1]))
		tabStops[i++] < tabStops[i++] || (result += "|")
	}
	return result + expanded.slice(pos)
}

const filterExpanded = (
	abbr: string,
	expaded: string,
	tags: TagConfig[] | null | undefined,
	hasComponents: boolean,
) => {
	const tag = /^(\w+)\.?$/.exec(abbr)?.[1]
	const last = abbr.slice(-1)

	// Allow valid tags as single words
	if (tag && !tags?.every(names => !hasOwn.call(names, tag))) return true
	if (tag && last == ".") return false

	// Allow custom elements
	if (/[:-]/.test(abbr) && last != ":") return true

	// Allow PascalCase tags in JSX
	if (hasComponents && /^[A-Z]\w*$/.test(abbr)) return true

	// Allow snippets and void tags
	return expaded != `<${abbr}></${abbr}>`
}

const syntaxMap: Record<string, string | undefined> = {
	html: "markup",
	svg: "markup",
	mathml: "markup",
	astro: "markup",
	tsx: "jsx",
}

const componentLangs = new Set(["astro", "vue", "svelte"])

const hasOwn = {}.hasOwnProperty

export type MarkupEmmetOptions = {
	/**
	 * List of objects whose keys will be allowed as single word completions even
	 * if they aren't Emmet snippets. This ensures random words aren't given as suggestions.
	 * Pass `null` or `undefined` to enable suggestions for all words.
	 */
	tags?: TagConfig[] | null
	/** Configuration options passed when resolving the Emmet config. */
	config?: UserConfig
	/**
	 * Pattern used for determining whether completion is happening inside a
	 * tag. Pass {@link svelteTag} for 'astro' or 'svelte'.  This is not needed for JSX
	 * since `tagMatch` from the completion context will be used instead. Defaults to a tag
	 * pattern for markup.
	 */
	tagPattern?: RegExp
	/** Options passed when extracting the abbreviation at the cursor's position */
	extractOptions?: Partial<ExtractOptions>
	/**
	 * Boost given to the score of the main abbreviation's completion option.
	 * A positive number moves it up the list, while a negative one moves it down.
	 * Defaults to 1.
	 */
	boost?(abbreviation: string, expanded: string, lang: string): number
	/**
	 * Boost given to the score of the suggestion completion options.
	 * A positive number moves them up the list, while a negative one moves them down.
	 */
	suggestBoost?(abbreviation: string, expanded: string, lang: string): number
	/**
	 * Whether extra suggestions should be shown that extend the last tag in the main
	 * abbreviation with Emmet snippets.
	 * @default true
	 */
	suggestSnippets?: boolean
	/**
	 * Whether extra suggestions should be shown that extend the last tag in the main
	 * abbreviation with available tags.
	 * @default true
	 */
	suggestTags?: boolean
	/**
	 * Icon displayed in the completion options.
	 * @default "property"
	 */
	icon?: Completion["icon"]
	/**
	 * Detail displayed in the completion options.
	 * @default "Emmet"
	 */
	detail?: string
	/**
	 * Whether the expanded abbreviation should be have syntax highlighting in the tooltip
	 * documentation. @default true
	 */
	highlight?: boolean
}

/**
 * Completion source that expands the emmet abbreviation at the cursor position as long
 * as the cursor isn't inside an XML tag or comment.
 *
 * @param options Options for controlling the outputted suggestions.
 * @returns A completion source.
 */
export const markupEmmetCompletion = (
	options: MarkupEmmetOptions = {},
): CompletionSource<JSContext | {}> => {
	let {
		tags,
		tagPattern,
		boost,
		suggestBoost,
		config,
		extractOptions,
		suggestSnippets = true,
		suggestTags = true,
		icon = "property",
		detail = "Emmet",
		highlight = true,
	} = options
	let tabStops: number[]
	let resolved: Config
	let tryExpand = (abbr: string) => {
		tabStops = []
		try {
			return [markup(abbr, resolved), tabStops] as const
		} catch (e) {}
	}

	return (context, editor) => {
		const isJsx = "tagMatch" in context

		if (
			isJsx
				? context.tagMatch ||
				  (context.disabled && !getClosestToken(editor, ".plain-text", 0, 0, context.pos))
				: getTagMatch(context, editor, tagPattern) != null
		)
			return

		const { abbreviation, start, end } = extract(editor.value, context.pos, extractOptions) || {}
		const language = context.language

		if (
			!abbreviation ||
			// Filter abbrevations wrapped in () or {}, starting with a digit or more than one dot
			/^\d|^\{[^}]*\}$|^\([^)]*\)$|^\.\.+$/.test(abbreviation) ||
			// Filter object[expression] in JSX
			(isJsx && /^\w*\[[^\]]*\]$/.test(abbreviation))
		)
			return

		resolved ||= resolveConfig({
			maxRepeat: 999,
			syntax: syntaxMap[language] || language,
			...config,
			options: {
				"output.compactBoolean": true,
				"output.selfClosingStyle": language == "xml" ? language : isJsx ? "xhtml" : "html",
				...config?.options,
				"output.field"(_index, placeholder, offset) {
					tabStops.push(offset, offset + placeholder.length)
					return placeholder
				},
			},
		})

		const result = tryExpand(abbreviation)

		if (!result) return

		const [expandedAbbr, stops] = result
		const items: Completion[] = []

		const addCompletion = (
			abbr: string,
			expanded: string,
			stops: number[],
			boost?: (abbreviation: string, expanded: string, lang: string) => number,
			label?: string,
			from?: number,
		) =>
			items.push({
				label: label || abbr,
				detail,
				icon,
				boost: boost ? boost(abbr, expanded, language) : label ? 0 : 1,
				from,
				insert: expanded,
				tabStops: stops,
				renderDocs() {
					return [
						highlight
							? renderSnippet(replaceStopsWithCursors(expanded, stops!), "xml")
							: replaceStopsWithCursors(expanded, stops!),
					]
				},
			})

		const match = /(^|[>+])([\w:-]+)$/.exec(abbreviation)

		if (filterExpanded(abbreviation, expandedAbbr, tags, isJsx || componentLangs.has(language))) {
			addCompletion(abbreviation, expandedAbbr, stops, boost)
		}

		if (match) {
			const lastTag = match[2]
			const from = start! + match.index + match[1].length
			const records: Record<string, unknown>[] = []
			const found = new Set<string>()

			if (suggestSnippets) records.push(resolved.snippets)
			if (suggestTags && tags) records.push(...tags)

			for (const record of records) {
				for (const snippet in record) {
					if (
						lastTag != snippet &&
						lastTag == snippet.slice(0, lastTag.length) &&
						!found.has(snippet)
					) {
						found.add(snippet)

						const currentAbbr = abbreviation + snippet.slice(lastTag.length)
						const [expanded, stops] = tryExpand(currentAbbr) || []

						if (expanded) {
							addCompletion(currentAbbr, expanded, stops!, suggestBoost, snippet, from)
						}
					}
				}
			}
		}

		return {
			from: start!,
			to: end,
			options: items,
		}
	}
}
