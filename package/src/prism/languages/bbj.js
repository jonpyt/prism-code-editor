import { languages } from '../core.js';

languages.bbj = {
	'comment': {
		pattern: /(^|[^\\:])rem\s+.*/i,
		lookbehind: true
	},
	'string': /(["'])(?:\\.|(?!\1)[^\\\n])*\1/g,
	'number': /(?:\b\d+(?:\.\d*)?|\B\.\d+)(?:e[+-]?\d+)?/i,
	'keyword': /\b(?:abstract|all|argc|begin|bye|callback|case|chn|class|classend|ctl|day|declare|delete|dim|dom|dread|dsz|else|end|endif|err|exitto|extends|fi|field|for|from|gosub|goto|if|implements|interface|interfaceend|iol|iolist|let|list|load|method|methodend|methodret|on|opts|pfx|print|private|process_events|protected|psz|public|read|read_resource|release|remove_callback|repeat|restore|return|rev|seterr|setesc|sqlchn|sqlunt|ssn|start|static|s?wend|switch|sys|then|tim|unt|until|use|void|where|while)\b/i,
	'function': /\b\w+(?=\()/,
	'boolean': /\bbbjapi\.(?:false|true)\b/i,
	'operator': /<[=>]?|>=?|[&^=/*+-]|\b(?:and|not|x?or)\b/i,
	'punctuation': /[.,:;()]/
};
