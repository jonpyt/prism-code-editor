import { CustomTokenizer, Grammar } from "../types.js"

/**
 * Custom tokenizer for languages that are embedded in another language.
 * 
 * This works by first tokenizing everything using the grammar of the embedded language.
 * Then, all tokens whose name doesn't start with `ignore` are replaced with whitespace
 * of the same length. This new string is then tokenized using `hostGrammar`, and all the
 * replaced tokens are inserted into the new token stream.
 * 
 * @param hostGrammar The grammar this language is embedded in. Can either be a grammar object
 * or the name of a grammar.
 */
export declare const embeddedIn: (hostGrammar: Grammar | string) => CustomTokenizer
