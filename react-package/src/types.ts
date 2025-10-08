import type { BracketMatcher } from "./extensions/match-brackets"
import type { TokenStream } from "./prism"
import type { Cursor } from "./extensions/cursor"
import type { EditHistory } from "./extensions/commands"
import type { TagMatcher } from "./extensions/match-tags"
import type { SearchWidget } from "./extensions/search/widget"
import type { ReadOnlyCodeFolding } from "./extensions/folding"
import type { AutoComplete } from "./extensions/autocomplete"
import type { ReactNode } from "react"

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
	 * `prism-react-editor/rtl-layout.css` to work. @default false
	 */
	rtl?: boolean
	/** Inline styles for the container element. */
	style?: Omit<React.CSSProperties, "tabSize">
	/** Additional classes for the container element. */
	className?: string
	/** Extra props for the textarea. Some properties are not supported. */
	textareaProps?: Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, OmittedTextareaProps>
	/** Function called when the code of the editor changes. */
	onUpdate?(value: string, editor: PrismEditor): void
	/** Function called when the selection changes in the editor. */
	onSelectionChange?(selection: InputSelection, value: string, editor: PrismEditor): void
	/** Function called before the tokens are stringified to HTML. */
	onTokenize?(tokens: TokenStream, language: string, value: string, editor: PrismEditor): void
	/** Function used to add extensions and render overlays. */
	children?(editor: PrismEditor): ReactNode
}

type OmittedTextareaProps =
	| "ref"
	| "autoFocus"
	| "value"
	| "defaultValue"
	| "className"
	| "cols"
	| "rows"

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

export type EditorEventMap = {
	update(value: string): void
	selectionChange(selection: InputSelection, value: string): void
	tokenize(tokens: TokenStream, language: string, value: string): void
}

export type PrismEditor = {
	/** This is the outermost element of the editor. */
	container?: HTMLDivElement
	/** Element wrapping the lines and overlays. */
	wrapper?: HTMLDivElement
	/** Collection containing the overlays as the first element, followed by all code lines. */
	lines?: HTMLCollectionOf<HTMLDivElement>
	/** Underlying `textarea` in the editor. */
	textarea?: HTMLTextAreaElement
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
	/** Whether the `textarea` is focused. */
	readonly focused: boolean
	/** Tokens currently displayed in the editor. */
	readonly tokens: TokenStream
	/**
	 * Adds a listener for editor events with the specified name.
	 * @returns A cleanup function that removes the listener.
	 */
	on<T extends keyof EditorEventMap>(this: void, name: T, listener: EditorEventMap[T]): () => void
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
