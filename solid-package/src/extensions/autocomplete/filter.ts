import { CompletionFilter } from "./types"

/**
 * Fuzzy filter that only requires that the option includes all the characters in the
 * query string in order with any number of character between each.
 *
 * Occurrences that result in score penalties:
 * - Skipping characters in the option.
 * - The case of the characters doesn't match.
 * - The match doesn't start at the beginning.
 * - The option is longer than the query.
 */
const fuzzyFilter: CompletionFilter = (query: string, option: string) => {
	const optionLen = option.length
	const queryLen = query.length

	if (queryLen > optionLen) return
	if (queryLen == 1 || queryLen == optionLen) return strictFilter(query, option)

	const queryLc = query.toLowerCase()
	const optionLc = option.toLowerCase()
	const matched: number[] = []
	const fullMatch = optionLc.indexOf(queryLc)

	let score = 0
	let i = 0
	let prevPos = 0
	let j = 0
	for (; i < queryLen; ) {
		const pos = fullMatch > -1 ? i + fullMatch : optionLc.indexOf(queryLc[i], prevPos)
		const hasSkipped = pos > prevPos

		if (pos < 0) return
		if (hasSkipped) score -= 800
		if (hasSkipped || !j) {
			matched[j] = pos
			j += 2
		}
		matched[j - 1] = prevPos = pos + 1

		// Add a penalty if the query and option had different case
		if (query[i++] != option[pos]) score -= 100
	}

	return [queryLen < optionLen ? score - 100 : score, matched]
}

/**
 * Strict filter that requires the option to start with the query string.
 *
 * Occurrences that result in score penalties:
 * - The case of the query and the start of the option is different.
 * - The option is longer than the query.
 */
const strictFilter: CompletionFilter = (query: string, option: string) => {
	const optionLen = option.length
	const queryLen = query.length

	if (queryLen > optionLen) return

	const start = option.slice(0, queryLen)
	const score = start == query ? 0 : query.toLowerCase() == start.toLowerCase() ? -200 : null
	if (score == null) return

	return [query ? (queryLen < optionLen ? score - 100 : score) : 0, [0, queryLen]]
}

export { fuzzyFilter, strictFilter }
