import { PrismEditor } from "../../index.js"
import { preventDefault } from "../../core.js"
import { getModifierCode, isMac } from "../../utils/index.js"
import { addTextareaListener } from "../../utils/local.js"
import { HotkeyMap, EditorHotkey, Hotkey, HotkeySequenceOptions } from "./types.js"

/**
 * Normalizes modifier keys to a bitmask that's used by {@link getKeysFromEvent}.
 * All keys are case insensitive.
 *
 * Rules:
 * - `alt` → `1`
 * - `ctrl` or `control` → `2`
 * - `meta` or `cmd` → `4`
 * - `shift` → `8`
 * - `mod` → `4` on Mac, `2` otherwise
 *
 * @param key Key to normalize.
 * @returns Normalized and lowercase key.
 * @example
 * normalizeKey("a") // "0+a"
 * normalizeKey("+") // "0++"
 * normalizeKey("ctrl+alt+a") // "3+a"
 * normalizeKey("10+ALT+a") // "11+a"
 * normalizeKey("shift+alt+12+a") // "13+a"
 */
const normalizeKey = (key: string) => {
	let code = 0
	let parts = key.toLowerCase().split("+")
	let last = parts.pop() || "+"
	for (const part of parts) {
		code |= +part || modifierMap[part] || 0
	}
	return code + "+" + last
}

/**
 * Gets a `Set` of keys that match a keyboard event.
 * @param e Keyboard event to get keys for.
 */
const getKeysFromEvent = (e: KeyboardEvent) => {
	if (!keyCodeMap[48]) {
		// Alphanumeric
		for (let i = 48; i < 91; i++) {
			keyCodeMap[i] = String.fromCharCode(i > 64 ? i + 32 : i)
		}

		// Numpad
		for (let i = 96; i < 112; i++) {
			keyCodeMap[i] = String.fromCharCode(i < 106 ? i - 48 : i - 64)
		}
	}

	const key = e.key
	const code = getModifierCode(e)
	const keyBase = keyCodeMap[e.keyCode]
	const keyShift = keyCodeMapShift[e.keyCode]
	const hasShift = code > 7

	const useKeyCode = (isMac && code == 12) || key == "Dead" || key == "Unidentified"
	const keyName = (useKeyCode && ((hasShift && keyShift) || keyBase)) || key.toLowerCase()

	const isNotChar = /\w\w| /.test(keyName.slice(0, 2))
	const noShift = code & 7
	const commands = new Set([`${isNotChar || /\p{L}/u.test(keyName) ? code : noShift}+${keyName}`])

	if (!isNotChar) {
		if (noShift && !(isMac && noShift == 1) && keyBase) {
			commands.add(code + "+" + keyBase)
			if (hasShift && keyShift) {
				commands.add(noShift + "+" + keyShift)
			}
		} else if (hasShift) commands.add(code + "+" + keyName)
	}

	return commands
}

const editorMap = new WeakMap<PrismEditor, HotkeyMap<PrismEditor>>()

/**
 * Utility that runs all commands whose key matches the keyboard event until a command
 * returns a truthy value. In that case `preventDefault` and `stopImmediatePropagation`
 * are called.
 *
 * @param e Keyboard event to run commands for.
 * @param map Record mapping keys to a list of commands for that key.
 * @param data Argument to pass to the commands.
 * @returns `true` if a command returned a truthy value.
 *
 * @example
 * addEventListener("keydown", e => {
 *   const handled = !!runHotkeys(e, map, data)
 * })
 */
const runHotkeys = <T>(e: KeyboardEvent, map: HotkeyMap<T>, data: T) => {
	let seen = new Set<Hotkey<T>>()
	let firstKey: string

	try {
		for (const key of getKeysFromEvent(e)) {
			firstKey ||= key
			for (const set of map[key] || []) {
				for (const cmd of set || []) {
					if (!seen.has(cmd)) {
						if (cmd(data, e, key)) {
							preventDefault(e)
							return true
						}
						seen.add(cmd)
					}
				}
			}
		}
	} finally {
		map.any?.forEach(set => set?.forEach(cmd => cmd(data, e, firstKey)))
	}
}

const getMap = (editor: PrismEditor) => {
	let map = editorMap.get(editor)

	if (!map) {
		editorMap.set(editor, (map = {}))
		addTextareaListener(editor, "keydown", e => {
			runHotkeys(e, map!, editor)
		})
	}

	return map
}

/**
 * Registers a command for the specified key.
 *
 * @param editor Editor to add the command to.
 * @param key Key the command will run for.
 * @param command Command for the specified key.
 * @param precedence Positive integer denoting the precedence of the command where `0`
 * is the highest precedence. Defaults to `2`.
 * @returns Function to remove the hotkey.
 * @example
 * onCleanup(addEditorHotkey(editor, "shift-alt+f", formatDocument))
 */
