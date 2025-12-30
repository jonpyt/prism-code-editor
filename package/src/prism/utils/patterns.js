var clikeComment = /\/\/.*|\/\*[\s\S]*?(?:\*\/|$)/g;

var clikeString = /(["'])(?:\\[\s\S]|(?!\1)[^\\\n])*\1/g;

var clikeNumber = /\b0x[a-f\d]+\b|(?:\b\d+(?:\.\d*)?|\B\.\d+)(?:e[+-]?\d+)?/i;

var clikePunctuation = /[()[\]{}.,:;]/;

var boolean = /\b(?:false|true)\b/;

var dotPunctuation = {
	'punctuation': /\./
};

export { clikeComment, clikeString, clikeNumber, clikePunctuation, boolean, dotPunctuation }
