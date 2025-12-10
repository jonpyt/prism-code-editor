/** @module autocomplete/javascript */

import { PrismEditor } from "../../../index.js"
import { TokenName } from "../../../prism/types.js"
import { braces, space } from "../../../prism/utils/jsx-shared.js"
import { re } from "../../../prism/utils/shared.js"
import { getClosestToken } from "../../../utils/index.js"
import { Bracket } from "../../matchBrackets/index.js"
import { Completion, CompletionContext, CompletionSource } from "../types.js"
import { findWords } from "../utils.js"

export type JSContext = {
	/**
	 * Whether autocomplete should be disabled due to happening inside a regex, string,
	 * comment or variable name declaration.
	 */
	disabled: boolean
	/**
	 * List of identifiers that were separated by `.` or `?.` before the cursor.
	 *
	 * Here's a list of strings before the cursor and the corresponding path:
	 * - `a.b.c` -> `["a", "b", "c"]`
	 * - `a.b.` -> `["a", "b", ""]`
	 *
	 * If there's no identifier before the cursor, the path will be `[""]`.
	 * If completion shouldn't happen where the cursor is, `path` will be `null`.
	 * If `tagMatch` is present, `path` will also be `null`.
	 */
	path: string[] | null
	/**
	 * If the current language is `jsx` or `tsx` and the cursor is in a tag, this match
	 * will be present.
	 *
	 * There are three capture groups:
	 * 1) The tag's name
	 * 2) The last attribute's name
	 * 3) Is present if the cursor is inside an attribute value
	 */
	tagMatch: null | RegExpExecArray
}

const identifierPattern = [/(?!\s)[$\w\xa0-\uffff]/.source]

const identifier = /* @__PURE__ */ re("^(?!\\d)<0>+$", identifierPattern)

const pathRE = /* @__PURE__ */ re(/(?:(?!\d)<0>+\s*\??\.\s*)*(?!\d)<0>*$/.source, identifierPattern)

