import {DefaultHandler,Parser} from "htmlparser";
import * as fs from "fs";

namespace ComponentGenerator{

    var AtomEvaluator = {
        
            ecache: {},
        
            becache: {},
        
            parse: function (txt) {
        
                // http://jsfiddle.net/A3vg6/44/ (recommended)
                // http://jsfiddle.net/A3vg6/45/ (working)
                // http://jsfiddle.net/A3vg6/51/ (including $ sign)
        
                var be = this.becache[txt];
                if (be)
                    return be;
        
                var regex = /(?:(\$)(window|viewModel|appScope|scope|data|owner|localScope))(?:\.[a-zA-Z_][a-zA-Z_0-9]*)*/gi;
        
                var keywords = /(window|viewModel|appScope|scope|data|owner|localScope)/gi;
        
                var path = [];
                var vars = [];
        
                var found = {};
        
                var ms = txt.replace(regex,
                    function (match) {
                        var nv = "v" + (path.length + 1);
                        if (match.indexOf("$owner.") == 0) {
                            match = match.substr(7);
                        } else
                        {
                            if (match.indexOf("owner.") == 0) {
                                match = match.substr(6);
                            } else {
                                match = match.substr(1);
                            }
                        }
                        path.push(match.split('.'));
                        vars.push(nv);
                        return nv;
                    }
                    );
        
        
                var method = "return " + ms + ";";
                var methodString = method;
                try {
                    method = AtomEvaluator.compile(vars, method);
                } catch (e) {
                    throw new Error("Error executing \n" + methodString + "\nOriginal: " + txt + "\r\n" + e);
                }
        
                be = { length: vars.length, method: method, path: path, original: ms };
                this.becache[txt] = be;
                return be;
            },
            compile: function (vars, method) {
                var k = vars.join("-") + ":" + method;
                var e = this.ecache[k];
                if (e)
                    return e;
        
                vars.push("Atom");
                vars.push("AtomPromise");
                vars.push("$x");
        
                e = new Function(vars,method);
                this.ecache[k] = e;
                return e;
            }
        };
        

    class TagInitializerList{
        component:string;
        tags: Array<TagInitializer> = [];

        constructor(name){
            this.component = name;
        }

        toScript():string{
            return this.tags.map((tag,i) => {
                return `this.${this.component}_t${i} = function(e) { 
                        ${tag.toScript()}
                    };`;
            }).join("\r\n\t\t");
        }
    }

    class TagInitializer{
        inits:Array<string>;

        constructor(inits:Array<string>){
            this.inits = inits;
        }

        toScript():string{
            return this.inits.join("\r\n\t\t\t");
        }
    }

    export class HtmlContent{
        static processTwoWayBinding(v: string): string {
            v = v.substr(2,v.length-3);

            if(v.startsWith("$")){
                v = v.substr(1);
            }
            
            var plist = v.split(".");

            v = ` ${JSON.stringify(plist)}, 1 `;

            return v;
        }
        static processOneWayBinding(v: string): string {
            v = v.substr(1,v.length-2);
            
            var vx = AtomEvaluator.parse(v);

            v = "";

            var plist = vx.path.map((p,i)=> `v${i+1}` ).join(",");

            v += ` ${JSON.stringify(vx.path)}, 0, function(${plist}) { return ${vx.original}; }`;

            return v;
        }
        static processOneTimeBinding(v: string): string {
            v = v.substr(1,v.length-2);

            var vx = AtomEvaluator.parse(v);

            v = vx.original;

            for(var i=0; i<vx.path.length;i++){
                var p = vx.path[i];
                var start = "this";
                v = v.replace(`v${i+1}`, `Atom.get(this,"${p.join(".")}"`  );
            }

            return v;
        }

        static camelCase(text:string){
            if(text.startsWith("atom-")){
                text = text.substr(5);
            }

            return text.split('-').map((v,i)=>{
                if(i){
                    v = v.charAt(0).toUpperCase() + v.substr(1);
                }
                return v;
            }).join("");
        }

