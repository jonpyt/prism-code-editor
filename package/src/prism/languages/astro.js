import { languages } from '../core.js';
import { braces } from '../utils/jsx-shared.js';
import { addInlined, astroTag } from '../utils/markup-shared.js';
import { re } from '../utils/shared.js';
import { xmlComment, entity } from '../utils/xml-shared.js';

var expression = {
	pattern: RegExp(braces, 'g'),
	alias: 'language-tsx',
	inside: 'tsx'
};

var tag = astroTag(expression);

var tagInside = tag.inside;

var astro = languages.astro = {
	'comment': xmlComment,
	'front-matter-block': {
		pattern: /^---(?!.)[\s\S]*?\n---/g,
		inside: {
			'punctuation': /^---|---$/,
			'language-typescript': {
				pattern: /[\s\S]+/,
				inside: 'ts'
			}
		}
	},
	'script': addInlined('script', tagInside, code => {
		return /^[^>]+?[\s"'}]is:inline\b/.test(code) ? 'javascript' : 'typescript';
	}),
	'style': addInlined('style', tagInside, code => {
		return /^[^>]+?[\s"'}]lang\s*=\s*(["']?)(less|s[ac]ss|stylus)\b\1/.exec(code)?.[2] || 'css';
	}),
	'expression': expression,
	'tag': tag,
	'entity': entity
};
