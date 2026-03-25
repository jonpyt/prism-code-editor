import { getKeysFromEvent } from "prism-code-editor/commands"
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
