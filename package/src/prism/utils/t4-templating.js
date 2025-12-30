var createBlock = (prefix, insideLang) => ({
	pattern: RegExp(`<#${prefix}[\\s\\S]*?#>`),
	alias: 'block',
	inside: {
		'delimiter': {
			pattern: RegExp(`^<#${prefix}|#>$`),
			alias: 'important'
		},
		'content': {
			pattern: /[\s\S]+/,
			alias: typeof insideLang == 'string' ? 'language-' + insideLang : undefined,
			inside: insideLang
		}
	}
})

var createT4 = insideLang => ({
	'block': {
		pattern: /<#[\s\S]+?#>/,
		inside: {
			'directive': createBlock('@', {
				'attr-value': {
					pattern: /=(?:(["'])(?:\\[\s\S]|(?!\1)[^\\])*\1|[^\s"'=>]+)/,
					inside: {
						'punctuation': /^=["']?|["']$/g
					}
				},
				'keyword': /\b\w+(?=\s)/,
				'attr-name': /\w+/
			}),
			'expression': createBlock('=', insideLang),
			'class-feature': createBlock('\\+', insideLang),
			'standard': createBlock('', insideLang)
		}
	}
});

export { createT4 };
