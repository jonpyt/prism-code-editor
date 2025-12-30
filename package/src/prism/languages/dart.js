import { languages } from '../core.js';
import { boolean, clikeComment, clikeNumber, clikePunctuation, dotPunctuation } from '../utils/patterns.js';

var keywords = /\b(?:a?sync|yield)\b\*?|\b(?:abstract|assert|await|break|case|catch|class|const|continue|covariant|default|deferred|do|dynamic|else|enum|export|extends|extension|external|factory|final|finally|for|[gs]et|hide|if|implements|import|in|interface|library|mixin|new|null|on|operator|part|rethrow|return|show|static|super|switch|this|throw|try|typedef|var|void|while|with)\b/;

// Handles named imports, such as http.Client
var packagePrefix = /(^|[^\w.])(?:[a-z]\w*\s*\.\s*)*(?:[A-Z]\w*\s*\.\s*)*/.source;

// based on the dart naming conventions
var className = {
	pattern: RegExp(packagePrefix + /[A-Z](?:[\d_A-Z]*[a-z]\w*)?\b/.source),
	lookbehind: true,
	inside: {
		'namespace': {
			pattern: /^[a-z]\w*(?:\s*\.\s*[a-z]\w*)*(?:\s*\.)?/,
			inside: dotPunctuation
		},
	}
};

languages.dart = {
	'comment': clikeComment,
	'string-literal': {
		pattern: /r?(?:("""|''')[\s\S]*?\1|(["'])(?:\\.|(?!\2)[^\\\n])*\2(?!\2))/g,
		inside: {
			'interpolation': {
				pattern: /((?:^|[^\\])(?:\\\\)*)\$(?:\w+|\{(?:[^{}]|\{[^}]*\})*\})/,
				lookbehind: true,
				inside: {
					'punctuation': /^.\{?|\}$/g,
					'expression': {
						pattern: /[\s\S]+/,
						inside: 'dart'
					}
				}
			},
			'string': /[\s\S]+/
		}
	},
	'metadata': {
		pattern: /@\w+/,
		alias: 'function'
	},
	'generics': {
		pattern: /<(?:[\w\s.,&?]|<(?:[\w\s.,&?]|<(?:[\w\s.,&?]|<[\w\s.,&?]*>)*>)*>)*>/,
		inside: {
			'class-name': className,
			'keyword': keywords,
			'punctuation': /[().,:<>]/,
			'operator': /[?&|]/
		}
	},
	'class-name': [
		className,
		{
			// variables and parameters
			// this to support class names (or generic parameters) which do not contain a lower case letter (also works for methods)
			pattern: RegExp(packagePrefix + /[A-Z]\w*(?=\s+\w+\s*[;,=()])/.source),
			lookbehind: true,
			inside: className.inside
		}
	],
	'keyword': keywords,
	'boolean': boolean,
	'function': /\b\w+(?=\()/,
	'number': clikeNumber,
	'operator': /\bis!|\b[ai]s\b|--|\+\+|&&|\|\||<<=?|>>=?|~\/=?|[*/%&^|!=<>+-]=?|[~?]/,
	'punctuation': clikePunctuation
}
