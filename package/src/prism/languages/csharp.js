import { languages } from '../core.js';
import { boolean, clikeComment, dotPunctuation } from '../utils/patterns.js';
import { nested, re, replace } from '../utils/shared.js';

var keywordsToPattern = words => `\\b(?:${words})\\b`;

// https://docs.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/
var typeKeyword = 'bool|char|decimal|double|dynamic|float|object|s?byte|string|u?int|u?long|u?short|var|void'
var typeDeclarationKeyword = 'class|enum|interface|record|struct'
var contextualKeyword = 'add|alias|and|ascending|async|await|by|descending|from(?!\\s*[^\\s\\w])|[gls]et|global|group|into|init(?=\\s*;)|join|nameof|not|notnull|on|or|orderby|partial|remove|select|unmanaged|value|when|where|with(?=\\s*{)'
var otherKeyword = 'abstract|as|[bc]ase|break|catch|checked|const|continue|default|delegate|do|else|event|explicit|extern|finally|fixed|for|foreach|goto|i[fns]|implicit|internal|lock|namespace|new|null|operator|out|override|params|private|protected|public|readonly|ref|return|sealed|sizeof|stackalloc|static|switch|this|throw|try|typeof|unchecked|unsafe|using|virtual|volatile|while|yield'

// keywords
var typeDeclarationKeywords = keywordsToPattern(typeDeclarationKeyword);
var keywords = RegExp(keywordsToPattern(typeKeyword + '|' + typeDeclarationKeyword + '|' + contextualKeyword + '|' + otherKeyword));
var nonTypeKeywords = keywordsToPattern(typeDeclarationKeyword + '|' + contextualKeyword + '|' + otherKeyword);
var nonContextualKeywords = keywordsToPattern(typeKeyword + '|' + typeDeclarationKeyword + '|' + otherKeyword);