const tagPattern = /* @__PURE__ */ re(
	/(?:^|[^\w$])(?:<|<(?!\d)([^\s%=<>/]+)(?:(?:<0>|<0>*<(?:[^<>=]|=[^<]|=?<(?:[^<>]|<[^<>]*>)*>)*>)(?:<0>*(?:([^\s"'{=<>/*]+)(?:<0>*=<0>*(?!\s)(?:"[^"]*"|'[^']*'|<1>)?|(?![^\s=]))|<1>))*<0>*(?:=<0>*("[^"]*|'[^']*))?)?)$/
		.source,
	[space, braces],
)

/**
 * Adds extra properties to the completion context used by JavaScript completion sources.
 */
const jsContext = (context: CompletionContext, editor: PrismEditor): JSContext => {
	const before = context.before
	const pos = context.pos
	const matcher = editor.extensions.matchBrackets
	let enabled = !getClosestToken(editor, ".comment,.regex", 0, 0, pos)
	let tagMatch: null | RegExpExecArray = null

	if (enabled) {
		if (context.language.slice(1) == "sx") {
			tagMatch = tagPattern.exec(before)
			if (tagMatch?.[0][1] == "<") {
				tagMatch[0] = tagMatch[0].slice(1)
				tagMatch.index++
			}
		}
		if (tagMatch && getClosestToken(editor, ".string,.comment,.regex", 0, 0, tagMatch.index + 1)) {
			tagMatch = null
		}
		if (!tagMatch) {
			enabled =
				!getClosestToken(editor, ".string,.plain-text", 0, 0, pos) &&
				!/\b(?:const|let|var|class|enum|function|interface|type)\s+(?:(?!\s)[$\w\xa0-\uffff])*$/.test(
					context.lineBefore,
				)
		}
	}

	if (enabled && matcher && !tagMatch) {
		let { brackets, pairs } = matcher
		let i = 0
		let bracket: Bracket
		for (; (bracket = brackets[i]); i++) {
			if (
				bracket[5] &&
				bracket[1] < pos &&
				brackets[pairs[i]!]?.[2] > pos &&
				/\b(?:const|let|var)\s*$/.test(before.slice(0, bracket[1]))
			) {
				enabled = false
				i = 9e9
			}
		}
	}

	return {
		tagMatch,
		disabled: !enabled,
		path:
			enabled && !tagMatch
				? before
						.slice(-999)
						.match(pathRE)![0]
						.split(/[\s?.]+/)
				: null,
	}
}

const shouldComplete = ({ path, explicit }: CompletionContext & { path: string[] | null }) =>
	path && (path[0] || explicit)

const getFrom = ({ path, pos }: CompletionContext & { path: string[] | null }) =>
	pos - path![path!.length - 1].length

const enumerateOwnProperties = (obj: any, commitChars?: string): [Completion[], Set<string>] => {
	let options: Completion[] = []
	let seen = new Set<string>()
	let boost = 0
	let temp = obj

	for (; temp; temp = Object.getPrototypeOf(temp), boost--) {
		Object.getOwnPropertyNames(temp).forEach(name => {
			if (!seen.has(name) && identifier.test(name)) {
				seen.add(name)
				let isFunc!: boolean
				try {
					isFunc = typeof obj[name] == "function"
				} catch (_) {}
				options.push({
					label: name,
					boost,
					commitChars,
					icon: isFunc
						? /[A-Z]/.test(name[0])
							? "class"
							: "function"
						: /^[A-Z_]+$/.test(name)
						? "constant"
						: "variable",
				})
			}
		})
	}

	return [options, seen]
}

/**
 * Returns a completion source that adds completions for a scope object.
 * @param scope Scope object you want to provide completions for. For example `window`.
 * @param commitChars If a character in this string is typed and one of these options
 * is selected, the option is inserted right before typing that character.
 */
const completeScope = (
	scope: any,
	commitChars?: string,
): CompletionSource<{ path: string[] | null }> => {
	const cache = new WeakMap<any, [Completion[], Set<string>]>()
	const scopeSource = _completeScope(cache, scope, commitChars)
	return context => {
		const result = scopeSource(context)
		if (result)
			return {
				from: getFrom(context),
				options: result[0],
			}
	}
}

const _completeScope = (
	cache: WeakMap<any, [Completion[], Set<string>]>,
	scope: any,
	commitChars?: string,
) => {
	return (context: CompletionContext & { path: string[] | null }) => {
		if (shouldComplete(context)) {
			let path = context.path!
			let target = scope
			let last = path.length - 1
			let i = 0
			while (i < last) {
				try {
					target = target[path[i++]]
					if (target == null) return
				} catch (_) {
					return
				}
			}
			target = Object(target)

			if (!cache.has(target)) cache.set(target, enumerateOwnProperties(target, commitChars))

			return cache.get(target)!
		}
	}
}

const includedTypes = new Set([
	"parameter",
	"class-name",
	"constant",
	"function",
	"property-access",
	"maybe-class-name",
	"generic-function",
	"expression",
])

const identifierFilter = (value: string) => (type: TokenName, start: number) =>
	includedTypes.has(type) || (type == "tag" && value[start] == "<")

const identifierSearch = re(/<0>+/.source, identifierPattern, "g")

/**
 * Completion source that searches the editor for identifiers and returns them as
 * completions. Best to avoid using this and {@link completeScope} at the same time.
 * @param identifiers List of identifiers that should be completed even if they're not
 * found in the editor.
 */
const completeIdentifiers = (identifiers?: Iterable<string>): CompletionSource<JSContext> => {
	return (context, editor) => {
		return shouldComplete(context)
			? {
					from: getFrom(context),
					options: Array.from(
						findWords(
							context,
							editor,
							identifierFilter(editor.value),
							identifierSearch,
							identifiers,
						),
						label => ({
							label,
							icon: "text",
						}),
					),
			  }
			: null
	}
}

/**
 * Completion source that wraps {@link completeIdentifiers} and {@link completeScope} and
 * removes duplicated options.
 *
 * This means you can provide completions for both the `window` and words in the document
 * without duplicated options.
 * @param scope Scope object you want to provide completions for. For example `window`.
 * @param identifiers LList of identifiers that should be completed even if they're not
 * found in the document.
 */
const jsCompletion = (scope: any, identifiers?: Iterable<string>): CompletionSource<JSContext> => {
	const cache = new WeakMap<any, [Completion[], Set<string>]>()
	const scopeSource = _completeScope(cache, scope)

	return (context, editor) => {
		if (shouldComplete(context)) {
			let completions: Completion[]
			let labels: Set<string> | undefined
			let scopeResult = scopeSource(context)
			if (scopeResult) {
				completions = scopeResult[0].slice()
				labels = scopeResult[1]
			} else completions = []

			findWords(
				context,
				editor,
				identifierFilter(editor.value),
				identifierSearch,
				identifiers,
			).forEach(word => {
				if (!labels?.has(word))
					completions.push({
						label: word,
						icon: "text",
					})
			})

			return {
				from: getFrom(context),
				options: completions,
			}
		}
	}
}

export { jsxTagCompletion } from "./jsx.js"
export { completeKeywords } from "./keywords.js"
export { globalReactAttributes, reactTags } from "./reactData.js"
export { jsSnipets } from "./snippets.js"
export { jsDocCompletion } from "./jsdoc.js"
export { jsContext, completeScope, completeIdentifiers, jsCompletion }
