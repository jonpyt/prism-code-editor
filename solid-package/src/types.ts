import type { TokenStream } from "./prism/index"
import type { JSX } from "solid-js"
import type { BracketMatcher } from "./extensions/match-brackets"
import type { Cursor } from "./extensions/cursor"
import type { EditHistory } from "./extensions/commands"
import type { TagMatcher } from "./extensions/match-tags"
import type { SearchWidget } from "./extensions/search/widget"
import type { ReadOnlyCodeFolding } from "./extensions/folding"
import type { AutoComplete } from "./extensions/autocomplete"

export type EditorProps = {
	/**
	 * Language used for syntax highlighting. If the language doesn't have a registered
	 * Prism grammar, syntax highlighting will be disabled. @default "text"
	 */
	language: string
	/** Tabsize for the editor. @default 2 */
	tabSize?: number | undefined
	/** Whether the editor should insert spaces for indentation. @default true */
	insertSpaces?: boolean | undefined
	/** Whether line numbers should be shown. @default true */
	lineNumbers?: boolean | undefined
	/** Whether the editor should be read only. @default false */
	readOnly?: boolean | undefined
	/** Whether the editor should have word wrap. @default false */
	wordWrap?: boolean | undefined
	/** Code to display in the editor. */
	value: string
	/**
	 * Whether the editor uses right to left directionality. Requires styles from
	 * `solid-prism-editor/rtl-layout.css` to work.
	 * @default false
	 */
	rtl?: boolean
	/** Inline styles for the container element. */
	style?: Omit<JSX.CSSProperties, "tab-size">
	/** Additional classes for the container element. */
	class?: string
	/** Callback used to access the underlying editor */
	onMount?(editor: PrismEditor): void
	/**
	 * Function called after the editor's value has been updated as a result of user input.
	 * It's called right before the signal for the selection is updated.
	 */
	onUpdate?(value: string, editor: PrismEditor): void
	/** Function called after the editor's selection changes. */
	onSelectionChange?(selection: InputSelection, value: string, editor: PrismEditor): void
	/** List of extensions added to the editor */
	extensions?: Extension[]
}

/**
 * Function called when a certain key is pressed.
 * If true is returned, `e.preventDefault()` and `e.stopImmediatePropagation()` is called automatically.
 */
export type KeyCommandCallback = (
	e: KeyboardEvent,
	selection: InputSelection,
	value: string,
) => void | boolean
/**
 * Function called when a certain input is typed.
 * If true is returned, `e.preventDefault()` and `e.stopImmediatePropagation()` is called automatically.
 */
export type InputCommandCallback = (
	e: InputEvent,
	selection: InputSelection,
	value: string,
) => void | boolean
export type InputSelection = [number, number, "forward" | "backward" | "none"]

export type Extension = (editor: PrismEditor) => JSX.Element | void

export type PrismEditor = {
	/** This is the outermost element of the editor. */
	readonly container: HTMLDivElement
	/** Element wrapping the lines and overlays. */
	readonly wrapper: HTMLDivElement
	/** Collection containing the overlays as the first element, followed by all code lines. */
	readonly lines: HTMLCollectionOf<HTMLDivElement>
	/** Underlying `textarea` in the editor. */
	readonly textarea: HTMLTextAreaElement
	/** Current value of the editor. */
	readonly value: string
	/** Line number of the line with the cursor. */
	readonly activeLine: number
	/** Current props for the editor. */
	readonly props: EditorProps
	/** Record mapping an input to a function called when that input is typed. */
	readonly inputCommandMap: Record<string, InputCommandCallback | null | undefined>
	/** Record mapping KeyboardEvent.key to a function called when that key is pressed. */
	readonly keyCommandMap: Record<string, KeyCommandCallback | null | undefined>
	/** Object storing some of the extensions added to the editor. */
	readonly extensions: {
		matchBrackets?: BracketMatcher
		matchTags?: TagMatcher
		cursor?: Cursor
		searchWidget?: SearchWidget
		history?: EditHistory
		folding?: ReadOnlyCodeFolding
		autoComplete?: AutoComplete
	}
	/** Reactive accessor for whether the `textarea` is focused. */
	focused(this: void): boolean
	/** Reactive accessor for the tokens currently displayed in the editor. */
	tokens(this: void): TokenStream
	/** Reactive accessor for the current selection. */
	selection(this: void): InputSelection
	/** Forces the editor to update. Can be useful after modifying a grammar for example. */
	update(this: void): void
	/** Gets the `selectionStart`, `selectionEnd` and `selectionDirection` for the `textarea`. */
	getSelection(this: void): InputSelection
}

export type CommentTokens = {
	line?: string
	block?: [string, string]
}

export type Language = {
	/** Comment tokens used by the language. */
	comments?: CommentTokens
	/**
	 * Method called when a user executes a comment toggling command.
	 * @param editor The editor the user is interacting with.
	 * @param position Where in the code the comment is being toggled.
	 * @param value Current code in the editor.
	 * @returns The comment tokens that should be used for this command.
	 */
	getComments?(editor: PrismEditor, position: number, value: string): CommentTokens
	/**
	 * Callbacks controlling the automatic indentation on new lines.
	 * First function should return whether indentation should be increased.
	 * Second function should return whether to add an extra line after the cursor.
	 */
	autoIndent?: [
		((selection: InputSelection, value: string, editor: PrismEditor) => boolean)?,
		((selection: InputSelection, value: string, editor: PrismEditor) => boolean)?,
	]
	/**
	 * Function called when the user types `>`. Intended to auto close tags.
	 * @returns string which will get inserted behind the cursor.
	 */
	autoCloseTags?(selection: InputSelection, value: string, editor: PrismEditor): string | undefined
}