// types
var generic = nested(/<(?:[^<>;=*/%&|^+-]|<self>)*>/.source, 2); // the idea behind the other forbidden characters is to prevent false positives. Same for tupleElement.
var nestedRound = nested(/\((?:[^()]|<self>)*\)/.source, 2);
var name = /@?\b(?!\d)\w+\b/.source;
var genericName = replace(/<0>(?:\s*<1>)?/.source, [name, generic]);
var identifier = replace(/(?!<0>)<1>(?:\s*\.\s*<1>)*/.source, [nonTypeKeywords, genericName]);
var array = /\[\s*(?:,\s*)*\]/.source;
var typeExpressionWithoutTuple = replace(/<0>(?:\s*(?:\?\s*)?<1>)*(?:\s*\?)?/.source, [identifier, array]);
var tupleElement = replace(/[^()[\],;%&|^=<>/*+-]|<0>|<1>|<2>/.source, [generic, nestedRound, array]);
var tuple = replace(/\(<0>+(?:,<0>+)+\)/.source, [tupleElement]);
var typeExpression = replace(/(?:<0>|<1>)(?:\s*(?:\?\s*)?<2>)*(?:\s*\?)?/.source, [tuple, identifier, array]);

var typeInside = {
	'keyword': keywords,
	'punctuation': /[()[\].,:<>?]/
};

// strings & characters
// https://docs.microsoft.com/en-us/dotnet/csharp/language-reference/language-specification/lexical-structure#character-literals
// https://docs.microsoft.com/en-us/dotnet/csharp/language-reference/language-specification/lexical-structure#string-literals
var character = /'(?:\\.|[^\n'\\]|\\[Uux][a-fA-F\d]{1,8})'/.source; // simplified pattern
var regularString = /"(?:\\.|[^\\\n"])*"/.source;
var verbatimString = /@"(?:""|\\[\s\S]|[^\\"])*"(?!")/.source;

// attributes
var regularStringOrCharacter = regularString + '|' + character;
var regularStringCharacterOrComment = replace(/\/(?![*/])|\/\/[^\n]*\n|\/\*(?:[^*]|\*(?!\/))*\*\/|<0>/.source, [regularStringOrCharacter]);
var roundExpression = nested(replace(/[^()"'/]|<0>|\(<self>*\)/.source, [regularStringCharacterOrComment]), 2);

// https://docs.microsoft.com/en-us/dotnet/csharp/programming-guide/concepts/attributes/#attribute-targets
var attrTarget = /\b(?:assembly|event|field|method|module|param|property|return|type)\b/.source;
var attr = replace(/<0>(?:\s*\(<1>*\))?/.source, [identifier, roundExpression]);

// string interpolation
var formatString = /:[^\n}]+/.source;
// multi line
var mInterpolationRound = nested(replace(/[^()"'/]|<0>|\(<self>*\)/.source, [regularStringCharacterOrComment]), 2);
var mInterpolation = replace(/\{(?!\{)(?:(?![}:])<0>)*<1>?\}/.source, [mInterpolationRound, formatString]);
// single line
var sInterpolationRound = nested(replace(/[^()"'/]|\/(?!\*)|\/\*(?:[^*]|\*(?!\/))*\*\/|<0>|\(<self>*\)/.source, [regularStringOrCharacter]), 2);
var sInterpolation = replace(/\{(?!\{)(?:(?![}:])<0>)*<1>?\}/.source, [sInterpolationRound, formatString]);

var createInterpolationInside = (interpolation, interpolationRound) => ({
	'interpolation': {
		pattern: re(/((?:^|[^{])(?:\{\{)*)<0>/.source, [interpolation]),
		lookbehind: true,
		inside: {
			'format-string': {
				pattern: re(/(^\{(?:(?![}:])<0>)*)<1>(?=\}$)/.source, [interpolationRound, formatString]),
				lookbehind: true,
				inside: {
					'punctuation': /^:/
				}
			},
			'punctuation': /^\{|\}$/,
			'expression': {
				pattern: /[\s\S]+/,
				alias: 'language-csharp',
				inside: 'cs'
			}
		}
	},
	'string': /[\s\S]+/
});

languages.dotnet = languages.cs = languages.csharp = {
	'comment': clikeComment,
	'interpolation-string': [
		{
			pattern: re(/(^|[^\\])(?:\$@|@\$)"(?:""|\\[\s\S]|\{\{|<0>|[^\\{"])*"/.source, [mInterpolation], 'g'),
			lookbehind: true,
			inside: createInterpolationInside(mInterpolation, mInterpolationRound),
		},
		{
			pattern: re(/(^|[^\\@])\$"(?:\\.|\{\{|<0>|[^\\"{])*"/.source, [sInterpolation], 'g'),
			lookbehind: true,
			inside: createInterpolationInside(sInterpolation, sInterpolationRound),
		}
	],
	'char': RegExp(character, 'g'),
	'string': [
		{
			pattern: re(/(^|[^\\$])<0>/.source, [verbatimString], 'g'),
			lookbehind: true
		},
		{
			pattern: re(/(^|[^\\@$])<0>/.source, [regularString], 'g'),
			lookbehind: true
		}
	],
	'namespace': {
		// namespace Foo.Bar {}
		// using Foo.Bar;
		pattern: re(/(\b(?:namespace|using)\s+)<0>(?:\s*\.\s*<0>)*(?=\s*[;{])/.source, [name]),
		lookbehind: true,
		inside: dotPunctuation
	},
	'type-expression': {
		// default(Foo), typeof(Foo<Bar>), sizeof(int)
		pattern: re(/(\b(?:default|sizeof|typeof)\s*\(\s*(?!\s))(?:[^()\s]|\s(?!\s)|<0>)+(?=\s*\))/.source, [nestedRound]),
		lookbehind: true,
		alias: 'class-name',
		inside: typeInside
	},
	'return-type': {
		// Foo<Bar> ForBar(); Foo IFoo.Bar() => 0
		// int this[int index] => 0; T IReadOnlyList<T>.this[int index] => this[index];
		// int Foo => 0; int Foo { get; set } = 0;
		pattern: re(/<0>(?=\s+(?:<1>\s*(?:=>|[({]|\.\s*this\s*\[)|this\s*\[))/.source, [typeExpression, identifier]),
		alias: 'class-name',
		inside: typeInside
	},
	'constructor-invocation': {
		// new List<Foo<Bar[]>> { }
		pattern: re(/(\bnew\s+)<0>(?=\s*[[({])/.source, [typeExpression]),
		lookbehind: true,
		alias: 'class-name',
		inside: typeInside
	},
	/*'explicit-implementation': {
		// int IFoo<Foo>.Bar => 0; void IFoo<Foo<Foo>>.Foo<T>();
		pattern: replace(/\b<0>(?=\.<1>)/, className, methodOrPropertyDeclaration),
		inside: classNameInside,
		alias: 'class-name'
	},*/
	'generic-method': {
		// foo<Bar>()
		pattern: re(/<0>\s*<1>(?=\s*\()/.source, [name, generic]),
		inside: {
			'function': re(/^<0>/.source, [name]),
			'generic': {
				pattern: RegExp(generic),
				alias: 'class-name',
				inside: typeInside
			}
		}
	},
	'type-list': {
		// The list of types inherited or of generic constraints
		// class Foo<F> : Bar, IList<FooBar>
		// where F : Bar, IList<int>
		pattern: re(
			/\b((?:<0>\s+<1>|record\s+<1>\s*<5>|where\s+<2>)\s*:\s*)(?:<3>|<4>|<1>\s*<5>|<6>)(?:\s*,\s*(?:<3>|<4>|<6>))*(?=\s*(?:where|[{;]|=>|$))/.source,
			[typeDeclarationKeywords, genericName, name, typeExpression, keywords.source, nestedRound, /\bnew\s*\(\s*\)/.source]
		),
		lookbehind: true,
		inside: {
			'record-arguments': {
				pattern: re(/(^(?!new\s*\()<0>\s*)<1>/.source, [genericName, nestedRound], 'g'),
				lookbehind: true,
				inside: 'cs'
			},
			'keyword': keywords,
			'class-name': {
				pattern: RegExp(typeExpression, 'g'),
				inside: typeInside
			},
			'punctuation': /[(),]/
		}
	},
	'preprocessor': {
		pattern: /(^[ \t]*)#.*/m,
		lookbehind: true,
		alias: 'property',
		inside: {
			// highlight preprocessor directives as keywords
			'directive': {
				pattern: /(#)\b(?:define|elif|else|endif|endregion|error|if|line|nullable|pragma|region|undef|warning)\b/,
				lookbehind: true,
				alias: 'keyword'
			}
		}
	},
	'attribute': {
		// Attributes
		// [Foo], [Foo(1), Bar(2, Prop = "foo")], [return: Foo(1), Bar(2)], [assembly: Foo(Bar)]
		pattern: re(/((?:^|[^\s\w>)?])\s*\[\s*)(?:<0>\s*:\s*)?<1>(?:\s*,\s*<1>)*(?=\s*\])/.source, [attrTarget, attr], 'g'),
		lookbehind: true,
		inside: {
			'target': {
				pattern: re(/^<0>(?=\s*:)/.source, [attrTarget]),
				alias: 'keyword'
			},
			'attribute-arguments': {
				pattern: re(/\(<0>*\)/.source, [roundExpression]),
				inside: 'cs'
			},
			'class-name': {
				pattern: RegExp(identifier),
				inside: dotPunctuation
			},
			'punctuation': /[,:]/
		}
	},
	'class-name': [
		{
			// Using static
			// using static System.Math;
			pattern: re(/(\busing\s+static\s+)<0>(?=\s*;)/.source, [identifier]),
			lookbehind: true,
			inside: typeInside
		},
		{
			// Using alias (type)
			// using Project = PC.MyCompany.Project;
			pattern: re(/(\busing\s+<0>\s*=\s*)<1>(?=\s*;)/.source, [name, typeExpression]),
			lookbehind: true,
			inside: typeInside
		},
		{
			// Using alias (alias)
			// using Project = PC.MyCompany.Project;
			pattern: re(/(\busing\s+)<0>(?=\s*=)/.source, [name]),
			lookbehind: true
		},
		{
			// Type declarations
			// class Foo<A, B>
			// interface Foo<out A, B>
			pattern: re(/(\b<0>\s+)<1>/.source, [typeDeclarationKeywords, genericName]),
			lookbehind: true,
			inside: typeInside
		},
		{
			// Single catch exception declaration
			// catch(Foo)
			// (things like catch(Foo e) is covered by variable declaration)
			pattern: re(/(\bcatch\s*\(\s*)<0>/.source, [identifier]),
			lookbehind: true,
			inside: typeInside
		},
		{
			// Name of the type parameter of generic constraints
			// where Foo : class
			pattern: re(/(\bwhere\s+)<0>/.source, [name]),
			lookbehind: true
		},
		{
			// Casts and checks via as and is.
			// as Foo<A>, is Bar<B>
			// (things like if(a is Foo b) is covered by variable declaration)
			pattern: re(/(\b(?:is(?:\s+not)?|as)\s+)<0>/.source, [typeExpressionWithoutTuple]),
			lookbehind: true,
			inside: typeInside
		},
		{
			// Variable, field and parameter declaration
			// (Foo bar, Bar baz, Foo[,,] bay, Foo<Bar, FooBar<Bar>> bax)
			pattern: re(/\b<0>(?=\s+(?!<1>|with\s*\{)<2>(?:\s*[=,:;{)\]]|\s+(?:in|when)\b))/.source, [typeExpression, nonContextualKeywords, name]),
			inside: typeInside
		}
	],
	'keyword': keywords,
	'boolean': boolean,
	'function': /\b\w+(?=\()/,
	'range': {
		pattern: /\.\./,
		alias: 'operator'
	},
	// https://docs.microsoft.com/en-us/dotnet/csharp/language-reference/language-specification/lexical-structure#literals
	'number': /(?:\b0(?:x[a-f\d_]*[a-f\d]|b[01_]*[01])|(?:\B\.\d+(?:_+\d+)*|\b\d+(?:_+\d+)*(?:\.\d+(?:_+\d+)*)?)(?:e[+-]?\d+(?:_+\d+)*)?)(?:[dflmu]|lu|ul)?\b/i,
	'operator': /[=-]>|([&|+-])\1|~|\?\?=?|>>=?|<<=?|[%&|^!=<>/*+-]=?/,
	'named-parameter': {
		pattern: re(/([(,]\s*)<0>(?=\s*:)/.source, [name]),
		lookbehind: true,
		alias: 'punctuation'
	},
	'punctuation': /\?\.?|::|[()[\]{}.,:;]/
};
