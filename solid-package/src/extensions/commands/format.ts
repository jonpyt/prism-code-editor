import { isMac } from "../../utils/index.js"
import { autoComplete } from "../autocomplete/tooltip.js"
import { searchWidget } from "../search/widget.js"
import { defaultKeymap } from "./commands.js"
import { normalizeKey } from "./utils.js"

const macModifiers: Record<number, string> = {
	2: "⌃",
	1: "⌥",
	8: "⇧",
	4: "⌘",
}

const winModifiers: Record<number, string> = {
	2: "Ctrl",
	1: "Alt",
	8: "Shift",
	4: "Win",
}

const keyDisplay: Record<string, string | undefined> = {
	arrowdown: "↓",
	arrowleft: "←",
	arrowright: "→",
	arrowup: "↑",
	delete: "Del",
	escape: "Esc",
	pagedown: "PageDown",
	pageup: "PageUp",
	" ": "Space",
}

/**
 * Utility that formats a hotkey to display in a user interface. Modifier keys use symbols
 * on Mac and labels otherwise.
 *
 * @param hotkey Hotkey to format for display.
 * @param separator String to join the segments together with. Defaults to `" "` on Mac
 * and `"+"` otherwise.
 * @returns Formatted key for display.
 *
 * @example
 * // On Mac
 * formatHotkey("mod+s") // "⌘ S"
 * formatHotkey("12+escape") // "⇧ ⌘ Esc"
 * formatHotkey("arrowup") // "↑"
 *
 * // On Windows/Linux
 * formatHotkey("mod+s") // "Ctrl+S"
 * formatHotkey("12+escape") // "Shift+Win+Esc"
 * formatHotkey("arrowup") // "↑"
 */
const formatHotkey = (hotkey: string, separator = isMac ? " " : "+") => {
	const [code, key] = normalizeKey(hotkey).split("+")
	const result: string[] = []
	const modifiers = isMac ? macModifiers : winModifiers

	for (let c in modifiers) {
		if (+code & +c) result.push(modifiers[c])
	}

	result.push(key ? keyDisplay[key] || key[0].toUpperCase() + key.slice(1) : "+")

	return result.join(separator)
}

/**
 * Array of keyboard shortcuts and descriptions for {@link defaultKeymap}. Useful for
 * documenting key bindings to users. It consists of tuples containing two string each
 * where the first string is the key binding and the second is the description.
 *
 * @example
 * ```jsx
 * <ul>
 *   <For each={defaultKeymapLabels}>
 *     {([key, description]) => (
 *       <li>
 *         <span>{description}</span>
 *         <kbd>{formatHotkey(key)}</kbd>
 *       </li>
 *     )}
 *   </For>
 * </ul>
 * ```
 */
const defaultKeymapLabels: [string, string][] = [
	["1+ArrowDown", "Move lines down"],
	["1+ArrowUp", "Move lines up"],
	["9+ArrowDown", "Copy lines down"],
	["9+ArrowUp", "Copy lines up"],
	[`2+${isMac ? "Page" : "Arrow"}Down`, "Scroll one line down"],
	[`2+${isMac ? "Page" : "Arrow"}Up`, "Scroll one line up"],
	["Enter", "Insert line and indent"],
	["Mod+Enter", "Insert blank line"],
	["Mod+]", "Indent lines"],
	["Mod+[", "Outdent lines"],
	["8+Mod+k", "Delete lines"],
	["Mod+/", "Toggle line comment"],
	["9+a", "Toggle block comment"],
	[isMac ? "10+m" : "2+m", "Toggle tab capturing"],
	["Tab", "Indent lines"],
	["8+Tab", "Outdent lines"],
]

/**
 * Array of keyboard shortcuts and descriptions for the {@link autoComplete} extension.
 * Useful for documenting key bindings to users. It consists of tuples containing two
 * string each where the first string is the key binding and the second is the description.
 *
 * @example
 * ```jsx
 * <ul>
 *   <For each={autoCompleteShortcutLabels}>
 *     {([key, description]) => (
 *       <li>
 *         <span>{description}</span>
 *         <kbd>{formatHotkey(key)}</kbd>
 *       </li>
 *     )}
 *   </For>
 * </ul>
 * ```
 */
const autoCompleteShortcutLabels: [string, string][] = [
	["2+ ", "Trigger suggestion"],
	["mod+i", "Trigger suggestion"],
	...(isMac ? ([["1+Escape", "Trigger suggestion"]] satisfies [string, string][]) : []),
	["2+ ", "Toggle suggestion documentation"],
	["mod+i", "Toggle suggestion documentation"],
	["Tab", "Insert suggestion"],
	["Enter", "Insert suggestion"],
	["Escape", "Close completion widget"],
	["Escape", "Clear tab stops"],
	["Tab", "Select next tab stop"],
	["8+Tab", "Select previous tab stop"],
	["ArrowUp", "Select previous suggestion"],
	["ArrowDown", "Select next suggestion"],
	["PageUp", "Select first visible suggestion"],
	["PageDown", "Select last visible suggestion"],
]

const modifiers = isMac ? 5 : 1

/**
 * Array of keyboard shortcuts and descriptions for the {@link searchWidget} extension.
 * Useful for documenting key bindings to users. It consists of tuples containing two
 * string each where the first string is the key binding and the second is the description.
 *
 * @example
 * ```jsx
 * <ul>
 *   <For each={searchShortcutLabels}>
 *     {([key, description]) => (
 *       <li>
 *         <span>{description}</span>
 *         <kbd>{formatHotkey(key)}</kbd>
 *       </li>
 *     )}
 *   </For>
 * </ul>
 * ```
 */
const searchShortcutLabels: [string, string][] = [
	["mod+f", "Start search"],
	[isMac ? "5+f" : "2+h", "Start replacing"],
	["mod+g", "Find next match"],
	["mod+8+g", "Find previous match"],
	["f3", "Find next match"],
	["8+f3", "Find previous match"],
	["Enter", "Select next match"],
	["8+Enter", "Select previous match"],
	["Escape", "Close search widget"],
	["Enter", "Replace match"],
	[`${isMac ? 4 : 3}+Enter`, "Replace all matches"],
	[modifiers + "+r", "Toggle regex search"],
	[modifiers + "+p", "Toggle case preservation"],
	[modifiers + "+w", "Toggle whole word search"],
	[modifiers + "+l", "Toggle find in selection"],
]

export { formatHotkey, defaultKeymapLabels, autoCompleteShortcutLabels, searchShortcutLabels }
