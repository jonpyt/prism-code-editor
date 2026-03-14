import { AttributeConfig, TagConfig } from "../types.js"
import { ariaAttributes, attrValueB, htmlEventHandlers } from "./data.js"

const globalMathMLAttributes: AttributeConfig = {
	...ariaAttributes,
	...htmlEventHandlers,
	autofocus: null,
	class: null,
	dir: ["ltr", "rtl"],
	displaystyle: attrValueB,
	id: null,
	mathbackground: null,
	mathcolor: null,
	mathsize: null,
	nonce: null,
	scriptlevel: null,
	style: null,
	tabindex: null,
}

const mathMLTags: TagConfig = {
	annotation: {
		encoding: null,
		src: null,
	},
	"annotation-xml": {
		encoding: null,
		src: null,
	},
	maction: {},
	math: {
		display: ["block", "inline"],
	},
	merror: {},
	mfrac: {
		linetickness: null,
	},
	mi: {},
	mmultiscripts: {},
	mn: {},
	mo: {
		accent: attrValueB,
		fence: attrValueB,
		form: ["prefix", "infix", "postfix"],
		largeop: attrValueB,
		lspace: null,
		maxsize: null,
		minsize: null,
		movablelimits: attrValueB,
		rspace: null,
		separator: attrValueB,
		stretchy: attrValueB,
		symmetric: attrValueB,
	},
	mover: {
		accent: attrValueB,
	},
	mpadded: {
		depth: null,
		height: null,
		lspace: null,
		voffset: null,
		width: null,
	},
	mphantom: {},
	mprescripts: {},
	mroot: {},
	mrow: {},
	ms: {},
	mspace: {
		depth: null,
		height: null,
		width: null,
	},
	msqrt: {},
	mstyle: {},
	msub: {},
	msubsup: {},
	msup: {},
	mtable: {},
	mtd: {
		columnspan: null,
		rowspan: null,
	},
	mtext: {},
	mtr: {},
	munder: {
		accentunder: attrValueB,
	},
	munderover: {
		accent: attrValueB,
		accentunder: attrValueB,
	},
	semantics: {},
}

export { globalMathMLAttributes, mathMLTags }
