import { languages, tokenize, withoutTokenizer } from '../core.js';
import { boolean } from '../utils/patterns.js';

languages.graphql = {
	'comment': /#.*/,
	'description': {
		pattern: /(?:"""(?:[^"]|"(?!""))*"""|"(?:\\.|[^\\\n"])*")(?=\s*[a-z_])/gi,
		alias: 'string',
		inside: {
			'language-markdown': {
				pattern: /("(?!")|""")[\s\S]+(?=\1)/,
				lookbehind: true,
				inside: 'md'
			}
		}
	},
	'string': /"""[\s\S]*?"""|"(?:\\.|[^\\\n"])*"/g,
	'number': /(?:\B-|\b)\d+(?:\.\d+)?(?:e[+-]?\d+)?\b/i,
	'boolean': boolean,
	'variable': /\$[a-z_]\w*/i,
	'directive': {
		pattern: /@[a-z_]\w*/i,
		alias: 'function'
	},
	'attr-name': /\b[a-z_]\w*(?=\s*(?:\((?:[^()"]|"(?:\\.|[^\\\n"])*")*\))?:)/gi,
	'atom-input': {
		pattern: /\b[A-Z]\w*Input\b/,
		alias: 'class-name'
	},
	'scalar': /\b(?:Boolean|Float|ID|Int|String)\b/,
	'constant': /\b[A-Z][A-Z_\d]*\b/,
	'class-name': {
		pattern: /(\b(?:enum|implements|interface|on|scalar|type|union)\s+|&\s*|:\s*|\[)[A-Z_]\w*/,
		lookbehind: true
	},
	'fragment': {
		pattern: /(\bfragment\s+|\.{3}\s*(?!on\b))(?!\d)\w+/,
		lookbehind: true,
		alias: 'function'
	},
	'definition-mutation': {
		pattern: /(\bmutation\s+)(?!\d)\w+/,
		lookbehind: true,
		alias: 'function'
	},
	'definition-query': {
		pattern: /(\bquery\s+)(?!\d)\w+/,
		lookbehind: true,
		alias: 'function'
	},
	'keyword': /\b(?:directive|enum|extend|fragment|implements|input|interface|mutation|on|query|repeatable|scalar|schema|subscription|type|union)\b/,
	'operator': /[&|!=]|\.{3}/,
	'property-query': /\w+(?=\s*\()/,
	'object': /\w+(?=\s*\{)/,
	'punctuation': /[()[\]{},:!=]/,
	'property': /\w+/,
	[tokenize](code, grammar) {
		var tokens = withoutTokenizer(code, grammar);

		/**
		 * get the graphql token stream that we want to customize
		 *
		 * @typedef {InstanceType<import("../core.js")["Token"]>} Token
		 * @type {Token[]}
		 */
		var validTokens = tokens.filter(({type}) => type && type != 'comment' && type != 'scalar');
		var l = validTokens.length;
		var currentIndex = 0;

		/**
		 * Returns whether the token relative to the current index has the given type.
		 *
		 * @param {readonly string[]} types
		 * @returns {boolean}
		 */
		var isNotTokenType = types => {
			for (var i = 0; i < types.length; i++) {
				if (currentIndex + i == l || validTokens[currentIndex + i].type != types[i]) {
					return true;
				}
			}
		}

		/**
		 * Returns the index of the closing bracket to an opening bracket.
		 *
		 * It is assumed that `token[currentIndex - 1]` is an opening bracket.
		 *
		 * If no closing bracket could be found, `-1` will be returned.
		 *
		 * @param {string} open
		 * @param {string} close
		 * @returns {number | void}
		 */
		var findClosingBracket = (open, close) => {
			var stackHeight = 1;

			for (var i = currentIndex; i < l; i++) {
				var token = validTokens[i];
				var content = token.content;

				if (token.type == 'punctuation') {
					if (open == content) {
						stackHeight++;
					} else if (close == content && !--stackHeight) {
						return i;
					}
				}
			}
		}

		while (currentIndex < l) {
			var startToken = validTokens[currentIndex++];

			// add special aliases for mutation tokens
			if (startToken.type == 'keyword' && startToken.content == 'mutation') {
				// any array of the names of all input variables (if any)
				var inputVariables = [];

				if (!isNotTokenType(['definition-mutation', 'punctuation']) && validTokens[currentIndex + 1].content == '(') {
					// definition

					currentIndex += 2; // skip 'definition-mutation' and 'punctuation'

					var definitionEnd = findClosingBracket("(", ")");
					if (!definitionEnd) continue;

					// find all input variables
					for (; currentIndex < definitionEnd; currentIndex++) {
						var t = validTokens[currentIndex];
						if (t.type == 'variable') {
							t.alias = 'variable-input';
							inputVariables.push(t.content);
						}
					}

					currentIndex = definitionEnd + 1;
				}

				if (!isNotTokenType(['punctuation', 'property-query']) && validTokens[currentIndex].content == '{') {
					// skip opening bracket
					validTokens[++currentIndex].alias = 'property-mutation';

					if (inputVariables[0]) {
						var mutationEnd = findClosingBracket("{", "}");
						// give references to input variables a special alias
						if (mutationEnd) for (var i = currentIndex; i < mutationEnd; i++) {
							var varToken = validTokens[i];
							if (varToken.type == 'variable' && inputVariables.indexOf(varToken.content) >= 0) {
								varToken.alias = 'variable-input';
							}
						}
					}
				}
			}
		}
		return tokens;
	}
};
