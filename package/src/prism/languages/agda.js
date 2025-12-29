import { languages } from '../core.js';

languages.agda = {
	'comment': /\{-[\s\S]*?(?:-\}|$)|--.*/,
	'string': {
		pattern: /"(?:\\[\s\S]|[^\\\n"])*"/g,
	},
	'punctuation': /[(){}⦃⦄.;@]/,
	'class-name': {
		pattern: /((?:data|record) +)\S+/,
		lookbehind: true,
	},
	'function': {
		pattern: /(^[ \t]*)(?!\s)[^\n:]+(?=:)/m,
		lookbehind: true,
	},
	'operator': {
		pattern: /(^|\s)(?:[=|:∀→λ\\?_]|->)(?!\S)/,
		lookbehind: true,
	},
	'keyword': /\b(?:Set|abstract|constructor|data|eta-equality|field|forall|hiding|import|in|inductive|infix[lr]?|instance|let|macro|module|mutual|no-eta-equality|open|overlap|pattern|postulate|primitive|private|public|quote|quoteContext|quoteGoal|quoteTerm|record|renaming|rewrite|syntax|tactic|unquote|unquoteDecl|unquoteDef|using|variable|where|with)\b/,
};
