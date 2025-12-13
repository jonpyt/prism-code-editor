import "../languages/index.js"
import { matchBrackets } from "../extensions/matchBrackets/index.js"
import { highlightBracketPairs } from "../extensions/matchBrackets/highlight.js"
import { indentGuides } from "../extensions/guides.js"
import { cursorPosition } from "../extensions/cursor.js"
import { defaultCommands, editHistory } from "../extensions/commands.js"
import { EditorExtension } from "../index.js"
import {
	searchWidget,
	showInvisibles,
	highlightSelectionMatches,
} from "../extensions/search/index.js"
import { matchTags } from "../extensions/matchTags.js"
import searchStyle from "../extensions/search/search.css?inline"
import invisibles from "../extensions/search/invisibles.css?inline"

export const basic = (): EditorExtension[] => [
	defaultCommands(),
	indentGuides(),
	matchBrackets(),
	highlightBracketPairs(),
	cursorPosition(),
	highlightSelectionMatches(),
	searchWidget(),
	showInvisibles(),
	matchTags(),
	editHistory(),
]

export const style = searchStyle + invisibles
