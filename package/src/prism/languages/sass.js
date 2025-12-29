import { languages } from '../core.js';
import { extend, insertBefore } from '../utils/language.js';
import './css.js';

var variable = /\$[-\w]+|#\{\$[-\w]+\}/;
var operator = {
	pattern: /[%/*+]|[!=]=|<=?|>=?|\b(?:and|not|or)\b|(\s)-(?!\S)/,
	lookbehind: true
};

var sass = languages.sass = extend('css', {
	// Sass comments don't need to be closed, only indented
	'comment': {
		pattern: /^([ \t]*)\/[/*].*(?:$\s*?\n\1[ \t]+\S.*)*/mg,
		lookbehind: true
	}
});

insertBefore(sass, 'atrule', {
	// We want to consume the whole line
	'atrule-line': {
		// Includes support for = and + shortcuts
		pattern: /^(?:[ \t]*)[@+=].+/mg,
		inside: {
			'atrule': /(?:@[\w-]+|[+=])/
		}
	}
});
delete sass.atrule;

insertBefore(sass, 'property', {
	// We want to consume the whole line
	'variable-line': {
		pattern: /^[ \t]*\$.+/mg,
		inside: {
			'punctuation': /:/,
			'variable': variable,
			'operator': operator
		}
	},
	// We want to consume the whole line
	'property-line': {
		pattern: /^[ \t]*(?:[^:\s]+ *:.*|:[^:\s].*)/mg,
		inside: {
			'property': [
				/[^:\s]+(?=\s*:)/,
				{
					pattern: /(:)[^:\s]+/,
					lookbehind: true
				}
			],
			'punctuation': /:/,
			'variable': variable,
			'operator': operator,
			'important': sass.important
		}
	}
});
delete sass.property;
delete sass.important;

// Now that whole lines for other patterns are consumed,
// what's left should be selectors
insertBefore(sass, 'punctuation', {
	'selector': {
		pattern: /^([ \t]*)\S(?:,[^\n,]+|[^\n,]*)(?:,[^\n,]+)*(?:,\n\1[ \t]+\S(?:,[^\n,]+|[^\n,]*)(?:,[^\n,]+)*)*/mg,
		lookbehind: true
	}
});
