import { useDefaultCommands, useEditHistory } from "./extensions/commands"
import { useCursorPosition } from "./extensions/cursor"
import { IndentGuides } from "./extensions/guides"
import { useBracketMatcher } from "./extensions/match-brackets"
import { useHighlightBracketPairs } from "./extensions/match-brackets/highlight"
import { useHighlightMatchingTags, useTagMatcher } from "./extensions/match-tags"
import {
	useHighlightSelectionMatches,
	useSearchWidget,
	useShowInvisibles,
} from "./extensions/search"
import {
	blockCommentFolding,
	bracketFolding,
	markdownFolding,
	tagFolding,
	useReadOnlyCodeFolding,
} from "./extensions/folding"
import { useCopyButton } from "./extensions/copy-button"
import { usePrismEditor } from "./extensions"

/**
 * Component adding the following extensions:
 * - {@link useBracketMatcher}
 * - {@link useHighlightBracketPairs}
 * - {@link useTagMatcher}
 * - {@link useHighlightMatchingTags}
 * - {@link useDefaultCommands}
 * - {@link useEditHistory}
 * - {@link useSearchWidget}
 * - {@link useHighlightSelectionMatches}
 * - {@link useShowInvisibles}
 * - {@link useCursorPosition}
 * - {@link IndentGuides}
 *
 * Requires styling from `prism-react-editor/search.css` for the search widget.
 * To highlight selected spaces and tabs, import `prism-react-editor/invisibles.css`.
 */
const BasicSetup = () => {
	const [editor] = usePrismEditor()
	useBracketMatcher(editor)
	useHighlightBracketPairs(editor)
	useTagMatcher(editor)
	useHighlightMatchingTags(editor)
	useDefaultCommands(editor)
	useEditHistory(editor)
	useSearchWidget(editor)
	useHighlightSelectionMatches(editor)
	useShowInvisibles(editor)
	useCursorPosition(editor)

	return <IndentGuides />
}

/**
 * Component adding the following extensions:
 * - {@link useBracketMatcher}
 * - {@link useHighlightBracketPairs}
 * - {@link useTagMatcher}
 * - {@link useHighlightMatchingTags}
 * - {@link useHighlightSelectionMatches}
 * - {@link IndentGuides}
 * - {@link useCopyButton}
 * - {@link useReadOnlyCodeFolding} with {@link bracketFolding}, {@link tagFolding},
 * {@link blockCommentFolding}, and {@link markdownFolding}
 *
 * Intended to be used with read-only editors.
 *
 * Requires styling from `prism-react-editor/copy-button.css` for the copy button
 * and from `prism-react-editor/code-folding.css` for the code folding.
 */
const ReadOnlySetup = () => {
	const [editor] = usePrismEditor()
	useBracketMatcher(editor)
	useHighlightBracketPairs(editor)
	useTagMatcher(editor)
	useHighlightMatchingTags(editor)
	useHighlightSelectionMatches(editor)
	useCopyButton(editor)
	useReadOnlyCodeFolding(editor, bracketFolding, tagFolding, blockCommentFolding, markdownFolding)

	return <IndentGuides />
}

export { BasicSetup, ReadOnlySetup }
