export const options = `const options = {
	editorsOnly: false,
	silenceWarnings: false,
	defaultEditorProps: {
		tokenizeCallback: rainbowBrackets(),
	},
	defaultCodeBlockProps: {
		tokenizeCallback: rainbowBrackets(),
		guideIndents: true,
		lineNumbers: true,
	},
	inline: {}
}
`

export const markdown = `## Test

Inline code: \`code.replace(/\\r\\n?/, "\\n"){:js}\`

\`\`\`js editor
const foo = "bar"
\`\`\`

\`\`\`css
div.foo {
	display: flex;
	align-items: center;
}
\`\`\`
`
