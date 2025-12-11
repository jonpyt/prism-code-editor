import { useEffect } from "react"
import { usePrismCodeBlock } from "."
import { addListener, doc, useStableRef } from "../core"
import { createCopyButton } from "../extensions/copy-button"
import { addOverlay } from "../utils"

/**
 * Copy button component for code blocks. Requires styles from
 * `prism-react-editor/copy-button.css`.
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
