import { languages } from '../core.js';
import { clikeClass } from '../utils/clike-class.js';
import { boolean, clikeComment } from '../utils/patterns.js';

var expression = {
	pattern: /[\s\S]+/
}

var interpolation = {
	pattern: /((?:^|[^\\$])(?:\\\\)*)\$(?:\w+|\{[^{}]*\})/,
	lookbehind: true,
	inside: {
		'interpolation-punctuation': {
			pattern: /^\$\{?|\}$/,
			alias: 'punctuation',
		},
		'expression': expression,
	},
};

expression.inside = languages.gradle = {
	'comment': clikeComment,
	'shebang': {
		pattern: /#!.+/g,
		alias: 'comment',
	},
	'interpolation-string': {
		pattern: /"""(?:\\[\s\S]|[^\\])*?"""|(["/])(?:\\.|(?!\1)[^\\\n])*\1|\$\/(?:[^/$]|\$(?:[/$]|(?![/$]))|\/(?!\$))*\/\$/g,
		inside: {
			'interpolation': interpolation,
			'string': /[\s\S]+/,
		},
	},
	'string': /'''(?:\\[\s\S]|[^\\])*?'''|'(?:\\.|[^\\\n'])*'/g,
	'class-name': clikeClass(),
	'keyword':
		/\b(?:apply|def|dependencies|else|if|implementation|import|plugins?|project|repositories|repository|sourceSets|tasks|val)\b/,
	'boolean': boolean,
	'annotation': {
		pattern: /(^|[^.])@\w+/,
		lookbehind: true,
		alias: 'punctuation',
	},
	'function': /\b\w+(?=\()/,
	'number': /\b(?:0b[01_]+|0x[a-f\d_]+(?:\.[a-f\d_p-]+)?|[\d_]+(?:\.[\d_]+)?(?:e[+-]?\d+)?)[glidf]?\b/i,
	'operator': {
		pattern: /(^|[^.])(?:~|==?~?|\?[.:]?|\*\.|\.[@&]|\.\.<|\.\.(?!\.)|--|\+\+|&&|\|\||\*\*=?|->|>>>?=?|<<=?|<=>?|[%&|^!=<>/*+-]=?)/,
		lookbehind: true,
	},
	'spock-block': /\b(?:and|cleanup|expect|given|setup|[tw]hen|where):/,
	'punctuation': /\.+|[()[\]{},:;$]/,
};
