import { useLayoutEffect, useMemo, useRef } from "react"
import { createTemplate } from "../utils/local"
import { useStableRef } from "../core"
import { getIndentGuides } from "prism-code-editor/guides"
import { usePrismEditor } from "."

const guideTemplate = /* @__PURE__ */ createTemplate(
	"<div style=width:1px;position:absolute;background:var(--bg-guide-indent)>",
)

/** Component adding indent guides to an editor. Does not support word wrap. */
const IndentGuides = () => {
	let prevLength = 0
	let lineIndentMap: number[]
	let active: HTMLDivElement | undefined

	const container = useRef<HTMLDivElement>(null)
	const lines: HTMLDivElement[] = []
	const indents: number[][] = []
	const [editor, props] = usePrismEditor()

	const update = (code: string) => {
		lineIndentMap = []
		const tabSize = editor.props.tabSize || 2
		const newIndents = getIndentGuides(code, tabSize)
		const l = newIndents.length

		for (let i = 0, prev: number[] = [], next = newIndents[0]; next; i++) {
			const style = (lines[i] ||= guideTemplate()).style
			const [top, left, height] = next
			const old = indents[i]

			next = newIndents[i + 1]

			if (top != old?.[0]) style.top = top + "00%"
			if (left != old?.[1]) style.left = left + "00%"
			if (height != old?.[2]) style.height = height + "00%"

			const isSingleIndent = prev[0] != top && next?.[0] != top,
				isSingleOutdent = prev[0] + prev[1] != top + height && next?.[0] + next?.[1] != top + height

			for (let j = -isSingleIndent, l = height + (isSingleOutdent as any); j < l; j++)
				lineIndentMap[j + top] = i

			prev = indents[i] = newIndents[i]
		}

		for (let i = l; i < prevLength; ) lines[i++].remove()
		container.current!.append(...lines.slice(prevLength, (prevLength = l)))
	}

	const updateActive = () => {
		const newActive = lines[lineIndentMap[editor.activeLine - 1]]

		if (newActive != active) {
			if (active) active.className = ""
			if (newActive) newActive.className = "active-indent"
			active = newActive
		}
	}

	const noWrap = !props.wordWrap

	useLayoutEffect(
		useStableRef(() => {
			const value = editor.value
			const cleanup1 = editor.on("update", update)
			const cleanup2 = editor.on("selectionChange", updateActive)

			if (value) {
				update(value)
				updateActive()
			}

			return () => {
				cleanup1()
				cleanup2()
			}
		}),
		[props.tabSize],
	)

	return useMemo(() => {
		return (
			<div
				ref={container}
				className="guide-indents"
				style={{
					left: "var(--padding-left)",
					bottom: "auto",
					right: "auto",
					display: noWrap ? "" : "none",
				}}
			>
				{"\t"}
			</div>
		)
	}, [noWrap])
}

export { IndentGuides, getIndentGuides }
