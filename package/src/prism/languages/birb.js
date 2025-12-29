import { languages } from '../core.js';
import { boolean, clikeComment, clikeNumber, clikePunctuation } from '../utils/patterns.js';

languages.birb = {
	'comment': clikeComment,
	'string': /r?(["'])(?:\\.|(?!\1)[^\\])*\1/g,
	'class-name': /\b[A-Z](?:[\d_]*[a-zA-Z]\w*)?\b|\b(?:[A-Z]\w*|(?!(?:var|void)\b)[a-z]\w*)(?=\s+\w+\s*[;,=()])/,
	'keyword': /\b(?:assert|break|case|class|const|default|else|enum|final|follows|for|grab|if|nest|new|next|noSeeb|return|static|switch|throw|var|void|while)\b/,
	'boolean': boolean,
	'metadata': {
		pattern: /<\w+>/g,
		alias: 'symbol'
	},
	'function': /\b\w+(?=\()/,
	'number': clikeNumber,
	'operator': /--|\+\+|&&|\|\||(?:<<|>>|~\/|[%&|^!=<>/*+-])=?|[?:~]/,
	'punctuation': clikePunctuation,
	'variable': /\b[a-z_]\w*\b/
};
