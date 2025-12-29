import { languages } from '../core.js';
import './yaml.js';

// https://en.wikipedia.org/wiki/Test_Anything_Protocol

languages.tap = {
	'fail': /not ok[^#{\n]*/,
	'pass': /ok[^#{\n]*/,
	'pragma': /pragma [+-][a-z]+/,
	'bailout': /bail out!.*/i,
	'version': /tap version \d+/i,
	'plan': /\b\d+\.\.\d+(?: +#.*)?/,
	'subtest': /# Subtest(?:: .*)?/g,
	'punctuation': /[{}]/,
	'directive': /#.*/,
	'yamlish': {
		pattern: /(^[ \t]*)---[\s\S]*?\n[ \t]*\.{3}$/m,
		lookbehind: true,
		alias: 'language-yaml',
		inside: languages.yaml
	}
};
