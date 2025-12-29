import { languages } from '../core.js';
import './bash.js';

// CAREFUL!
// The following patterns are concatenated, so the group referenced by a back reference is non-obvious!

languages['sh-session'] = languages.shellsession = languages['shell-session'] = {
	'command': {
		pattern: /^(?:[^\s@:$#%*!/\\]+@[^\n@:$#%*!/\\]+(?::[^\0-\x1f$#%*?"<>:;|]+)?|[/~.][^\0-\x1f$#%*?"<>@:;|]*)?[$#%](?=\s)(?:[^\\\n \t"'<$]|[ \t](?:(?!#)|#.*$)|\\[\s\S]|\$(?!')|<(?!<)|"(?:\\[\s\S]|\$\([^)]+\)|\$(?!\()|`[^`]+`|[^\\"`$])*"|'[^']*'|\$'(?:\\[\s\S]|[^\\'])*'|<<-?\s*(["']?)(\w+)\1\s[\s\S]*?\n\2)+/mg,
		inside: {
			'info': {
				// foo@bar:~/files$ exit
				// foo@bar$ exit
				// ~/files$ exit
				pattern: /^[^#$%]+/,
				alias: 'punctuation',
				inside: {
					'user': /^[^\s@:$#%*!/\\]+@[^\n@:$#%*!/\\]+/,
					'punctuation': /:/,
					'path': /[\s\S]+/
				}
			},
			'bash': {
				pattern: /(^[$#%]\s*)\S[\s\S]*/,
				lookbehind: true,
				alias: 'language-bash',
				inside: languages.bash
			},
			'shell-symbol': {
				pattern: /^[$#%]/,
				alias: 'important'
			}
		}
	},
	'output': /.(?:.*(?:\n|.$))*/
};
