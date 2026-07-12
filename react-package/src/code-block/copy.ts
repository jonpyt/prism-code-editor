import { useEffect } from "react"
import { usePrismCodeBlock } from "."
import { addListener, doc, useStableRef } from "../core"
import { createCopyButton } from "../extensions/copy-button"
import { addOverlay } from "../utils"

/**
 * Copy button component for code blocks. Requires styles from
 * `prism-react-editor/copy-button.css`.
 *
 * By default, the copy button is only shown when the code block is hovered. To always
 * show it, change the default opacity with the following CSS:
 *
 * ```less
 * button.pce-copy {
 *   opacity: 1; // or a lower value for a semi-transparent button
 * }
 * ```
 */
const CopyButton = (): undefined => {
  const [codeBlock, props] = usePrismCodeBlock()
  const code = useStableRef<string[]>([])
  code[0] = props.code

  useEffect(() => {
    const container = createCopyButton()
    const btn = container.firstChild as HTMLButtonElement
  
    addListener(btn, "click", () => {
      btn.setAttribute("aria-label", "Copied!")
      if (!navigator.clipboard?.writeText(code[0])) {
        const selection = getSelection()!
        const range = new Range()
        selection.removeAllRanges()
        selection.addRange(range)
        range.setStartAfter(codeBlock.lines![0])
        range.setEndAfter(codeBlock.wrapper!)
        doc!.execCommand("copy")
        range.collapse()
      }
    })
  
    addListener(btn, "pointerenter", () => btn.setAttribute("aria-label", "Copy"))

    addOverlay(codeBlock, container)
    return () => container.remove()
  }, [])
}

export { CopyButton }
