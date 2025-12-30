import { languages } from '../core.js';

languages.shortcode = languages.bbcode = {
	'tag': {
		pattern: /\[\/?[^\s=\]]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'\]=]+))?(?:\s+[^\s=\]]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'\]=]+))*\s*\]/,
		inside: {
			'punctuation': /^\[\/?|\]$/g,
			'attr-value': {
				pattern: /(=\s*)(?:"[^"]*"|'[^']*'|\S+)/,
				lookbehind: true,
				inside: {
					'punctuation': /^["']|["']$/g,
				}
			},
			'attr-equals': /=/,
			'tag': /^\S+/,
			'attr-name': /\S+/
		}
	}
};
