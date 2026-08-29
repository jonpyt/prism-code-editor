/** @module hover */

import { addListener } from "../core.js"
import { BasicExtension, PrismEditor } from "../types.js"
import { createHoverTooltip } from "../utils/hover.js"
import { addTextareaListener } from "../utils/local.js"

export type AllowedEditorPointerEvents =
	| "pointermove"
	| "pointerdown"
	| "pointerup"
	| "click"
	| "mousemove"
	| "mousedown"
	| "mouseup"

/**
 * The editor lines have `pointer-events: none` which means that all pointer and mouse
 * events are captured by the `textarea` element itself. This utlity can be used to add
 * a subset of pointer and mouse listeners that will be called with the token the pointer
 * is on. If the pointer isn't on a token, then the line itself will be passed to the
 * listener.
 *
 * @param editor Editor to add the listener to.
 * @param type Event to listen to.
 * @param listener Listener called with the event and target token.
 * @param lineFilter If a line won't have any tokens the listener is interested in, then
 * this filter can return false to skip computing the target token at the cursor's
 * position for a performance boost. If ommitted, the listener will be called for all
 * lines.
 * @returns Cleanup function to remove the listener.
 */
const addPointerListener = <T extends AllowedEditorPointerEvents>(
	editor: PrismEditor,
	type: T,
	listener: (e: HTMLElementEventMap[T], target: HTMLElement) => any,
	lineFilter?: (line: HTMLDivElement, lineNumber: number, e: HTMLElementEventMap[T]) => boolean,
) => {
	let listeners = listenerMap.get(editor)
	if (!listeners) listenerMap.set(editor, (listeners = {}))

	// @ts-expect-error TS generics error
	const [handlers, cleanUp] = (listeners[type] ||= [
		new Set(),
		addTextareaListener(editor, type, e => {
			let layerY = e.layerY
			let lines = editor.lines
			let target: HTMLElement | undefined
			let targetComputed!: boolean

			for (let i = lines.length; i > 1; ) {
				const line = lines[--i]
				if (line.offsetTop <= layerY) {
					for (const [listener, lineFilter] of handlers) {
						if (!lineFilter || lineFilter(line, i, e)) {
							if (!targetComputed) {
								targetComputed = true
								line.style.pointerEvents = "auto"

								target = (line.getRootNode() as Document | ShadowRoot)
									.elementsFromPoint(e.clientX, e.clientY)
									.find(el => el.matches(".token,.pce-line")) as HTMLElement

								line.style.pointerEvents = ""
							}
							if (target) listener(e, target)
						}
					}

					break
				}
			}
		}),
	])

	const entry = [listener, lineFilter] as const

	handlers.add(entry)

	return () => {
		handlers.delete(entry)

		if (!handlers.size) {
			cleanUp()
			delete listeners[type]
		}
	}
}

export type EditorHoverOptions = {
	/** Whether the prefered position of the tooltip is above the token. @default false */
	above?: boolean
	/** A CSS length value for the tooltip's max width. */
	maxWidth?: string
	/** A CSS length value for the tooltip's max height. */
	maxHeight?: string
	/**
	 * If a line won't have any tokens the callback is interested in, then this filter can
	 * return false to skip computing the target token at the cursor's position for a
	 * performance boost. If ommitted, the callback will be invoked for all lines.
	 */
	filter?: (line: HTMLDivElement, lineNumber: number, e: PointerEvent) => boolean
	/**
	 * Whether the callback will be called for tokens that have elements as children.
	 * @default false
	 */
	allowChildren?: boolean
}

export type HoverCallback = (
	types: string[],
	language: string,
	text: string,
	element: HTMLSpanElement,
) => (string | Node)[] | null | undefined

/**
 * Utility that makes it easier to add hover descriptions to tokens.
 * @param callback Function called when a token with only textual children is hovered.
 *
 * The function gets called with the following arguments:
 * - `types`: Array with the token's type as the first element, followed by any alises.
 * - `language`: The language at the token's position.
 * - `text`: The `textContent` of the token.
 * - `element`: The `<span>` element of the hovered token.
 *
 * Lastly, the function should return an array of children that get added to the tooltip.
 * If `null` or `undefined` is returned, no tooltip is shown for the token.
 * @param options Options for configuring the size and position of the tooltip and the
 * line filter for better performance.
 */
const editorHoverDescriptions = (
	callback: HoverCallback,
	options: EditorHoverOptions = {},
): BasicExtension => {
	return editor => {
		const [show, hide, tooltip] = createHoverTooltip(editor, callback, options)
		const handler = (e: PointerEvent, target: HTMLElement) => {
			if (
				target.matches(".token") &&
				(e.pointerType != "mouse" || !e.buttons) &&
				(options.allowChildren || !target.childElementCount)
			) {
				show(target)
			} else hide()
		}

		addListener(editor.textarea, "mouseleave", e => {
			if (!tooltip.contains(e.relatedTarget as Element)) hide()
		})

		addPointerListener(editor, "pointermove", handler, options.filter)
		addPointerListener(editor, "pointerdown", handler, options.filter)

		editor.on("selectionChange", hide)
	}
}

const listenerMap = new WeakMap<
	PrismEditor,
	{
		[T in AllowedEditorPointerEvents]?: [
			Set<
				readonly [
					(e: HTMLElementEventMap[T], target: HTMLElement) => any,
					((line: HTMLDivElement, lineNumber: number, e: HTMLElementEventMap[T]) => boolean)?,
				]
			>,
			() => void,
		]
	}
>()

export { addPointerListener, editorHoverDescriptions }
