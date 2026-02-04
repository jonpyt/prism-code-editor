var entity = [
	{
		pattern: /&[a-z\d]{1,8};/i,
		alias: 'named-entity'
	},
	/&#x?[a-f\d]{1,8};/i
];

var xmlComment = /<!--(?:(?!<!--)[\s\S])*?-->/g;

var tag = {
	pattern: /<\/?(?!\d)[^\s/=>$<%]+(?:\s(?:\s*[^\s/=>]+(?:\s*=\s*(?!\s)(?:"[^"]*"|'[^']*'|[^\s"'=>]+(?=[\s>]))?|(?=[\s/>])))+)?\s*\/?>/g,
	inside: {
		'punctuation': /^<\/?|\/?>$/,
		'tag': {
			pattern: /^\S+/,
			inside: {
				'namespace': /^[^:]+:/
			}
		},
		'attr-value': [{
			pattern: /(=\s*)(?:"[^"]*"|'[^']*'|[^\s"'>]+)/g,
			lookbehind: true,
			inside: {
				'punctuation': /^["']|["']$/g,
				entity
			}
		}],
		'attr-equals': /=/,
		'attr-name': {
			pattern: /\S+/,
			inside: {
				'namespace': /^[^:]+:/
			}
		}
	}
};

export { entity, tag, xmlComment }
