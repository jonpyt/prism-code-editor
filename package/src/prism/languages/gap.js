import { languages } from '../core.js';
import { boolean, clikePunctuation } from '../utils/patterns.js';

// https://www.gap-system.org/Manuals/doc/ref/chap4.html
// https://www.gap-system.org/Manuals/doc/ref/chap27.html

var gap = {
	pattern: /^(gap>).+(?:\n>.*)*/,
	lookbehind: true
};

gap.inside = languages.gap = {
	'shell': {
		pattern: /^gap>[\s\S]*?(?=^gap>|$(?![\s\S]))/mg,
		inside: {
			'gap': gap,
			'punctuation': /^gap>/
		}
	},

	'comment': /#.*/g,
	'string': {
		pattern: /(^|[^\\"'])(?:'(?:\\.|[^\\\n']|){1,10}'|"(?:\\.|[^\\\n"])*"(?!")|"""[\s\S]*?""")/g,
		lookbehind: true,
		inside: {
			'continuation': {
				pattern: /^>/m,
				alias: 'punctuation'
			}
		}
	},

	'keyword': /\b(?:Assert|Info|IsBound|QUIT|TryNextMethod|Unbind|[ae]nd|atomic|break|continue|do|elif|else|fi|f?or|function|if|in|local|m?od|not|quit|readonly|readwrite|rec|repeat|return|then|until|while)\b/,
	'boolean': boolean,

	'function': /\b[a-z_]\w*(?=\s*\()/i,

	'number': {
		pattern: /(^|[^\w.]|\.\.)(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?(?:_[a-z]?)?(?=$|[^\w.]|\.\.)/,
		lookbehind: true
	},

	'continuation': {
		pattern: /^>/m,
		alias: 'punctuation'
	},
	'operator': /->|[~^!=/*+-]|<>|[<>]=?|:=|\.\./,
	'punctuation': clikePunctuation
};
