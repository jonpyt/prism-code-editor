import { autoCompleteShortcutLabels, defaultKeymapLabels, formatHotkey, getKeysFromEvent, searchShortcutLabels } from "prism-code-editor/commands"
import { editors } from "../editor/mount"

const text = document.getElementById("prev-keys")!.firstChild as Text

editors[1].textarea.addEventListener(
	"keydown",
	e => {
		let res = ""

		for (const key of getKeysFromEvent(e)) {
			res += key.replace(" ", "space") + " "
		}

		res = res.slice(0, -1)

		if (text.data != res) text.data = res
	},
	true,
)

const itemTemplate = document.createElement("li")

const content = document.querySelector(".sl-markdown-content")!

const renderShortcuts = (title: string, list: [string, string][]) => {
	const listEl = document.createElement("ul")
	const titleEl = document.createElement("h4")

	titleEl.textContent = title
	listEl.className = "hotkey-list not-content"

	for (const [key, description] of list) {
		const item = itemTemplate.cloneNode(true) as HTMLLIElement
		const [span, kbd] = item.children
		
		span.textContent = description
		kbd.textContent = formatHotkey(key)
		listEl.append(item)
	}

	content.append(titleEl, listEl)
}

itemTemplate.innerHTML = "<span></span><kbd>"
itemTemplate.className = "hotkey-item"

renderShortcuts("Code editor", defaultKeymapLabels)
renderShortcuts("Search widget", searchShortcutLabels)
renderShortcuts("Autocompletion", autoCompleteShortcutLabels)
