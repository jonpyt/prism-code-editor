// Slimmed down Prism core with most high level functions removed

var plainTextGrammar = {};
var rest = Symbol();
var tokenize = Symbol();

/** @param {*} id */
var resolve = id => typeof id == 'string' ? languages[id] : id;

/** @type {Record<string, any>} */
var languages = {
	plain: plainTextGrammar,
	plaintext: plainTextGrammar,
	text: plainTextGrammar,
	txt: plainTextGrammar,
};

/**
 * @param {string} text
 * @param {any} grammar
 */
var tokenizeText = (text, grammar) => (grammar[tokenize] || withoutTokenizer)(text, grammar);

/**
 * @param {string} text
 * @param {any} grammar
 */
var withoutTokenizer = (text, grammar) => {
	/** @type {LinkedListNode} */
	var startNode = [text];
	var restGrammar;
	/** @type {(string | Token)[]} */
	var array = [], i = 0;
	while (restGrammar = resolve(grammar[rest])) {
		delete grammar[rest];
		Object.assign(grammar, restGrammar);
	}

	matchGrammar(text, grammar, startNode, 0);

	while (array[i++] = startNode[0], startNode = startNode[1]);
	return array;
};

/**
 * @param {string} string
 * @param {RegExp} pattern
 * @param {string} replacement
 */
var escapeHtml = (string, pattern, replacement) => {
	return string.replace(/&/g, '&amp;').replace(pattern, replacement);
};

var closingTag = '</span>';
var openingTags = '';
var closingTags = '';

/** @param {(string | Token)[]} tokens */
var highlightTokens = tokens => {
	var str = '', token, i = 0;
	while (token = tokens[i++]) str += stringify(token);
	return str;
};

/**
 * @param {string | Token | (string | Token)[]} token
 * @returns {string}
 */
var stringify = token => {
	if (token instanceof Token) {
		var { type, alias, content } = token;
		var prevOpening = openingTags;
		var prevClosing = closingTags;
		var opening = `<span class="token ${
			type + (alias ? ' ' + alias : '') +
			(type == 'keyword' && typeof content == 'string' ? ' keyword-' + content : '')
		}">`;

		closingTags += closingTag;
		openingTags += opening;
		var contentStr = stringify(content);
		openingTags = prevOpening;
		closingTags = prevClosing;
		return opening + contentStr + closingTag;
	}

	if (typeof token != 'string') return highlightTokens(token);

	token = escapeHtml(token, /</g, '&lt;');
	if (closingTags && token.includes('\n')) {
		return token.replace(/\n/g, closingTags + '\n' + openingTags);
	}
	return token;
};

/**
 * @param {string} text
 * @param {*} ref
 */
var highlightText = (text, ref) => highlightTokens(tokenizeText(text, resolve(ref)));

/**
 * @param {string} text
 * @param {any} grammar
 * @param {LinkedListNode} startNode
 * @param {number} startPos
 * @param {[string, number, number]} [rematch]
 *
 * @typedef {[string | Token, LinkedListNode?]} LinkedListNode
 */
var matchGrammar = (text, grammar, startNode, startPos, rematch) => {
	for (var token in grammar) {
		if (grammar[token]) for (var j = 0, p = grammar[token], patternObj, patterns = Array.isArray(p) ? p : [p]; patternObj = patterns[j]; j++) {
			if (rematch && rematch[0] == token && rematch[1] == j) {
				return;
			}

			/** @type {RegExp} */
			var pattern = patternObj.pattern || patternObj;
			var inside = resolve(patternObj.inside);
			var lookbehind = patternObj.lookbehind;
			var greedy = pattern.global;
			var alias = patternObj.alias;

			for ( // iterate the token list and keep track of the current token/string position
				var currentNode = startNode, pos = startPos;
				currentNode && (!rematch || pos < rematch[2]);
				pos += currentNode[0].length, currentNode = currentNode[1]
			) {
				var str = currentNode[0];
				var removeCount = 0;
				var match;

				if (str instanceof Token) {
					continue;
				}

				pattern.lastIndex = greedy ? pos : 0;
				match = pattern.exec(greedy ? text : str);

				if (!match && greedy) {
					break;
				}

				if (!(match && match[0])) {
					continue;
				}

				// change the match to remove the text matched by the Prism lookbehind group
				var lookbehindLength = lookbehind && match[1] ? match[1].length : 0;
				var from = match.index + lookbehindLength;
				var matchStr = match[0].slice(lookbehindLength);
				var to = from + matchStr.length;
				var k, p;

				if (greedy) {
					// find the node that contains the match
					for (
						;
						p = pos + currentNode[0].length, from >= p;
						currentNode = currentNode[1], pos = p
					);

					// the current node is a Token, then the match starts inside another Token, which is invalid
					if (currentNode[0] instanceof Token) {
						continue;
					}

					// find the last node which is affected by this match
					for (
						k = currentNode, p = pos;
						(p += k[0].length) < to;
						k = k[1], removeCount++
					);

					// replace with the new match
					str = text.slice(pos, p);
					from -= pos;
					to -= pos;
				}

				var after = str.slice(to);
				var reach = pos + str.length;
				var newToken = new Token(token, inside ? tokenizeText(matchStr, inside) : matchStr, matchStr, alias);
				var next = currentNode, i = 0;
				var nestedRematch;

				while (next = next[1], i++ < removeCount);

				if (after) {
					if (!next || next[0] instanceof Token) next = [after, next];
					else next[0] = after + next[0];
				};

				pos += from;
				currentNode[0] = from ? str.slice(0, from) : newToken;

				if (from) currentNode = currentNode[1] = [newToken, next];
				else currentNode[1] = next;

				if (removeCount) {
					// at least one Token object was removed, so we have to do some rematching
					// this can only happen if the current pattern is greedy

					matchGrammar(text, grammar, currentNode, pos, nestedRematch = [token, j, reach]);
					reach = nestedRematch[2];
				}

				if (rematch && reach > rematch[2]) rematch[2] = reach;
			}
		}
	}
};

/**
 * Creates a new token.
 *
 * @param {string} type
 * @param {string | any[]} content
 * @param {string} matchedStr
 * @param {string} alias
 * @class
 */
function Token(type, content, matchedStr, alias) {
	this.type = type;
	this.content = content;
	this.alias = alias;
	this.length = matchedStr.length;
}

export {
	rest,
	tokenize,
	Token,
	languages,
	tokenizeText,
	withoutTokenizer,
	resolve,
	escapeHtml,
	highlightTokens,
	highlightText
};
