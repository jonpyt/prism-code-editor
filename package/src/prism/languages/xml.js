import { languages } from '../core.js';
import { xmlComment, entity, tag } from '../utils/xml-shared.js';

languages.rss = languages.atom = languages.ssml = languages.xml = {
	'comment': xmlComment,
	'prolog': /<\?[\s\S]+?\?>/g,
	'doctype': {
		// https://www.w3.org/TR/xml/#NT-doctypedecl
		pattern: /<!DOCTYPE(?:[^>"'[\]]|"[^"]*"|'[^']*')+(?:\[(?:[^<"'\]]|"[^"]*"|'[^']*'|<(?!!--)|<!--(?:[^-]|-(?!->))*-->)*\]\s*)?>/gi,
		inside: {
			'internal-subset': {
				pattern: /(\[)[\s\S]+(?=\]\s*>$)/,
				lookbehind: true,
				inside: 'xml'
			},
			'string': /"[^"]*"|'[^']*'/,
			'punctuation': /^<!|[>[\]]/,
			'doctype-tag': /^DOCTYPE/i,
			'name': /\S+/
		}
	},
	'cdata': /<!\[CDATA\[[\s\S]*?\]\]>/gi,
	'tag': tag,
	'entity': entity,
	'markup-bracket': {
		pattern: /[()[\]{}]/,
		alias: 'punctuation'
	}
};
