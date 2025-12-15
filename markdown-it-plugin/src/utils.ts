import { renderCodeBlock, renderEditor } from "prism-code-editor/ssr"
import { CodeBlockProps } from "./types"

const parseValue = (value = "") => {
	if (value[0] == '"' || value[0] == "'") value = value.slice(1, -1)

	if (!value || value == "true") return true
	if (value == "false") return false
	if (value == "null") return null
	if (!isNaN(+value)) return +value
	return value
}

const addClasses = (
	name: string,
	ranges: string,
	classes: (string | undefined)[],
	numLines: number,
) => {
	let pattern = /(\d+)(?:\s*-\s*(\d+))?/g
	let match: RegExpExecArray | null
	while ((match = pattern.exec(ranges))) {
		let start = +match[1]
		let end = Math.min(+match[2] || start, numLines)
		while (start <= end) {
			if (classes[start]) classes[start] += " " + name
			else classes[start] = name
			start++
		}
	}
}

export const parseMeta = (meta: string, numLines: number) => {
	let result: Record<string, any> = {}
	let classes: (string | undefined)[] = []
	let pattern = /([^\s"'{}=]+)(?:\s*=\s*("[^"]*"|'[^']*'|\{[^}]*\}|[^\s"'{}=]+))?/g
	let match: RegExpExecArray | null
	while ((match = pattern.exec(meta))) {
		if (match[2]?.[0] == "{") {
			addClasses(match[1], match[2], classes, numLines)
		} else {
			result[match[1]] = parseValue(match[2])
		}
	}
	result.classes = classes
	return result as CodeBlockProps
}

export const createEditor = ({ classes, ...props }: CodeBlockProps) => {
	return renderEditor(props)
}

export const createCodeBlock = ({ classes, ...props }: CodeBlockProps) => {
	if (classes.length && !props.addLineClass) {
		props.addLineClass = (line: number) => classes[line]
	}

	return renderCodeBlock(props)
}
