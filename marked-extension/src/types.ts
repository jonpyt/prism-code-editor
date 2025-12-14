import type { TokenStream } from "prism-code-editor/prism"
import type { CodeBlockOptions, RenderOptions } from "prism-code-editor/ssr"

export type CodeBlockProps = {
	[prop: string]: any
	language: string
	value: string
	/** Extra classes that will be added to the code lines in code blocks. */
	classes: (string | undefined)[]
}

export type PcePluginOptions = {
	/**
	 * When true, code blocks without the `editor` property are ignored, but you can still
	 * create code blocks with `editor=false`. This is useful if you're using another
	 * plugin to create the code blocks. @default false
	 */
	editorsOnly?: boolean
	/**
	 * Default props used when rendering editors.
	 */
	defaultEditorProps?: Omit<RenderOptions, "value" | "language">
	/**
	 * Default props used when rendering code blocks.
	 */
	defaultCodeBlockProps?: Omit<CodeBlockOptions, "value" | "language">
	/**
	 * Function that allows you to wrap the default render function or completely override
	 * it.
	 * @param props Props used to render the editor or code block.
	 * @param defaultRenderer The default render function.
	 * @param isEditor Whether or not an editor is being rendered.
	 */
	customRenderer?(
		props: CodeBlockProps,
		defaultRenderer: (props: CodeBlockProps) => string,
		isEditor: boolean,
	): string
	/**
	 * Options for highlighting inline code between backticks. The language used to
	 * highlight the snippet can be configured with a `{:language}` marker at the end.
	 * If this option is omitted, inline highlighting will be disabled.
	 */
	inline?: {
		/**
		 * Callback that can be used to modify the tokens before they're stringified to HTML.
		 * Can be used to add rainbow brackets for example.
		 */
		tokenizeCallback?(tokens: TokenStream, language: string): void
	}
	/**
	 * This plugin will warn you when a code block has a language without a registered
	 * grammar. Set this to true to disable the warnings.
	 */
	silenceWarnings?: boolean
}
