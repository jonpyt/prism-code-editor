import { languages } from '../core.js';
import { clikePunctuation } from '../utils/patterns.js';

languages.icon = {
	'comment': /#.*/,
	'string': /(["'])(?:\\.|(?!\1)[^\\\n_]|_(?!\1)[\s\S])*\1/g,
	'number': /\b(?:\d+r[a-z\d]+|\d+(?:\.\d+)?(?:e[+-]?\d+)?)\b|\.\d+\b/i,
	'builtin-keyword': {
		pattern: /&(?:allocated|ascii|clock|collections|cset|current|date|dateline|digits|dump|e|error(?:number|text|value)?|errout|fail|features|file|host|input|[lu]case|letters|level|line|main|null|output|phi|pi|pos|progname|random|regions|source|storage|subject|time|trace|version)\b/,
		alias: 'variable'
	},
	'directive': {
		pattern: /\$\w+/,
		alias: 'builtin'
	},
	'keyword': /\b(?:break|by|case|create|default|do|else|end|every|fail|global|if|initial|invocable|link|local|next|not|of|procedure|record|repeat|return|static|suspend|then|to|until|while)\b/,
	'function': /\b(?!\d)\w+(?=\s*[({]|\s*!\s*\[)/,
	'operator': /[+-]:(?!=)|(?:[/?@^%&]|\+\+?|--?|~?==?=?|\*\*?|\|\|\|?|<(?:->?|<?=?)|>>?=?)(?::=)?|:=?:?|[!.\\|~]/,
	'punctuation': clikePunctuation
};
