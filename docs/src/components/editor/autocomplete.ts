import "prism-code-editor/autocomplete.css"
import "prism-code-editor/autocomplete-icons.css"
import {
	registerCompletions,
	fuzzyFilter,
	autoComplete,
	completeFromList,
} from "prism-code-editor/autocomplete"
import {
	completeKeywords,
	jsDocCompletion,
	jsxTagCompletion,
	reactTags,
	globalReactAttributes,
	jsSnipets,
	jsContext,
	jsCompletion,
} from "prism-code-editor/autocomplete/javascript"
import { cssCompletion } from "prism-code-editor/autocomplete/css"
import {
	globalHtmlAttributes,
	globalMathMLAttributes,
	globalSvgAttributes,
	htmlTags,
	markupCompletion,
	mathMLTags,
	svgTags,
} from "prism-code-editor/autocomplete/markup"
import { editors } from "./mount"
import { vueCompletion } from "prism-code-editor/autocomplete/vue"
import {
	svelteBlockSnippets,
	svelteCompletion,
	svelteTag,
	svelteTags,
} from "prism-code-editor/autocomplete/svelte"
import { markupEmmetCompletion } from "prism-code-editor/autocomplete/emmet"
import "prism-code-editor/languages/svelte"
import "prism-code-editor/languages/vue"

registerCompletions(["javascript", "js", "jsx", "tsx", "typescript", "ts"], {
	context: jsContext,
	sources: [
		jsCompletion(window),
		completeKeywords,
		jsDocCompletion,
		jsxTagCompletion(reactTags, globalReactAttributes),
		completeFromList(jsSnipets),
		markupEmmetCompletion({ tags: [reactTags] }),
	],
})

registerCompletions(["html", "markup"], {
	sources: [
		markupCompletion(
			[
				{
					tags: htmlTags,
				},
				{
					tags: svgTags,
					globals: globalSvgAttributes,
				},
				{
					tags: mathMLTags,
					globals: globalMathMLAttributes,
				},
				{
					tags: {
						"my-custom-element": {
							hello: ["world"],
							foo: null,
							bar: null,
						},
					},
				},
			],
			globalHtmlAttributes,
		),
		markupEmmetCompletion({ tags: [htmlTags, svgTags, mathMLTags] }),
	],
})

registerCompletions(["css"], {
	sources: [cssCompletion()],
})

registerCompletions(["vue"], {
	sources: [
		vueCompletion({
			MyComponent: {
				hello: ["world"],
				onevent: null,
			},
		}),
		markupEmmetCompletion({ tags: [htmlTags, svgTags] }),
	],
})

registerCompletions(["svelte"], {
	sources: [
		svelteCompletion(svelteBlockSnippets, {
			MyComponent: {
				hello: ["world"],
				onevent: null,
			},
		}),
		markupEmmetCompletion({ tags: [htmlTags, svgTags, svelteTags], tagPattern: svelteTag }),
	],
})

editors.forEach(editor =>
	editor.addExtensions(
		autoComplete({
			filter: fuzzyFilter,
		}),
	),
)
