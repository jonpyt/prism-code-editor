import { languages } from '../core.js';

var guid = {
	// https://en.wikipedia.org/wiki/Universally_unique_identifier#Format
	pattern: /\{[a-f\d]{8}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{12}\}/i,
	alias: 'constant',
	inside: {
		'punctuation': /[{}]/
	}
};

languages['solution-file'] = {
	'comment': /#.*/g,
	'string': {
		pattern: /"[^\n"]*"|'[^\n']*'/g,
		inside: {
			'guid': guid
		}
	},
	'object': {
		// Foo
		//   Bar("abs") = 9
		//   EndBar
		//   Prop = TRUE
		// EndFoo
		pattern: /^([ \t]*)(?:([A-Z]\w*)\b(?=.*\n(?:\1[ \t].*\n)*\1End\2(?=[ \t]*$))|End[A-Z]\w*(?=[ \t]*$))/mg,
		lookbehind: true,
		alias: 'keyword'
	},
	'property': {
		pattern: /^([ \t]*)(?!\s)[^\n"#=()]*[^\s"#=()](?=\s*=)/m,
		lookbehind: true,
		inside: {
			'guid': guid
		}
	},
	'guid': guid,
	'number': /\b\d+(?:\.\d+)*\b/,
	'boolean': /\b(?:FALSE|TRUE)\b/,
	'operator': /=/,
	'punctuation': /[(),]/
};

languages['sln'] = languages['solution-file'];
