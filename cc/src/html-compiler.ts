import {DefaultHandler,Parser} from "htmlparser";
import * as fs from "fs";

namespace HtmlCompiler{

    class TagInitializerList{
        component:string;
        tags: Array<TagInitializer> = [];

        constructor(name){
            this.component = name;
        }
    }

    class TagInitializer{
        inits:Array<string>;

        constructor(inits:Array<string>){
            this.inits = inits;
        }
    }

    export class HtmlContent{
        static processOneTimeBinding(v: string): string {
            v = v.substr(1,v.length-2);
            return v;
        }

        static camelCase(text:string){
            if(text.startsWith("atom-")){
                text = text.substr(0,5);
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
                        continue;
                    }
                    if(v.startsWith("$[") && v.endsWith("]")){
                        // two way binding...
                        continue;
                    }
                    ca[key] = aa[key];
                }

                if(inits.length){
                    ca["data-atom-init"] = `${tags.component}.t${tags.tags.length}`;
                    tags.tags.push(new TagInitializer(inits));
                }

                r.push(ca);
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


    export class HtmlCompiler{
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
                this.compile();
            },100);
        }
    }

    if(process && process.argv && process.argv[2] && process.argv[3]){
        var cc = new HtmlCompiler(process.argv[2], process.argv[3] );
    }

    global["HtmlContent"] = HtmlContent;
    global["HtmlCompiler"] = HtmlCompiler;

}