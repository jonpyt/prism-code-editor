import { PrismEditor } from "../../types.js"

/**
 * Hotkey where the data parameter is an editor.
 */
export type EditorHotkey = Hotkey<PrismEditor>

/**
 * Hotkeys are functions that are called when a specific key is pressed. When given data
 * and a keyboard event, it first checks if the side-effect should be performed with the
 * current state and event. If yes, `true` should be returned to signal the event was
 * handled.
 */
export type Hotkey<T> = (data: T, e: KeyboardEvent, key: string) => void | boolean

/** Object mapping keys to a list of hotkeys. */
export type HotkeyMap<T> = Partial<Record<string, Hotkey<T>[]>>

export type HotkeySequenceOptions = {
	/** Maximum number of milliseconds allowed between steps. @default 2000 */
	timeout?: number
	/** Whether to add the handler for the first step first in the list. @default false */
	highPrec?: boolean
	/**
	 * Whether or not to call `preventDefault()` when the sequence is advanced. This does
	 * not apply to the final step where the return value of the command dictates whether
	 * `preventDefault()` is called.
	 * @default true
	 */
	preventDefault?: boolean
}

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
	 * If there's no entry at the specified offset, the call does nothing.
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