        static mapNode(a,tags:TagInitializerList){
            var r = [a.name];

            var ca = {};

            //debugger;
            if(!a.children)
                return r;

            var aa = a.attribs || {};

            var inits:Array<string> = [];

            if(aa){
                for(var key in aa){
                    if(!aa.hasOwnProperty(key))
                        continue;

                    var ckey = HtmlContent.camelCase(key);

                    var v = (aa[key] as string).trim();
                    if(v.startsWith("{") && v.endsWith("}")){
                        // one time binding...
                        inits.push(`this.setLocalValue('${ckey}',${HtmlContent.processOneTimeBinding(v)},e);`);
                        continue;
                    }

                    if(v.startsWith("[") && v.endsWith("]")){
                        // one way binding...
                        inits.push(`this.bind(e,'${ckey}',${HtmlContent.processOneWayBinding(v)});`)
                        continue;
                    }
                    if(v.startsWith("$[") && v.endsWith("]")){
                        // two way binding...
                        inits.push(`this.bind(e,'${ckey}',${HtmlContent.processTwoWayBinding(v)});`)
                        continue;
                    }
                    ca[key] = aa[key];
                }

                if(inits.length){
                    ca["data-atom-init"] = `${tags.component}_t${tags.tags.length}`;
                    tags.tags.push(new TagInitializer(inits));
                }

                r.push(ca);
            }

            var text = a.children.filter(f=>f.type == 'text' && f.data.trim() ).map(f=>f.data).join("");
            if(text){
                ca["text"] = text;
            }


            for(var child of  a.children.filter(f=>f.type == 'tag').map((n)=> HtmlContent.mapNode(n,tags)) ){
                r.push(child);
            }
            return r;            
        }

        static parseNode(node, name?){
            if(node.type != 'tag')
                return "";
            var result = "";

            if(node.attribs){
                name = node.attribs["atom-component"];
                delete node.attribs["atom-component"];
            }

            var tags:TagInitializerList = new TagInitializerList(name);

            result = "[" + HtmlContent.mapNode(node, tags).map(n=> JSON.stringify(n, undefined,2)).join(",\r\n") + "]";


            return `(function(window,baseType){

                window.jsonML["WebAtoms.${name}.template"] = ${result};

                (function(window,WebAtoms){
                    ${tags.toScript()}
                }).call(WebAtoms.PageSetup,window,WebAtoms);

                return classCreatorEx({
                    name: ${name},
                    base: baseType,
                    start: function(){

                    }
                })
            })(window, WebAtoms.AtomControl.prototype)`;

        }

        static parse(input:string):string{

            var handler = new DefaultHandler(function (error, dom) {
                if (error)
                {
                    console.error(error);
                }
            });
            var parser = new Parser(handler);
            parser.parseComplete(input);    

            var result = "";

            for(var node of handler.dom){
                result += "\r\n";
                result += HtmlContent.parseNode(node);
            }

            return result;
        }
    }

    export class HtmlFile{

        file: string;
        lastTime: number;

        compiled:string;

        get currentTime(){
            return fs.statSync(this.file).ctimeMs;
        }


        constructor(file:string){
            this.file = file;

            this.lastTime = 0;

        }

        compile(){

            this.compiled = HtmlContent.parse(fs.readFileSync(this.file,"utf8"));
            this.lastTime = this.currentTime;
        }

        

    }


    export class ComponentGenerator{
        outFolder: string;
        outFile: string;

        folder: string;

        files:Array<HtmlFile>;

        

        constructor(folder: string, outFile?:string, outFolder?:string) {
            this.folder = folder;
            this.outFile = outFile;
            this.outFolder = outFolder;

            this.files = [];

            // scan all html files...
            for(var file of fs.readdirSync(folder)){
                this.files.push( new HtmlFile(file));
            }

            this.watch();
            this.compile();

        }


        compile():void{

            var result = "";

            for(var file of this.files){
                if(file.currentTime != file.lastTime){
                    file.compile();
                }
                result += "\r\n";
                result += file.compiled;
            }

            fs.writeFileSync(this.outFile,result);
        }

        watch():void{
            fs.watch(this.folder,{ recursive: true}, (event,file)=>{
                this.postCompile();
            });
        }
        
        last:any;

        postCompile():void{
            if(this.last){
                clearTimeout(this.last);
            }
            this.last = setTimeout(()=>{
                this.last = 0;
                this.compile();
            },100);
        }
    }

    if(process && process.argv && process.argv[2] && process.argv[3]){
        var cc = new ComponentGenerator(process.argv[2], process.argv[3] );
    }

    //global["HtmlContent"] = HtmlContent;
    //global["HtmlCompiler"] = ComponentGenerator;

}