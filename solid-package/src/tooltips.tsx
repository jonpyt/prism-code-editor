import { template as _template, insert } from "solid-js/web"
import { PrismEditor } from "."
import { JSX, Show, createSignal } from "solid-js"

const template = /* @__PURE__ */ _template(
	"<div class=pce-tooltip style=z-index:5;top:auto;display:flex;overflow-x:clip><div>",
)

/** Function removing the tooltip from the DOM. */
export type HideTooltip = () => void

export type Tooltip = {
	/**
	 * Moves to tooltip to align with the cursor and shows it.
	 * @param preferPlacingAboveCursor Whether the preferred position is above the cursor or not.
	 */
	show(preferPlacingAboveCursor?: boolean): void
	/** Hides the tooltip */
	hide(): void
	/** The element wrapping your tooltip */
	element: JSX.Element
}

/**
 * Utility making it easy to add tooltips positioned on the editor's cursor. Before you
 * can show the tooltip, a {@link cursorPosition} extension must be added to the editor.
 *
 * This works by appending your tooltip to a flex container. You can style this container
 * with the selector `.pce-tooltip` if needed. It has `overflow-x: clip` to prevent your
 * tooltip from overflowing in browsers that support it.
 *
 * This utility is intended to be wrapped in a custom extension that controls when the
 * tooltip is shown. Your extension should then return the container returned by this
 * utility.
 *
 * If you want your tooltip to always be visible when scrolling horizontally, you can add
 * `position: sticky` along with the `right` and `left` CSS properties to it.
 *
 * @param editor Editor you want to add the tooltip to.
 * @param element Element for the tooltip. Should be a single HTML element.
 * @param fixedWidth If false, the tooltip will shrink instead of getting offset to
 * the left if there's not enough space to the right of the cursor. Defaults to `true`.
 * *Note:* Your tooltip element must have `flex-shrink: 0` if `fixedWidth` isn't set to
 * `false`.
 */
export const addTooltip = (
	editor: PrismEditor,
	element: JSX.Element,
	fixedWidth = true,
): Tooltip => {
	const container = template() as HTMLDivElement
	const style = container.style
	const spacer = container.firstChild as HTMLDivElement
	const [open, setOpen] = createSignal(false)

	insert(container, element, null)
	if (!fixedWidth) spacer.style.flexShrink = 0 as any

	return {
		show(above?: boolean) {
			let pos = editor.extensions.cursor?.getPosition()
			if (pos) {
				setOpen(true)
				spacer.style.width = (editor.props.rtl ? pos.right : pos.left) + "px"

				let top = pos.top
				let bottom = pos.bottom
				let placeAbove =
					!above == top > bottom && (above ? top : bottom) < container.clientHeight ? !above : above
				let offset = pos.height + (placeAbove ? bottom : top) + "px"

				style.bottom = placeAbove ? offset : "auto"
				style.top = placeAbove ? "auto" : offset
			}
		},
		hide() {
			setOpen(false)
		},
		element: <Show when={open()}>{container}</Show>,
	}
}
