import { tokenizeText, Token, resolve, withoutTokenizer } from "../core.js";

var embeddedIn = hostGrammar => (code, templateGrammar) => {
	var host = resolve(hostGrammar);
	var hostCode = '';
	var tokenStack = [];
	var stackLength = 0;
	var templateTokens = withoutTokenizer(code, templateGrammar);
	var token;
	var i = 0
	var j = 0;
	var position = 0;

	/** @param {(string | Token)[]} tokens */
	var walkTokens = tokens => {
		var result = [];
		var token;
		var i = 0;
		while (token = tokens[i++]) {
			var content = token.content;
			var omit = false;

			if (j < stackLength) {
				if (Array.isArray(content)) {
					token.content = walkTokens(content);
				} else {
					var length = token.length;
					var replacement = content ? [] : result;
					var old = j;
					var pos = position;
					var offset, t;
					position += length;

					while ([offset, t] = tokenStack[j], offset < position) {
						if (pos < offset) replacement.push(hostCode.slice(pos, offset));
						pos = offset + t.length;
						replacement.push(t);
						if (++j == stackLength) break;
					}

					if (j > old) {
						if (pos < position) replacement.push(hostCode.slice(pos, position));
						if (content) token.content = replacement;
						else omit = true;
					}
				}
			}
			if (!omit) result.push(token);
		}
		return result;
	}

	while (token = templateTokens[i++]) {
		var length = token.length;
		var type = token.type;
		if (type && type.slice(0, 6) != 'ignore') {
			tokenStack[stackLength++] = [position, token];
			hostCode += ' '.repeat(length);
		}
		else {
			hostCode += code.slice(position, position + length);
		}
		position += length;
	}

	position = 0;

	return walkTokens(host ? tokenizeText(hostCode, host) : [hostCode]);
}

export { embeddedIn }
