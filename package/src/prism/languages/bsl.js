import { languages } from '../core.js';
import { re } from '../utils/shared.js';

var charClass = ['\\w\u0400-\u0484\u0487-\u052f\u1d2b\u1d78\u2de0-\u2dff\ua640-\ua69f\ufe2e\ufe2f'];

/* eslint-disable no-misleading-character-class */

// 1C:Enterprise
// https://github.com/Diversus23/
//
languages.oscript = languages.bsl = {
	'comment': /\/\/.*/,
	'string': /"(?:[^"]|"")*"(?!")|'(?:\\.|[^\n\\'])*'/g,
	'keyword': {
		pattern: re(/(^|[^<0>])(?:пока|для|новый|прервать|попытка|исключение|вызватьисключение|иначе|конецпопытки|неопределено|функция|перем|возврат|конецфункции|если|иначеесли|процедура|конецпроцедуры|тогда|знач|экспорт|конецесли|из|каждого|истина|ложь|по|цикл|конеццикла|выполнить)(?![<0>])|\b(?:break|do|each|else|elseif|enddo|endfunction|endif|endprocedure|endtry|except|execute|export|false|true|for|function|if|in|new|null|procedure|raise|return|then|to|try|undefined|val|var|while)\b/.source, charClass, 'i'),
		lookbehind: true
	},
	'number': {
		pattern: re(/(^(?=\d)|[^<0>])(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?/.source, charClass, 'i'),
		lookbehind: true
	},
	'operator': {
		pattern: re(/[<>*/+-]=?|[%=]|\b(?:and|not|or)\b|(^|[^<0>])(?:и|или|не)(?![\w<0>])/.source, charClass, 'i'),
		lookbehind: true
	},
	'punctuation': /\(\.|\.\)|[()[\].,:;]/,
	// Теги препроцессора вида &Клиент, &Сервер, ...
	// Preprocessor tags of the type &Client, &Server, ...
	// Инструкции препроцессора вида:
	// #Если Сервер Тогда
	// ...
	// #КонецЕсли
	// Preprocessor instructions of the form:
	// #If Server Then
	// ...
	// #EndIf
	'directive': {
		pattern: /^([ \t]*)[&#].*/gm,
		lookbehind: true,
		alias: 'important'
	}
};
