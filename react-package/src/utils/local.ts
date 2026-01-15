import { PrismEditor } from "../types"
import { isChrome } from "."
import { addListener, doc } from "../core"
import { PrismCodeBlock } from "../code-block"

const voidlessLangs = new Set("xml,rss,atom,jsx,tsx,xquery,xeora,xeoracube,actionscript".split(","))
const voidTags = /^(?:area|base|w?br|col|embed|hr|img|input|link|meta|source|track)$/

const scrollToEl = (editor: PrismEditor, el: HTMLElement, paddingTop = 0) => {
	const style = editor.container!.style

	style.setProperty("--_sp", "var(--pce-scroll-padding, 2ch)")
	style.scrollPaddingBlock = `calc(var(--_sp) + ${paddingTop}px) calc(var(--_sp) + ${
		isChrome && !el.offsetWidth ? el.offsetHeight : 0
	}px)`

	el.scrollIntoView({ block: "nearest" })
	style.scrollPaddingBlock = ""
	style.removeProperty("--_sp")
}

const getLineStart = (text: string, position: number) =>
	position ? text.lastIndexOf("\n", position - 1) + 1 : 0

const getLineEnd = (text: string, position: number) =>
	(position = text.indexOf("\n", position)) + 1 ? position : text.length

const templateEl = /* @__PURE__ */ doc?.createElement("div")

const createTemplate = <T extends Element = HTMLDivElement>(html: string, node?: Node) => {
	if (templateEl) {
		templateEl.innerHTML = html
		node = templateEl.firstChild!
	}
	return () => <T>node?.cloneNode(true)
}

const getPosition = (editor: PrismEditor | PrismCodeBlock, el: HTMLElement) => {
	const rect1 = el.getBoundingClientRect()
	const rect2 = editor.lines![0].getBoundingClientRect()

	return {
		top: rect1.y - rect2.y,
		bottom: rect2.bottom - rect1.bottom,
		left: rect1.x - rect2.x,
		right: rect2.right - rect1.right,
		height: rect1.height,
	}
}

const addListener2 = <T extends keyof HTMLElementEventMap>(
	element: HTMLElement,
	type: T,
	listener: (this: HTMLElement, ev: HTMLElementEventMap[T]) => any,
	options?: boolean | AddEventListenerOptions,
) => {
	addListener(element, type, listener, options)
	return () => element.removeEventListener(type, listener, options)
}

const addTextareaListener = <T extends keyof HTMLElementEventMap>(
	editor: PrismEditor,
	type: T,
	listener: (this: HTMLElement, ev: HTMLElementEventMap[T]) => any,
	options?: boolean | AddEventListenerOptions,
) => {
	return addListener2(editor.textarea!, type, listener, options)
}

const updateNode = (node: Text, text: string) => {
	if (node.data != text) node.data = text
}

const testBracket = (str: string, brackets: string, l: number) => {
	return brackets.indexOf(str[0]) + 1 || (l && brackets.indexOf(str[l]) + 1)
}

export {
	scrollToEl,
	getLineStart,
	getLineEnd,
	createTemplate,
	updateNode,
	getPosition,
	addListener2,
	addTextareaListener,
	voidTags,
	voidlessLangs,
	testBracket,
}
