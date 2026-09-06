import type { PrismEditor } from "prism-code-editor"
import { mountEditorsUnder } from "prism-code-editor/client"
import { matchBrackets } from "prism-code-editor/match-brackets"

const editors: PrismEditor<{ _pairs?: string }>[] = []
const mount = () => {
	editors.push(
		...mountEditorsUnder<{ _pairs?: string }>(document, options => [
			matchBrackets(true, options._pairs),
		]),
	)
}

export { editors, mount }
