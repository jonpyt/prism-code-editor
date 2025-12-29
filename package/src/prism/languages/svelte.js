import { languages, tokenize, withoutTokenizer } from '../core.js';
import { braces } from '../utils/jsx-shared.js';
import { addInlined, astroTag } from '../utils/markup-shared.js';
import { re } from '../utils/shared.js';
import { entity, xmlComment } from '../utils/xml-shared.js';

var currentLang;

var expression = {
	pattern: RegExp(braces, 'g')
};

var tag = astroTag(expression);

var tagInside = tag.inside;

var blockInside = {
	'punctuation': /^\W|\}$/,
	'keyword': /^\w+|\bthen\b(?!\s*[^\s[{$\w\xa0-\uffff])/
};

var blockLang = {
	pattern: /[\s\S]+/
};

tagInside['attr-value'].inside['expression'] = expression;

languages.svelte = {
	'comment': xmlComment,
	'script': addInlined('script', tagInside, code => {
		return /^[^>]+?[\s"'}]lang\s*=\s*(["'])ts\1/.test(code) ? 'ts' : 'js';
	}),
	'style': addInlined('style', tagInside, code => {
		return /^[^>]+?[\s"'}]lang\s*=\s*(["'])(less|s[ac]ss|stylus)\1/.exec(code)?.[2] || 'css';
	}),
	'block': {
		pattern: re(/\{[#@:/]\w*(?:\s(?:[^{}]|<0>)*)?\}/.source, [braces], 'g'),
		inside: blockInside
	},
	'tag': tag,
	'expression': expression,
	'entity': entity,
	'punctuation': /[()[\]{}]/,
	[tokenize](code, grammar) {
		var lang = /<script\s(?:[^>]*?[\s"'}])?lang\s*=\s*(["'])ts\1/.test(code) ? 'ts' : 'js';

		if (lang != currentLang) {
			expression.alias = 'language-' + lang;

			delete blockInside['language-' + currentLang];
			blockInside['language-' + lang] = blockLang;

			expression.inside = blockLang.inside = currentLang = lang;
		}

		return withoutTokenizer(code, grammar);
	}
};
