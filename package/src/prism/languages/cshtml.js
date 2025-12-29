import { languages } from '../core.js';
import { clone, insertBefore } from '../utils/language.js';
import { nested, replace } from '../utils/shared.js';
import './markup.js';
import './csharp.js';

var commentLike = /\/(?![/*])|\/\/.*\n|\/\*[^*]*(?:\*(?!\/)[^*]*)*\*\//.source;
var stringLike = `@(?!")|"(?:[^\\\\\n"]|\\\\.)*"|@"(?:\\\\[\\s\\S]|[^\\\\"]|"")*"(?!")|'(?:(?:[^\\\\\n']|\\\\.|\\\\[Uux][\a-fA-F\d]{1,8})'|(?=[^\\\\](?!')))`;

var round = nested(replace(/\((?:[^()"'@/]|<0>|<1>|<self>)*\)/.source, [stringLike, commentLike]), 2);
var square = nested(replace(/\[(?:[^[\]"'@/]|<0>|<1>|<self>)*\]/.source, [stringLike, commentLike]), 1);
var curly = nested(replace(/\{(?:[^{}"'@/]|<0>|<1>|<self>)*\}/.source, [stringLike, commentLike]), 2);
var angle = nested(replace(/<(?:[^<>"'@/]|<0>|<self>)*>/.source, [commentLike]), 1);

var inlineCs = `@(?:await\\b\\s*)?(?:(?!await\\b)\\w+\\b|${round})(?:[?!]?\\.\\w+\\b|(?:${angle})?${round}|${square})*(?![?!\\.(\\[]|<(?!\\/))`;

// Note about the above bracket patterns:
// They all ignore HTML expressions that might be in the C# code. This is a problem because HTML (like strings and
// comments) is parsed differently. This is a huge problem because HTML might contain brackets and quotes which
// messes up the bracket and string counting implemented by the above patterns.
//
// This problem is not fixable because 1) HTML expression are highly context sensitive and very difficult to detect
// and 2) they require one capturing group at every nested level. See the `tagRegion` pattern to admire the
// complexity of an HTML expression.
//
// To somewhat alleviate the problem a bit, the patterns for characters (e.g. 'a') is very permissive, it also
// allows invalid characters to support HTML expressions like this: <p>That's it!</p>.

var tagAttrInlineCs = "@(?![()\\w])|" + inlineCs;
var tagAttrValue = `(?:"[^"@]*"|'[^'@]*'|[^\\s"'@=>]+(?=[\\s>])|["'][^"'@]*(?:(?:${tagAttrInlineCs})[^"\'@]*)+["\'])`;

var tagAttrs = `(?:\\s(?:\\s*[^\\s/=>]+(?:\\s*=\\s*${tagAttrValue}|(?=[\\s/>])))+)?`;
var tagContent = `(?!\\d)[^\\s/=>$<%]+${tagAttrs}\\s*\\/?>`;
var tagRegion = `\\B@?(?:<([a-zA-Z][\\w:]*)${tagAttrs}\\s*>(?:[^<]|<\\/?(?!\\1\\b)${tagContent}|${nested(
	`<\\1${tagAttrs}\\s*>(?:[^<]|<\\/?(?!\\1\\b)${tagContent}|<self>)*<\\/\\1\\s*>`, 2
)})*<\\/\\1\\s*>|<${tagContent})`

// Now for the actual language definition(s):
//
// Razor as a language has 2 parts:
//  1) CSHTML: A markup-like language that has been extended with inline C# code expressions and blocks.
//  2) C#+HTML: A variant of C# that can contain CSHTML tags as expressions.
//
// In the below code, both CSHTML and C#+HTML will be create as separate language definitions that reference each
// other. However, only CSHTML will be exported via `languages`.

var cshtml = languages.razor = languages.cshtml = clone(languages.html);

var csharpWithHtml = clone(languages.cs);

var cs = {
	pattern: /\S[\s\S]*/,
	alias: 'language-csharp',
	inside: csharpWithHtml
};

var inlineValue = {
	pattern: RegExp(/(^|[^@])/.source + inlineCs, 'g'),
	lookbehind: true,
	alias: 'variable',
	inside: {
		'keyword': /^@/,
		'csharp': cs
	}
};

var attrValue = cshtml.tag.inside['attr-value'][2];

cshtml.tag.pattern = RegExp(/<\/?/.source + tagContent, 'g');
attrValue.pattern = RegExp(/(=\s*)/.source + tagAttrValue, 'g');

insertBefore(csharpWithHtml, 'string', {
	'html': {
		pattern: RegExp(tagRegion, 'g'),
		inside: cshtml
	}
});

insertBefore(attrValue.inside, 'punctuation', { 'value': inlineValue });

insertBefore(cshtml, 'prolog', {
	'razor-comment': {
		pattern: /@\*[\s\S]*?\*@/g,
		alias: 'comment'
	},

	'block': {
		pattern: RegExp(
			`(^|[^@])@(?:${curly}|(?:code|functions)\\s*${curly}|(?:for|foreach|lock|switch|using|while)\\s*${
				round
			}\\s*${curly}|do\\s*${curly}\\s*while\\s*${round}(?:\\s*;)?|try\\s*${curly}\\s*catch\\s*${round}\\s*${curly}\\s*finally\\s*${
				curly
			}|if\\s*${round}\\s*${curly}(?:\\s*else(?:\\s+if\\s*${round})?\\s*${curly})*|helper\\s+\\w+\\s*${round}\\s*${curly})`, 'g'
		),
		lookbehind: true,
		inside: {
			'keyword': /^@\w*/,
			'csharp': cs
		}
	},

	'directive': {
		pattern: /^([ \t]*)@(?:addTagHelper|attribute|implements|inherits|inject|layout|model|namespace|page|preservewhitespace|removeTagHelper|section|tagHelperPrefix|using)(?=\s).*/mg,
		lookbehind: true,
		inside: {
			'keyword': /^@\w+/,
			'csharp': cs
		}
	},

	'value': inlineValue,

	'delegate-operator': {
		pattern: /(^|[^@])@(?=<)/,
		lookbehind: true,
		alias: 'operator'
	}
});
