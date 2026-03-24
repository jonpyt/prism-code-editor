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
	const seen = new Set<Hotkey<T>>()
	const runAny = () => map.any?.forEach(cmd => cmd(data, e, "any"))

	for (const key of getKeysFromEvent(e)) {
		for (const cmd of map[key] || []) {
			if (!seen.has(cmd)) {
				if (cmd(data, e, key)) {
					preventDefault(e)
					runAny()
					return true
				}
				seen.add(cmd)
			}
		}
	}
	runAny()
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
 * @param highPrecedence When registering a command, it's pushed to the end of the list
 * of commands for that key. To insert it at the start instead, set this parameter to
 * `true`.
 * @returns Function to remove the hotkey.
 * @example
 * useEffect(() => {
 *   return addEditorHotkey(editor, "shift+alt+f", formatDocument)
 * }, [])
 */
const addEditorHotkey = (
	editor: PrismEditor,
	key: string,
	command: EditorHotkey,
	highPrecedence?: boolean,
) => {
	return addHotkey(getMap(editor), key, command, highPrecedence)
}

/**
 * Registers a command for the specified key to the map.
 *
 * @param map Map to add the command to.
 * @param key Key the command will run for.
 * @param command Command for the specified key.
 * @param highPrecedence When registering a command, it's pushed to the end of the list
 * of commands for that key. To insert it at the start instead, set this parameter to
 * `true`.
 * @returns Function to remove the hotkey.
 */
const addHotkey = <T>(
	map: HotkeyMap<T>,
	key: string,
	command: Hotkey<T>,
	highPrecedence?: boolean,
) => {
	let list = (map[key == "any" ? key : normalizeKey(key)] ||= [])

	list[highPrecedence ? "unshift" : "push"](command)

	return () => {
		const index = list.indexOf(command)
		if (index + 1) list.splice(index, 1)
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
 * Registers a sequential hotkey to the specifed map.
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

	const { timeout = 2000, highPrec, preventDefault = true } = options

	const handleStep: Hotkey<T> = (data, e, key) => {
		if (current) setTimeout(removeHandler)
		if (lastTimestamp + timeout < (lastTimestamp = Date.now())) {
			return
		}

		handledEvent = e

		if (current == last) {
			current = 0
			return command(data, e, key)
		}

		if (preventDefault) e.preventDefault()
		removeHandler = addHotkey(map, sequence[++current], handleStep, true)
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
		highPrec,
	)

	const removeAny = addHotkey(map, "any", (_, e) => {
		if (current && handledEvent != e && !modifierCodes.has(e.keyCode)) {
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

const modifierCodes = new Set([16, 17, 18, 20, 91, 92, 224, 225])

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
	mod,
}