const addEditorHotkey = (
	editor: PrismEditor,
	key: string,
	command: EditorHotkey,
	precedence?: number,
) => {
	return addHotkey(getMap(editor), key, command, precedence)
}

/**
 * Registers a command for the specified key to the hotkey map.
 *
 * @param map Map to add the command to.
 * @param key Key the command will run for.
 * @param command Command for the specified key.
 * @param precedence Positive integer denoting the precedence of the command where `0`
 * is the highest precedence. Defaults to `2`.
 * @returns Function to remove the hotkey.
 */
const addHotkey = <T>(map: HotkeyMap<T>, key: string, command: Hotkey<T>, precedence = 2) => {
	let set = ((map[key == "any" ? key : normalizeKey(key)] ||= [])[precedence] ||= new Set())

	set.add(command)

	return () => {
		set.delete(command)
	}
}

/**
 * Registers a sequential hotkey to the specifed editor.
 *
 * @param editor Editor to add the sequence to.
 * @param sequence Sequence of keys to press for the command to be executed.
 * @param command Command to execute when the sequence is pressed.
 * @returns Function to remove the hotkey.
 */
const addEditorHotkeySequence = (
	editor: PrismEditor,
	sequence: string[],
	command: EditorHotkey,
	options?: HotkeySequenceOptions,
) => {
	return addHotkeySequence(getMap(editor), sequence, command, options)
}

/**
 * Registers a sequential hotkey to the specifed hotkey map.
 *
 * @param map Map to add the sequence to.
 * @param sequence Sequence of keys to press for the command to be executed.
 * @param command Command to execute when the sequence is pressed.
 * @returns Function to remove the hotkey.
 */
const addHotkeySequence = <T>(
	map: HotkeyMap<T>,
	sequence: string[],
	command: Hotkey<T>,
	options: HotkeySequenceOptions = {},
) => {
	let lastTimestamp: number
	let handledEvent: KeyboardEvent
	let current = 0
	let last = sequence.length - 1
	let removeHandler: () => void

	if (last < 0) throw Error("Sequence must have a least one key")

	const { timeout = 2000, precedence, preventDefault = true } = options

	const handleStep: Hotkey<T> = (data, e, key) => {
		if (current) removeHandler()
		if (lastTimestamp + timeout < (lastTimestamp = Date.now())) {
			return
		}

		handledEvent = e

		if (current == last) {
			current = 0
			return command(data, e, key)
		}

		if (preventDefault) e.preventDefault()
		removeHandler = addHotkey(map, sequence[++current], handleStep, 0)
	}

	const removeStart = addHotkey(
		map,
		sequence[0],
		(data, e, key) => {
			if (handledEvent != e) {
				lastTimestamp = Date.now()
				current = 0
				handleStep(data, e, key)
			}
		},
		precedence,
	)

	const removeAny = addHotkey(map, "any", (_, e) => {
		if (current && handledEvent != e && !isModifierKey(e)) {
			current = 0
			removeHandler()
		}
	})

	return () => {
		removeStart()
		removeAny()
		removeHandler?.()
	}
}

/**
 * Returns whether the key pressed is Alt, Shift, Control, or Meta.
 * @param e Keyboard event to check.
 */
const isModifierKey = (e: KeyboardEvent) => {
	return modifierCodes.has(e.keyCode)
}

const modifierCodes = new Set([16, 17, 18, 91, 92, 224, 225])

const mod = isMac ? 4 : 2

const keyCodeMap: Record<number, string | undefined> = {
	32: " ",
	173: "-",
	186: ";",
	187: "=",
	188: ",",
	189: "-",
	190: ".",
	191: "/",
	192: "`",
	219: "[",
	220: "\\",
	221: "]",
	222: "'",
}

const keyCodeMapShift: Record<number, string | undefined> = {
	48: ")",
	49: "!",
	50: "@",
	51: "#",
	52: "$",
	53: "%",
	54: "^",
	55: "&",
	56: "*",
	57: "(",
	59: ":",
	61: "+",
	173: "_",
	186: ":",
	187: "+",
	188: "<",
	189: "_",
	190: ">",
	191: "?",
	192: "~",
	219: "{",
	220: "|",
	221: "}",
	222: '"',
}

const modifierMap: Record<string, number | undefined> = {
	alt: 1,
	control: 2,
	ctrl: 2,
	meta: 4,
	cmd: 4,
	shift: 8,
	mod: isMac ? 4 : 2,
}

export {
	normalizeKey,
	getKeysFromEvent,
	addEditorHotkey,
	addHotkey,
	addEditorHotkeySequence,
	addHotkeySequence,
	runHotkeys,
	isModifierKey,
	mod,
}
