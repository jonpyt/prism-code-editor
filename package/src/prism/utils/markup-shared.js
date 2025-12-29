import { tokenize, withoutTokenizer } from '../core.js';
import { braces } from './jsx-shared.js';
import { re } from './shared.js';

/**
 * @param {string} tagName
 * @param {*} tagInside
 * @param {(code: string) => string} getLang
 */
var addInlined = (tagName, tagInside, getLang) => ({
	pattern: RegExp(`<${tagName}(?:\\s[^>]*)?>[\\s\\S]*?</${tagName}\\s*>`, 'g'),
	inside: {
		'code-block': {
			pattern: /(>)[\s\S]+(?=<)/,
			lookbehind: true
		},
		'tag': {
			pattern: /[^>]+>/,
			inside: tagInside
		},
		[tokenize]: (code, grammar) => {
			grammar['code-block'].alias = 'language-' + (grammar['code-block'].inside = getLang(code));
			return withoutTokenizer(code, grammar);
		}
	}
});

/**
 * @param {*} expression
 */
var astroTag = expression => ({
	pattern: re(
		/<\/?(?:(?!\d)[^\s%=<>/]+(?:\s(?:\s*[^\s{=<>/]+(?:\s*=\s*(?!\s)(?:"[^"]*"|'[^']*'|[^\s{=<>/"']+(?=[\s/>])|<0>)?|(?=[\s/>]))|\s*<0>)*)?\s*\/?)?>/.source, [braces], 'g'
	),
	inside: {
		'punctuation': /^<\/?|\/?>$/,
		'tag': {
			pattern: /^\S+/,
			inside: {
				'namespace': /^[^:]+:/,
				'class-name': /^[A-Z]\w*(?:\.[A-Z]\w*)*$/
			}
		},
		'attr-value': {
			pattern: /(=\s*)(?:"[^"]*"|'[^']*'|[^\s>{]+)/,
			lookbehind: true,
			inside: {
				'punctuation': /^["']|["']$/
			}
		},
		'expression': expression,
		'attr-equals': /=/,
		'attr-name': {
			pattern: /\S+/,
			inside: {
				'namespace': /^[^:]+:/
			}
		}
	}
});

export { addInlined, astroTag };
