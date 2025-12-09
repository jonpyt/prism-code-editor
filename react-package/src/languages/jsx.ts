import { CommentTokens } from ".."
import { languageMap } from "../core"
import { Bracket, BracketMatcher } from "../extensions/match-brackets"
import { Tag, TagMatcher } from "../extensions/match-tags"
import { getClosestToken, getLineBefore } from "../utils"
import { autoCloseTags, braces, clikeComment, clikeIndent, space, testBracketPair } from "./shared"

const openingTag = RegExp(
	`(?:^|[^\\w$])<(?:(?!\\d)([^\\s%=<>/]+)(?:(?:${space}|${space}*<(?:[^<>=]|=[^<]|=?<(?:[^<>]|<[^<>]*>)*>)*>)(?:${space}*(?:[^\\s"'{=<>/*]+(?:${space}*=${space}*(?!\\s)(?:"[^"]*"|'[^']*'|${braces})?|(?=[\\s/>]))|${braces}))+)?${space}*)?>[ 	]*$`,
)

const closingTag = /^<\/(?!\d)[^\s%=<>/]*\s*>/

const inJsxContext = (
	{ tags, pairs }: TagMatcher,
	{ brackets, pairs: bracketPairs }: BracketMatcher,
	position: number,
) => {
	for (let i = tags.length, tag: Tag, min = 0; (tag = tags[--i]); ) {
		if (tag[2] > position && tag[1] < position) min = tag[1]
		else if (
			!tag[4] &&
			tag[5] &&
			tag[1] >= min &&
			tag[2] <= position &&
			!(tags[pairs[i]!]?.[1] < position)
		) {
			for (let i = brackets.length, bracket: Bracket; (bracket = brackets[--i]); ) {
				if (
					bracket[1] >= tag[2] &&
					bracket[1] < position &&
					bracket[4] == "{" &&
					!(brackets[bracketPairs[i]!]?.[1] < position)
				) {
					return
				}
			}
			return true
		}
	}
}

const jsxComment: CommentTokens = {
	block: ["{/*", "*/}"],
}

languageMap.jsx = languageMap.tsx = {
	comments: clikeComment,
	getComments(editor, position) {
		const { matchBrackets, matchTags } = editor.extensions
		const inJsx =
			matchBrackets && matchTags
				? inJsxContext(matchTags, matchBrackets, position)
				: getClosestToken(editor, ".plain-text", 0, 0, position)
		return inJsx ? jsxComment : clikeComment
	},
	autoIndent: [
		([start], value) =>
			openingTag.test(value.slice(0, start)) || clikeIndent.test(getLineBefore(value, start)),
		(selection, value) =>
			testBracketPair(selection, value) ||
			(openingTag.test(value.slice(0, selection[0])) && closingTag.test(value.slice(selection[1]))),
	],
	autoCloseTags: ([start, end], value, editor) => {
		return autoCloseTags(editor, start, end, value, openingTag)
	},
}
