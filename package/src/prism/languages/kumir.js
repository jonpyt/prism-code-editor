import { languages } from '../core.js';
import { re } from '../utils/shared.js';

/** Regular expression for characters that are not allowed in identifiers. */
var nonId = ['\\s\0-\x1f"-/:-?[-^`{-~'];

languages.kum = languages.kumir = {
	'comment': /\|.*/,

	'prolog': /#.*/g,

	'string': /"[^\n"]*"|'[^\n']*'/g,

	'boolean': {
		pattern: re(/(^|[<0>])(?:да|нет)(?![^<0>])/.source, nonId),
		lookbehind: true
	},

	'operator-word': {
		pattern: re(/(^|[<0>])(?:и|или|не)(?![^<0>])/.source, nonId),
		lookbehind: true,
		alias: 'keyword'
	},

	'system-variable': {
		pattern: re(/(^|[<0>])знач(?![^<0>])/.source, nonId),
		lookbehind: true,
		alias: 'keyword'
	},

	'type': [
		{
			pattern: re(/(^|[<0>])(?:вещ|лит|лог|сим|цел)(?: *таб)?(?![^<0>])/.source, nonId),
			lookbehind: true,
			alias: 'builtin'
		},
		{
			pattern: re(/(^|[<0>])(?:компл|сканкод|файл|цвет)(?![^<0>])/.source, nonId),
			lookbehind: true,
			alias: 'important'
		}
	],

	/**
	 * Should be performed after searching for type names because of "таб".
	 * "таб" is a reserved word, but never used without a preceding type name.
	 * "НАЗНАЧИТЬ", "Фввод", and "Фвывод" are not reserved words.
	 */
	'keyword': {
		pattern: re(/(^|[<0>])(?:алг|арг(?: *рез)?|ввод|ВКЛЮЧИТЬ|вс[её]|выбор|вывод|выход|дано|для|до|дс|если|иначе|исп|использовать|кон(?:(?: +|_)исп)?|кц(?:(?: +|_)при)?|надо|нач|нс|нц|от|пауза|пока|при|раза?|рез|стоп|таб|то|утв|шаг)(?![^<0>])/.source, nonId),
		lookbehind: true
	},

	/** Should be performed after searching for reserved words. */
	'name': {
		// eslint-disable-next-line regexp/no-super-linear-backtracking
		pattern: re(/(^|[<0>])[^\d<0>][^<0>]*(?: +[^<0>]+)*(?![^<0>])/.source, nonId),
		lookbehind: true
	},

	/** Should be performed after searching for names. */
	'number': {
		pattern: re(/(^|[<0>])(?:\B\$[a-f\d]+\b|(?:\b\d+(?:\.\d*)?|\B\.\d+)(?:e[+-]?\d+)?)(?![^<0>])/.source, nonId, 'i'),
		lookbehind: true
	},

	/** Should be performed after searching for words. */
	'punctuation': /:=|[()[\],:;]/,

	/**
	 * Should be performed after searching for
	 * - numeric constants (because of "+" and "-");
	 * - punctuation marks (because of ":=" and "=").
	 */
	'operator-char': {
		pattern: /\*\*?|<>|>=?|<=?|[=/+-]/,
		alias: 'operator'
	}
};
