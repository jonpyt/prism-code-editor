import { ReactNode, useCallback, useLayoutEffect, useMemo } from "react"
import { PrismEditor } from "./types"
import { createTemplate } from "./utils/local"
import { createPortal } from "react-dom"
import { useCursorPosition } from "./extensions/cursor"
import { addOverlay } from "./utils"

const template = /* @__PURE__ */ createTemplate(
	"<div class=pce-tooltip style=z-index:5;top:auto;display:flex;overflow-x:clip><div>",
)

/**
 * Moves to tooltip to align with the cursor and shows it.
 * @param preferPlacingAboveCursor Whether the preferred position is above the cursor or not.
 */
export type ShowTooltip = (preferPlacingAboveCursor?: boolean) => void

/** Function removing the tooltip from the DOM. */
export type HideTooltip = () => void

const show = (
	editor: PrismEditor,
	container: HTMLDivElement,
	spacerStyle: CSSStyleDeclaration,
	above?: boolean,
) => {
	let pos = editor.extensions.cursor?.getPosition()
	if (pos) {
		container.parentNode || addOverlay(editor, container)
		spacerStyle.width = (editor.props.rtl ? pos.right : pos.left) + "px"

		let top = pos.top
		let bottom = pos.bottom
		let placeAbove =
			!above == top > bottom && (above ? top : bottom) < container.clientHeight ? !above : above
		let offset = pos.height + (placeAbove ? bottom : top) + "px"

		container.style.bottom = placeAbove ? offset : "auto"
		container.style.top = placeAbove ? "auto" : offset
	}
}

/**
 * Same as {@link useTooltip} but accepts a JSX element instead of a DOM node.
 *
 * *Note:* Your tooltip element must have `flex-shrink: 0` if `fixedWidth` isn't set to
 * `false`.
 *
 * @param editor Editor you want to add the tooltip to.
 * @param element JSX element for the tooltip.
 * @param fixedWidth If false, the tooltip will shrink instead of getting offset to
 * the left if there's not enough space to the right of the cursor. Defaults to `true`.
 *
 * @example
 * ```jsx
 * const [show, hide, portal] = useReactTooltip(
 *   editor,
 *   <div style={{ flexShrink: 0 }}>My tooltip</div>,
 * )
 * ```
 * The portal should be returned from an extension.
 */
export const useReactTooltip = (
	editor: PrismEditor,
	element: ReactNode,
	fixedWidth = true,
): [ShowTooltip, HideTooltip, ReactNode] => {
	const container = useMemo(template, [])
	const spacerStyle = (container.firstChild as HTMLDivElement).style

	spacerStyle.flexShrink = fixedWidth ? "" : "0"

	return [
		useCallback(show.bind(editor, editor, container, spacerStyle), []),
		useCallback(() => container.remove(), []),
		createPortal(element, container),
	]
}

/**
 * Utility making it easy to add tooltips positioned on the editor's cursor. Before you
 * can show the tooltip, the {@link useCursorPosition} hook must've been called.
 *
 * This works by appending your tooltip to a flex container. You can style this container
 * with the selector `.pce-tooltip` if needed. It has `overflow-x: clip` to prevent your
 * tooltip from overflowing in browsers that support it.
 *
 * This utility is intended to be wrapped in a custom extension that controls when the
 * tooltip is shown.
 *
 * If you want your tooltip to always be visible when scrolling horizontally, you can add
 * `position: sticky` along with the `right` and `left` CSS properties to it.
 *
 * @param editor Editor you want to add the tooltip to.
 * @param element HTML Element for the tooltip.
 * @param fixedWidth If false, the tooltip will shrink instead of getting offset to
 * the left if there's not enough space to the right of the cursor. Defaults to `true`.
 *
 * @example
 * const [show, hide] = useTooltip(editor, myElement)
 */
export const useTooltip = (
	editor: PrismEditor,
	element: HTMLElement,
	fixedWidth = true,
): [ShowTooltip, HideTooltip] => {
	const container = useMemo(template, [])
	const spacerStyle = (container.firstChild as HTMLDivElement).style

	useLayoutEffect(() => {
		container.append(element)
		return () => element.remove()
	}, [element])

	spacerStyle.flexShrink = fixedWidth ? "" : "0"
	element.style.flexShrink = fixedWidth ? "0" : ""

	return [
		useCallback(show.bind(editor, editor, container, spacerStyle), []),
		useCallback(() => container.remove(), []),
	]
}
