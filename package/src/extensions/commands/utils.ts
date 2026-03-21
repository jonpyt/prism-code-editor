import { PrismEditor } from "../../index.js"
import { preventDefault } from "../../core.js"
import { getModifierCode, isMac } from "../../utils/index.js"
import { addTextareaListener } from "../../utils/local.js"
import { HotkeyMap, EditorHotkey } from "./types.js"

/**
 * Normalizes modifier keys to a bitmask that's used by {@link getKeysFromEvent}.
 * Modifier keys are case insensitive.
 *
 * Rules:
 * - `alt` → `1`
 * - `ctrl` or `control` → `2`
 * - `meta` or `cmd` → `4`
 * - `shift` → `8`
 * - `mod` → `4` on Mac, `2` otherwise
 *
 * @param key Key to normalize.
 *
 * @example
 * normalizeKey("a") // "0+a"
 * normalizeKey("+") // "0++"
 * normalizeKey("ctrl+alt+a") // "3+a"
 * normalizeKey("10+ALT+a") // "11+a"
 * normalizeKey("shift+alt+12+a") // "13+a"
 */
const normalizeKey = (key: string) => {
	let code = 0
	let parts = key.split("+")
	let last = parts.pop() || "+"
	for (const part of parts) {
		code |= +part || modifierMap[part.toLowerCase()] || 0
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
			if (i > 64) keyCodeMapShift[i] = String.fromCharCode(i)
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
	const keyName = (useKeyCode && ((hasShift && keyShift) || keyBase)) || key

	const isNotChar = /\w\w| /.test(keyName.slice(0, 2))
	const noShift = code & 7
	const commands = new Set<string>()

	if (!isNotChar) {
		if (noShift && !(isMac && noShift == 1) && keyBase) {
			commands.add(code + "+" + keyBase)
			if (hasShift && keyShift) {
				commands.add(noShift + "+" + keyShift)
			}
		} else if (hasShift) commands.add(code + "+" + keyName)
	}

	commands.add((isNotChar ? code : noShift) + "+" + keyName)

	return commands
}

const editorMap = new WeakMap<PrismEditor, HotkeyMap<EditorHotkey>>()

/**
 * Utility that runs all commands whose key matches the keyboard event until a command
 * returns a truthy value, signaling the event was handled.
 *
 * @param e Keyboard event to run commands for.
 * @param commandMap Record mapping keys to a list of commands for that key.
 * @param args Arguments to pass to the commands.
 * @returns `true` if a command returned a truthy value.
 *
 * @example
 * addEventListener("keydown", e => {
 *   if (runHotkeys(e, commandMap, ...args)) e.preventDefault()
 * })
 */
const runHotkeys = <T extends (...args: any) => any>(
	e: KeyboardEvent,
	hotkeys: HotkeyMap<T>,
	...args: Parameters<T>
) => {
	const seen = new Set<T>()
	for (const key of getKeysFromEvent(e)) {
		for (const cmd of hotkeys[key] || []) {
			if (!seen.has(cmd)) {
				if (cmd(...args)) return true
				seen.add(cmd)
			}
		}
	}
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
 */
const addEditorHotkey = <T extends {}>(
	editor: PrismEditor<T>,
	key: string,
	command: EditorHotkey<T>,
	highPrecedence?: boolean,
) => {
	let map = editorMap.get(editor) as HotkeyMap<EditorHotkey<T>>

	if (!map) {
		editorMap.set(editor, (map = {}))
		addTextareaListener(editor, "keydown", e => {
			if (runHotkeys(e, map!, editor, e)) preventDefault(e)
		})
	}

	let list = (map![normalizeKey(key)] ||= [])

	list[highPrecedence ? "unshift" : "push"](command)

	return () => {
		const index = list.indexOf(command)
		if (index + 1) list.splice(index, 1)
	}
}

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

export { normalizeKey, getKeysFromEvent, addEditorHotkey, runHotkeys, mod }
