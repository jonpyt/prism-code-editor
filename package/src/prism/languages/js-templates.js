import { languages, tokenize, rest } from '../core.js';
import { embeddedIn } from '../utils/templating.js';
import './javascript.js';

var js = languages.js;
var templateString = js['template-string'];

// see the pattern in prism-javascript.js
var templateLiteralPattern = templateString.pattern.source;
var interpolationPattern = templateString.inside.interpolation.pattern;

/**
 * Creates a new pattern to match a template string with a special tag.
 *
 * This will return `undefined` if there is no grammar with the given language id.
 *
 * @param {string} language The language id of the embedded language. E.g. `markdown`.
 * @param {string} tag The regex pattern to match the tag.
 * @returns {object | undefined}
 * @example
 * createTemplate('css', /\bcss/.source);
 */
var createTemplate = (language, tag) => ({
	pattern: RegExp('(\\b(?:' + tag + ')\\s*)' + templateLiteralPattern, 'g'),
	lookbehind: true,
	inside: {
		'template-punctuation': {
			pattern: /^`|`$/,
			alias: 'string'
		},
		['language-' + language]: {
			pattern: /[\s\S]+/,
			inside: {
				'interpolation': {
					pattern: interpolationPattern,
					lookbehind: true,
					alias: 'language-javascript',
					inside: {
						'interpolation-punctuation': {
							pattern: /^\$\{|\}$/,
							alias: 'punctuation'
						},
						[rest]: 'js'
					}
				},
				[tokenize]: embeddedIn(language)
			}
		}
	}
});

js['template-string'] = [
	// styled-jsx:
	//   css`a { color: #25F; }`
	// styled-components:
	//   styled.h1`color: red;`
	createTemplate('css', /styled(?:\([^)]*\))?(?:\s*\.\s*\w+(?:\([^)]*\))*)*|css(?:\s*\.\s*(?:global|resolve))?|createGlobalStyle|keyframes/.source),

	// html`<p></p>`
	// div.innerHTML = `<p></p>`
	createTemplate('html', /html|\.\s*(?:inner|outer)HTML\s*\+?=/.source),

	// svg`<path fill="#fff" d="M55.37 ..."/>`
	createTemplate('svg', /svg/.source),

	// md`# h1`, markdown`## h2`
	createTemplate('markdown', /markdown|md/.source),

	// gql`...`, graphql`...`, graphql.experimental`...`
	createTemplate('graphql', /gql|graphql(?:\s*\.\s*experimental)?/.source),

	// sql`...`
	createTemplate('sql', /sql/.source),

	// vanilla template string
	templateString
];
