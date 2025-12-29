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
			alias: 'punctuation'
		},
		'expression': expression
	}
};

expression.inside = languages.groovy = {
	'comment': clikeComment,
	'shebang': {
		pattern: /#!.+/g,
		alias: 'comment'
	},
	'interpolation-string': {
		// TODO: Slash strings (e.g. /foo/) can contain line breaks but this will cause a lot of trouble with
		// simple division (see JS regex), so find a fix maybe?
		pattern: /"""(?:\\[\s\S]|[^\\])*?"""|(["/])(?:\\.|(?!\1)[^\\\n])*\1|\$\/(?:[^/$]|\$(?:[/$]|(?![/$]))|\/(?!\$))*\/\$/g,
		inside: {
			'interpolation': interpolation,
			'string': /[\s\S]+/
		}
	},
	// https://groovy-lang.org/syntax.html#_dollar_slashy_string
	'string': /'''(?:\\[\s\S]|[^\\])*?'''|'(?:\\.|[^\\\n'])*'/g,
	'class-name': clikeClass(),
	'keyword': /\b(?:abstract|as|assert|boolean|break|byte|case|catch|char|class|const|continue|def|default|do|double|else|enum|extends|final|finally|float|for|goto|if|implements|import|instanceof|int?|interface|long|native|new|package|private|protected|public|return|short|static|strictfp|super|switch|synchronized|this|throws?|trait|transient|try|void|volatile|while)\b/,
	'boolean': boolean,
	'annotation': {
		pattern: /(^|[^.])@\w+/,
		lookbehind: true,
		alias: 'punctuation'
	},
	'function': /\b\w+(?=\()/,
	'number': /\b(?:0b[01_]+|0x[a-f\d_]+(?:\.[a-f\d_p-]+)?|[\d_]+(?:\.[\d_]+)?(?:e[+-]?\d+)?)[glidf]?\b/i,
	'operator': {
		pattern: /(^|[^.])(?:~|==?~?|\?[.:]?|\*\.|\.[@&]|\.\.<|\.\.(?!\.)|--|\+\+|&&|\|\||\*\*=?|->|>>>?=?|<<=?|<=>?|[%&|^!=<>/*+-]=?)/,
		lookbehind: true
	},
	'spock-block': /\b(?:and|cleanup|expect|given|setup|[tw]hen|where):/,
	'punctuation': /\.+|[()[\]{},:;$]/
};
