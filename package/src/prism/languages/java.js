import { languages } from '../core.js';
import { boolean, clikeComment, clikePunctuation, dotPunctuation } from '../utils/patterns.js';

var keywords = /\b(?:abstract|assert|boolean|break|byte|case|catch|char|class|const|continue|default|do|double|else|enum|exports|extends|final|finally|float|for|goto|if|implements|import|instanceof|int|interface|long|module|native|new|non-sealed|null|opens?|package|permits|private|protected|provides|public|record(?!\s*[()[\]{}%~.,:;?%&|^=<>/*+-])|requires|return|sealed|short|static|strictfp|super|switch|synchronized|this|throws?|to|transient|transitive|try|uses|var|void|volatile|while|with|yield)\b/;

// full package (optional) + parent classes (optional)
var classNamePrefix = /(?:[a-z]\w*\s*\.\s*)*(?:[A-Z]\w*\s*\.\s*)*/.source;

var namespace = {
	pattern: /^[a-z]\w*(?:\s*\.\s*[a-z]\w*)*(?:\s*\.)?/,
	inside: dotPunctuation
};

var classInside = {
	'namespace': namespace,
	'punctuation': /\./
};

// based on the java naming conventions
var className = {
	pattern: RegExp(`(^|[^\\w.])${classNamePrefix}[A-Z](?:[\\d_A-Z]*[a-z]\\w*)?\\b`),
	lookbehind: true,
	inside: classInside
};

languages.java = {
	'doc-comment': {
		pattern: /\/\*\*(?!\/)[\s\S]*?(?:\*\/|$)/g,
		alias: 'comment',
		inside: 'javadoc'
	},
	'comment': clikeComment,
	'triple-quoted-string': {
		// http://openjdk.java.net/jeps/355#Description
		pattern: /"""[ \t]*\n(?:\\.|[^\\])*?"""/g,
		alias: 'string'
	},
	'char': /'(?:\\.|[^\\\n']){1,6}'/g,
	'string': {
		pattern: /(^|[^\\])"(?:\\.|[^\\\n"])*"/g,
		lookbehind: true
	},
	'annotation': {
		pattern: /(^|[^.])@\w+(?:\s*\.\s*\w+)*/,
		lookbehind: true,
		alias: 'punctuation'
	},
	'generics': {
		pattern: /<(?:[\w\s,.?]|&(?!&)|<(?:[\w\s,.?]|&(?!&)|<(?:[\w\s,.?]|&(?!&)|<(?:[\w\s,.?]|&(?!&))*>)*>)*>)*>/,
		inside: {
			'class-name': className,
			'keyword': keywords,
			'punctuation': /[().,:<>]/,
			'operator': /[?&|]/
		}
	},
	'import': [
		{
			pattern: RegExp(`(\\bimport\\s+)${classNamePrefix}(?:[A-Z]\\w*|\\*)(?=\\s*;)`),
			lookbehind: true,
			inside: {
				'namespace': namespace,
				'punctuation': /\./,
				'operator': /\*/,
				'class-name': /\w+/
			}
		},
		{
			pattern: RegExp(`(\\bimport\\s+static\\s+)${classNamePrefix}(?:\\w+|\\*)(?=\\s*;)`),
			lookbehind: true,
			alias: 'static',
			inside: {
				'namespace': namespace,
				'static': /\b\w+$/,
				'punctuation': /\./,
				'operator': /\*/,
				'class-name': /\w+/
			}
		}
	],
	'namespace': {
		pattern: RegExp(
			`(\\b(?:exports|import(?:\\s+static)?|module|opens?|package|provides|requires|to|transitive|uses|with)\\s+)(?!${keywords.source})[a-z]\\w*(?:\\.[a-z]\\w*)*\\.?`
		),
		lookbehind: true,
		inside: dotPunctuation
	},
	'class-name': [
		className,
		{
			// variables, parameters, and constructor references
			// this to support class names (or generic parameters) which do not contain a lower case letter (also works for methods)
			pattern: RegExp(`(^|[^\\w.])${classNamePrefix}[A-Z]\\w*(?=\\s+\\w+\\s*[;,=()]|\\s*(?:\\[[\\s,]*\\]\\s*)?::\\s*new\\b)`),
			lookbehind: true,
			inside: classInside
		},
		{
			// class names based on keyword
			// this to support class names (or generic parameters) which do not contain a lower case letter (also works for methods)
			pattern: RegExp(`(\\b(?:class|enum|extends|implements|instanceof|interface|new|record|throws)\\s+)${classNamePrefix}[A-Z]\\w*\\b`),
			lookbehind: true,
			inside: classInside
		}
	],
	'keyword': keywords,
	'boolean': boolean,
	'function': {
		pattern: /\b\w+(?=\()|(::\s*)[a-z_]\w*/,
		lookbehind: true
	},
	'number': /\b0b[01][01_]*l?\b|\b0x(?:\.[a-f\d_p+-]+|[a-f\d_]+(?:\.[a-f\d_p+-]+)?)\b|(?:\b\d[\d_]*(?:\.[\d_]*)?|\B\.\d[\d_]*)(?:e[+-]?\d[\d_]*)?[dfl]?/i,
	'constant': /\b[A-Z][A-Z_\d]+\b/,
	'operator': {
		pattern: /(^|[^.])(?:<<=?|>>>?=?|->|--|\+\+|&&|\|\||::|[?:~]|[%&|^!=<>/*+-]=?)/m,
		lookbehind: true
	},
	'punctuation': clikePunctuation
};
