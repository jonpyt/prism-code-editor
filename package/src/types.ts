import { BracketMatcher } from "./extensions/matchBrackets/index.js"
import { TagMatcher } from "./extensions/matchTags.js"
import { Cursor } from "./extensions/cursor/index.js"
import { SearchWidget } from "./extensions/search/widget.js"
import { ReadOnlyCodeFolding } from "./extensions/folding/index.js"
import { TokenStream } from "./prism/types.js"
import { EditHistory } from "./extensions/commands.js"
import { AutoComplete } from "./extensions/autocomplete/types.js"

export type EditorOptions<T extends {} = {}> = {
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
	 * `prism-code-editor/rtl-layout.css` to work unless the setups are used.
	 * @default false
	 */
	rtl?: boolean
	/**
	 * Additional classes for the root container. Useful to style individual editors.
	 * The `.prism-code-editor` selector can be used to style all editors.
	 */
	class?: string
	/** Function called when the code of the editor changes. */
	onUpdate?(value: string, editor: PrismEditor<T>): void
	/** Function called when the selection changes in the editor. */
	onSelectionChange?(selection: InputSelection, value: string, editor: PrismEditor<T>): void
	/** Function called before the tokens are stringified to HTML. */
	onTokenize?(tokens: TokenStream, language: string, value: string, editor: PrismEditor<T>): void
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

export interface Extension<T extends {} = {}> {
	/** Function called when the extension is added or the options of the editor change. */
	update(editor: PrismEditor<T>, options: EditorOptions & Omit<T, keyof EditorOptions>): any
}

export interface BasicExtension<T extends {} = {}> {
	(editor: PrismEditor<T>, options: EditorOptions & T): any
}

export type EditorExtension<T extends {} = {}> = Extension<T> | BasicExtension<T>

export type EditorEventMap<T extends {} = {}> = {
	update(this: PrismEditor<T>, value: string): any
	selectionChange(this: PrismEditor<T>, selection: InputSelection, value: string): any
	tokenize(this: PrismEditor<T>, tokens: TokenStream, language: string, value: string): any
}

export interface PrismEditor<T extends {} = {}> {
	/** This is the outermost element of the editor. */
	readonly container: HTMLDivElement
	/** Element wrapping the lines and overlays. */
	readonly wrapper: HTMLDivElement
	/**
	 * Collection containing the overlays as the first element. The rest of the elements
	 * are the code lines. This means the index of a line is the same as its line number.
	 */
	readonly lines: HTMLCollectionOf<HTMLDivElement>
	/** Underlying `<textarea>` in the editor. */
	readonly textarea: HTMLTextAreaElement
	/**
	 * The line number of the line the cursor is currently on. You can use
	 * `editor.lines[editor.activeLine]` to get the element for the active line.
	 */
	readonly activeLine: number
	/** Whether the `textarea` is focused. */
	readonly focused: boolean
	/** Current code in the editor. Same as `textarea.value`. */
	readonly value: string
	/**
	 * Current options for the editor. The event handlers can be changed by
	 * mutating this object. Use `setOptions` to change the other options.
	 */
	readonly options: EditorOptions<T> & Omit<T, keyof EditorOptions>
	/** Record mapping an input to a function called when that input is typed. */
	readonly inputCommandMap: Record<string, InputCommandCallback | null | undefined>
	/** Record mapping KeyboardEvent.key to a function called when that key is pressed. */
	readonly keyCommandMap: Record<string, KeyCommandCallback | null | undefined>
	/** Tokens currently displayed in the editor. */
	readonly tokens: TokenStream
	/** Object storing some of the extensions added to the editor. */
	readonly extensions: {
		matchBrackets?: BracketMatcher
		matchTags?: TagMatcher
		cursor?: Cursor
		searchWidget?: SearchWidget
		codeFold?: ReadOnlyCodeFolding
		history?: EditHistory
		autoComplete?: AutoComplete
	}
	/**
	 * Set new options for the editor. Omitted properties will use their old value.
	 * @param options New options for the editor
	 */
	setOptions(this: void, options: Partial<EditorOptions<T> & Omit<T, keyof EditorOptions>>): void
	/** Forces the editor to update. Can be useful after adding a tokenize listener or modifying a grammar. */
	update(this: void): void
	/** Gets `selectionStart`, `selectionEnd` and `selectionDirection` for the `textarea`. */
	getSelection(this: void): InputSelection
	/**
	 * Adds a listener for editor events with the specified name.
	 * @returns A cleanup function that removes the listener.
	 */
	on<U extends keyof EditorEventMap>(
		this: void,
		name: U,
		listener: EditorEventMap<T>[U],
	): () => void
	/** Adds extensions to the editor and calls their update methods. */
	addExtensions(this: void, ...extensions: EditorExtension<T>[]): void
	/** Removes the editor from the DOM. */
	remove(this: void): void
}
