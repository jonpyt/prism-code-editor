import { languages } from '../core.js';
import { extend, insertBefore } from '../utils/language.js';
import { dotPunctuation } from '../utils/patterns.js';
import './haskell.js';

insertBefore(
	languages.idr = languages.idris = extend('hs', {
		'comment': /(?:(?:--|\|\|\|).*$|\{-[\s\S]*?-\})/m,
		'keyword': /\b(?:Type|case|class|codata|constructor|corecord|data|do|dsl|else|export|if|implementation|implicit|import|impossible|in|infix[lr]?|instance|interface|let|module|mutual|namespace|of|parameters|partial|postulate|private|proof|public|quoteGoal|record|rewrite|syntax|then|total|using|where|with)\b/,
		'builtin': undefined
	}),
	'keyword', {
		'import-statement': {
			pattern: /(^\s*import\s+)(?:[A-Z][\w']*)(?:\.[A-Z][\w']*)*/m,
			lookbehind: true,
			inside: dotPunctuation
		}
	}
);
