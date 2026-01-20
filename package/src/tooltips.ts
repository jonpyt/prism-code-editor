import { PrismEditor } from "./index.js"
import { createTemplate } from "./core.js"
import { cursorPosition } from "./extensions/cursor/index.js"
import { getStyleValue } from "./utils/local.js"
import { addOverlay } from "./utils/index.js"

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

/**
 * Utility making it easy to add tooltips positioned on the editor's cursor. Before you
 * can show the tooltip, a {@link cursorPosition} extension must be added to the editor.
 *
 * This works by appending your tooltip to a flex container. You can style this container
 * with the selector `.pce-tooltip` if needed. This container is then added to the editor's
 * overlays. It also has `overflow-x: clip` to prevent your tooltip from overflowing in
 * browsers that support it.
 *
 * If you want your tooltip to always be visible when scrolling horizontally, you can add
 * `position: sticky` along with the `right` and `left` CSS properties to it.
 *
 * @param editor Editor you want to add the tooltip to.
 * @param element Element for the tooltip.
 * @param fixedWidth If false, the tooltip will shrink instead of getting offset to
 * the left if there's not enough space to the right of the cursor. Defaults to `true`.
 * @returns Show and hide functions.
 *
 * @example
 * const [show, hide] = addTooltip(editor, element)
 */
export const addTooltip = (
	editor: PrismEditor,
	element: HTMLElement,
	fixedWidth = true,
): [ShowTooltip, HideTooltip] => {
	const container = template()
	const style = container.style
	const spacer = <HTMLDivElement>container.firstChild

	container.append(element)
	;(fixedWidth ? element : spacer).style.flexShrink = <any>0

	return [
		(above?: boolean) => {
			let pos = editor.extensions.cursor?.getPosition()
			if (pos) {
				container.parentNode || addOverlay(editor, container)
				spacer.style.width = (editor.options.rtl ? pos.right : pos.left) + "px"

				let top = pos.top
				let bottom = pos.bottom
				let placeAbove =
					!above == top > bottom && (above ? top : bottom) < container.clientHeight ? !above : above
				let offset = pos.height + (placeAbove ? bottom : top) + "px"

				style.bottom = placeAbove ? offset : "auto"
				style.top = placeAbove ? "auto" : offset
			}
		},
		() => container.remove(),
	]
}

const observer =
	window.ResizeObserver &&
	/* @__PURE__ */ new ResizeObserver(e =>
		e.forEach(entry => {
			const el = entry.target
			const wrapper = el.querySelector<HTMLDivElement>(".pce-wrapper")!
			wrapper.style.paddingBottom = `${
				el.clientHeight -
				getStyleValue(wrapper, "marginBottom") -
				getStyleValue(wrapper, "lineHeight")
			}px`
		}),
	)

/** Allows users to scroll past the last line in the editor by adding padding to the wrapper. */
export const addOverscroll = (editor: PrismEditor) => {
	observer && observer.observe(editor.container)
}

/** Removes the ability to scroll past the last line in the editor. */
export const removeOverscroll = (editor: PrismEditor) => {
	observer && observer.unobserve(editor.container)
	editor.wrapper.style.paddingBottom = ""
}
