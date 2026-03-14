import { getClosestToken } from "../../../utils/index.js"
import { Completion, CompletionSource } from "../types.js"

const tags: Completion[] =
	"abstract,access,alias,argument,async,augments,author,borrows,callback,class,classdesc,constant,constructor,constructs,copyright,default,deprecated,description,emits,enum,event,example,exports,extends,external,field,file,fileoverview,fires,function,generator,global,hideconstructor,host,ignore,implements,import,inheritdoc,inner,instance,interface,kind,lends,license,link,linkcode,linkplain,listens,member,memberof,method,mixes,mixin,module,name,namespace,overload,override,package,param,private,prop,property,protected,public,readonly,requires,returns,satisfies,see,since,static,summary,template,this,throws,todo,tutorial,type,typedef,var,variation,version,virtual,yields"
		.split(",")
		.map(label => ({ label, icon: "keyword" }))

/** Completion source that adds completion of JSDoc tags. */
const jsDocCompletion: CompletionSource = (context, editor) => {
	if (
		getClosestToken(editor, ".doc-comment", 0, 0, context.pos) &&
		/@[a-z]*$/.test(context.lineBefore)
	) {
		return {
			from: context.before.lastIndexOf("@") + 1,
			options: tags,
		}
	}
}

export { jsDocCompletion }
