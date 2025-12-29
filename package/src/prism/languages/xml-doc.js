import { languages } from '../core.js';
import { insertBefore } from '../utils/language.js';
import './markup.js';

/**
 * If the given language is present, it will insert the given doc comment grammar token into it.
 *
 * @param {string} lang
 * @param {any} docComment
 */
var insertDocComment = (lang, docComment) => {
	if (languages[lang]) {
		insertBefore(languages[lang], 'comment', {
			'doc-comment': docComment
		});
	}
}

var tag = languages.markup.tag;

var slashDocComment = {
	pattern: /\/\/\/.*/g,
	alias: 'comment',
	inside: {
		'tag': tag
	}
};
var tickDocComment = {
	pattern: /'''.*/g,
	alias: 'comment',
	inside: {
		'tag': tag
	}
};

insertDocComment('csharp', slashDocComment);
insertDocComment('fsharp', slashDocComment);
insertDocComment('vbnet', tickDocComment);
