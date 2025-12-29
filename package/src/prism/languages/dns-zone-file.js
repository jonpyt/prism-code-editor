import { languages } from '../core.js';

languages['dns-zone'] = languages['dns-zone-file'] = {
	'comment': /;.*/,
	'string': /"(?:\\.|[^\\\n"])*"/g,
	'variable': [
		{
			pattern: /(^\$ORIGIN[ \t]+)\S+/m,
			lookbehind: true
		},
		{
			pattern: /(^|\s)@(?!\S)/,
			lookbehind: true
		}
	],
	'keyword': /^\$(?:INCLUDE|ORIGIN|TTL)(?!\S)/m,
	'class': {
		// https://tools.ietf.org/html/rfc1035#page-13
		pattern: /(^|\s)(?:CH|CS|HS|IN)(?!\S)/,
		lookbehind: true,
		alias: 'keyword'
	},
	'type': {
		// https://en.wikipedia.org/wiki/List_of_DNS_record_types
		pattern: /(^|\s)(?:A6?|AAAA|AFSDB|APL|ATMA|CAA|C?DNSKEY|C?DS|CERT|[CD]NAME|DHCID|DLV|[EGU]ID|GPOS|[HMNU]INFO|HIP|IPSECKEY|ISDN|[RT]?KEY|KX|LOC|MAIL[AB]|M[BDFGRX]|NAPTR|NB|NBSTAT|NIMLOC|NS|NSAP|NSAP-PTR|NSEC3?|NSEC3PARAM|NULL|[NT]XT|OPENPGPKEY|PTR|PX|RP|RRSIG|RT|SINK|SMIMEA|SOA|SPF|SRV|SSHFP|TA|TLSA|T?SIG|UNSPEC|URI|WKS|X25)(?!\S)/,
		lookbehind: true,
		alias: 'keyword'
	},
	'punctuation': /[()]/
};
