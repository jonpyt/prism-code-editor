import { PrismEditor } from "../index.js"
import { addListener } from "../core.js"
import { isChrome } from "./index.js"
import { PrismCodeBlock } from "../client/code-block.js"

const scrollToEl = (editor: PrismEditor, el: HTMLElement, paddingTop = 0) => {
	const style = editor.container.style

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

const addTextareaListener = <T extends keyof HTMLElementEventMap>(
	editor: PrismEditor,
	type: T,
	listener: (this: HTMLElement, ev: HTMLElementEventMap[T]) => any,
	options?: boolean | AddEventListenerOptions,
) => addListener(editor.textarea, type, listener, options)

const getStyleValue = (el: HTMLElement, prop: keyof CSSStyleDeclaration) =>
	parseFloat(<string>getComputedStyle(el)[prop])

const getPosition = (editor: PrismEditor | PrismCodeBlock, el: HTMLElement) => {
	const rect1 = el.getBoundingClientRect()
	const rect2 = editor.lines[0].getBoundingClientRect()

	return {
		top: rect1.y - rect2.y,
		bottom: rect2.bottom - rect1.bottom,
		left: rect1.x - rect2.x,
		right: rect2.right - rect1.right,
		height: rect1.height,
	}
}

const updateNode = (node: Text, text: string) => {
	if (node.data != text) node.data = text
}

const voidlessLangs = new Set("xml,rss,atom,jsx,tsx,xquery,xeora,xeoracube,actionscript".split(","))
const voidTags = /^(?:area|base|w?br|col|embed|hr|img|input|link|meta|source|track)$/

export {
	scrollToEl,
	getLineStart,
	getLineEnd,
	getStyleValue,
	addTextareaListener,
	getPosition,
	updateNode,
	voidTags,
	voidlessLangs,
}
