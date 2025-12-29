import { languages } from '../core.js';
import { re } from '../utils/shared.js';

var comment = {
	pattern: /(^[ \t]*|  |\t)#.*/mg,
	lookbehind: true
};

var variable = {
	pattern: /((?:^|[^\\])(?:\\\\)*)[$@&%]\{(?:[^{}\n]|\{[^{}\n]*\})*\}/,
	lookbehind: true,
	inside: {
		'punctuation': /^[$@&%]\{|\}$/
	}
};

var createSection = (name, inside) => {
	var extendecInside = {};

	extendecInside['section-header'] = {
		pattern: /^ ?\*{3}.+?\*{3}/,
		alias: 'keyword'
	};

	Object.assign(extendecInside, inside)

	extendecInside['tag'] = {
		pattern: /(\n(?:  |\t)[ \t]*)\[[-\w]+\]/,
		lookbehind: true,
		inside: {
			'punctuation': /[[\]]/
		}
	};
	extendecInside['variable'] = variable;
	extendecInside['comment'] = comment;

	return {
		pattern: re(/^ ?\*{3}[ \t]*<0>[ \t]*\*{3}(?:.|\n(?!\*{3}))*/.source, [name], 'im'),
		alias: 'section',
		inside: extendecInside
	};
}


var docTag = {
	pattern: /(\[Documentation\](?:  |\t)[ \t]*)(?![ \t]|#)(?:.|\n[ \t]*\.{3})+/,
	lookbehind: true,
	alias: 'string'
};

var testNameLike = {
	pattern: /(\n ?)(?!#)(?:\S(?:[ \t]\S)*)+/,
	lookbehind: true,
	alias: 'function',
	inside: {
		'variable': variable
	}
};

var testPropertyLike = {
	pattern: /(\n(?: |\t)[ \t]*)(?!\[|\.{3}|#)(?:\S(?:[ \t]\S)*)+/,
	lookbehind: true,
	inside: {
		'variable': variable
	}
};

languages.robot = languages.robotframework = {
	'settings': createSection('Settings', {
		'documentation': {
			pattern: /(\n ?Documentation(?:  |\t)[ \t]*)(?![ \t]|#)(?:.|\n[ \t]*\.{3})+/,
			lookbehind: true,
			alias: 'string'
		},
		'property': {
			pattern: /(\n ?)(?!\.{3}|#)(?:\S(?:[ \t]\S)*)+/,
			lookbehind: true
		}
	}),
	'variables': createSection('Variables'),
	'test-cases': createSection('Test Cases', {
		'test-name': testNameLike,
		'documentation': docTag,
		'property': testPropertyLike
	}),
	'keywords': createSection('Keywords', {
		'keyword-name': testNameLike,
		'documentation': docTag,
		'property': testPropertyLike
	}),
	'tasks': createSection('Tasks', {
		'task-name': testNameLike,
		'documentation': docTag,
		'property': testPropertyLike
	}),
	'comment': comment
};
