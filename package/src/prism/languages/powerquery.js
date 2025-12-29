import { languages } from '../core.js';
import { boolean, clikeComment } from '../utils/patterns.js';

// https://docs.microsoft.com/en-us/powerquery-m/power-query-m-language-specification

languages.mscript = languages.pq = languages.powerquery = {
	'comment': clikeComment,
	'quoted-identifier': /#"(?:[^\n"]|"")*"(?!")/g,
	'string': /(?:#!)?"(?:[^\n"]|"")*"(?!")/g,
	'constant': /\b(?:Day\.(?:Friday|Monday|Saturday|Sunday|Thursday|Tuesday|Wednesday)|TraceLevel\.(?:Critical|Error|Information|Verbose|Warning)|Occurrence\.(?:All|First|Last)|Order\.(?:Ascending|Descending)|RoundingMode\.(?:AwayFromZero|Down|ToEven|TowardZero|Up)|MissingField\.(?:Error|Ignore|UseNull)|QuoteStyle\.(?:Csv|None)|JoinKind\.(?:FullOuter|Inner|LeftAnti|LeftOuter|RightAnti|RightOuter)|GroupKind\.(?:Global|Local)|ExtraValues\.(?:Error|Ignore|List)|JoinAlgorithm\.(?:Dynamic|LeftHash|LeftIndex|PairwiseHash|RightHash|RightIndex|SortMerge)|JoinSide\.(?:Left|Right)|Precision\.(?:Decimal|Double)|RelativePosition\.From(?:End|Start)|TextEncoding\.(?:Ascii|BigEndianUnicode|Unicode|Utf16|Utf8|Windows)|(?:Any|Binary|Date|DateTime|DateTimeZone|Duration|Function|Int16|Int32|Int64|Int8|List|Logical|None|Number|Record|Table|Text|Time)\.Type|null)\b/,
	'boolean': boolean,
	'keyword': /\b(?:and|as|each|else|error|if|in|is|let|meta|not|nullable|optional|or|otherwise|section|shared|then|try|type)\b|#(?:binary|date|datetime|datetimezone|duration|infinity|nan|sections|shared|table|time)\b/,
	'function': {
		pattern: /(^|[^#\w.])[a-z_][\w.]*(?=\s*\()/i,
		lookbehind: true
	},
	'data-type': {
		pattern: /\b(?:any|anynonnull|binary|date|datetime|datetimezone|duration|function|list|logical|none|number|record|table|text|time)\b/,
		alias: 'class-name'
	},
	'number': {
		pattern: /\b0x[a-f\d]+\b|(?:[+-]?(?:\b\d+\.)?\b\d+|[+-]\.\d+|(^|[^.])\B\.\d+)(?:e[+-]?\d+)?\b/i,
		lookbehind: true
	},
	'operator': /<?=>?|<>|>=|[&?@^<>/*+-]|\.{2,3}/,
	'punctuation': /[()[\]{},;]/
};
