import { PrismEditor } from "../../types.js"

/**
 * Hotkeys are functions that are called when a specific key is pressed. When given an
 * editor and a keyboard event, it first checks if the side-effect should be performed
 * with the current editor state and event. If yes, `true` should be returned to signal
 * the event was handled.
 */
export type EditorHotkey = (editor: PrismEditor, e: KeyboardEvent) => void | boolean

/** Object mapping keys to a list of hotkeys. */
export type HotkeyMap<T extends (...args: any) => void | boolean> = Record<string, T[] | undefined>

export interface EditHistory {
	/** Clears the history stack. */
	clear(): void
	/**
	 * Sets the active entry relative to the current entry.
	 *
	 * @param offset The position you want to move to relative to the current entry.
	 *
	 * `EditHistory.go(-1)` would be equivalent to an undo while `EditHistory.go(1)` would
	 * be equivalent to a redo.
	 *
	 * If there's no entry at the specified position, the call does nothing.
	 */
	go(offset: number): void
	/**
	 * Returns whether or not there exists a history entry at the specified offset relative
	 * to the current entry.
	 *
	 * This method can be used to determine whether a call to {@link EditHistory.go} with the
	 * same offset will succeed or do nothing.
	 */
	has(offset: number): boolean
}
