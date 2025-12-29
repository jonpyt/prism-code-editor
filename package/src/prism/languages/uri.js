import { languages } from '../core.js';

// https://tools.ietf.org/html/rfc3986#appendix-A

languages.url = languages.uri = {
	'scheme': {
		pattern: /^[a-z][a-z\d+.-]*:/img,
		inside: {
			'scheme-delimiter': /:$/
		}
	},
	'fragment': {
		pattern: /#[\w.~!$&'()*,;=%:@/?+-]*/,
		inside: {
			'fragment-delimiter': /^#/
		}
	},
	'query': {
		pattern: /\?[\w.~!$&'()*,;=%:@/?+-]*/,
		inside: {
			'query-delimiter': {
				pattern: /^\?/g
			},
			'pair-delimiter': /[&;]/,
			'pair': {
				pattern: /^[^=][\s\S]*/,
				inside: {
					'key': /^[^=]+/,
					'value': {
						pattern: /(^=)[\s\S]+/,
						lookbehind: true
					}
				}
			}
		}
	},
	'authority': {
		pattern: /^\/\/(?:[\w.~!$&'()*,;=%:+-]*@)?(?:\[(?:[a-fA-F\d:.]{2,48}|v[a-fA-F\d]+\.[\w.~!$&'()*,;=+-]+)\]|[\w.~!$&'()*,;=%+-]*)(?::\d*)?/m,
		inside: {
			'authority-delimiter': /^\/\//,
			'user-info-segment': {
				pattern: /^[\w.~!$&'()*,;=%:+-]*@/,
				inside: {
					'user-info-delimiter': /@$/,
					'user-info': /^[\w.~!$&'()*,;=%:+-]+/
				}
			},
			'port-segment': {
				pattern: /:\d*$/,
				inside: {
					'port-delimiter': /^:/,
					'port': /^\d+/
				}
			},
			'host': {
				pattern: /[\s\S]+/,
				inside: {
					'ip-literal': {
						pattern: /^\[[\s\S]+\]$/,
						inside: {
							'ip-literal-delimiter': /^\[|\]$/,
							'ipv-future': /^v[\s\S]+/,
							'ipv6-address': /^[\s\S]+/
						}
					},
					'ipv4-address': /^(?:(?:[03-9]\d?|[12]\d{0,2})\.){3}(?:[03-9]\d?|[12]\d{0,2})$/
				}
			}
		}
	},
	'path': {
		pattern: /^[\w.~!$&'()*,;=%:@/+-]+/m,
		inside: {
			'path-separator': /\//
		}
	}
};
