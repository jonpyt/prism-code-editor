import { JSContext } from "./index.js"
import { AttributeConfig, Completion, CompletionSource, TagConfig } from "../types.js"
import { optionsFromKeys } from "../utils.js"

/**
 * Completion source that adds autocompletion for JSX tags.
 * @param tags Object mapping tag-names to completable attributes for that tag.
 * @param globalAttributes Completable attributes shared by all tags.
 * @returns A Completion source. Requires a JavaScript context to work.
 */
const jsxTagCompletion = (
	tags: TagConfig,
	globalAttributes: AttributeConfig,
): CompletionSource<JSContext> => {
	const tagOptions = optionsFromKeys(tags, "property")
	const attrOptions = optionsFromKeys(globalAttributes, "enum")

	return ({ tagMatch, explicit }) => {
		if (tagMatch && (explicit || /\S/.test(tagMatch[0].slice(-1)))) {
			let [tag, tagName, lastAttr, lastAttrValue] = tagMatch
			let start = tagMatch.index
			let from = start + 1
			let options: Completion[] | undefined | 0 = tagOptions

			if (/[\s/>]/.test(tag)) {
				let tagAttrs = tags[tagName]
				from = start + tag.search(/[^\s"'{}=<>]*$/)

				if (lastAttrValue) {
					options = (globalAttributes[lastAttr] || tagAttrs?.[lastAttr])?.map(val => ({
						label: val,
						icon: "unit",
					}))
				} else {
					options =
						tag.slice(-1) == "=" || !tagAttrs
							? 0
							: attrOptions.concat(optionsFromKeys(tagAttrs, "enum"))
				}
			}

			if (options) {
				return {
					from,
					options,
				}
			}
		}
	}
}

export { jsxTagCompletion }
