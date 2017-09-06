import {htmlparser} from "htmlparser";
import * as fs from "fs";

module HtmlCompiler{

    export class HtmlContent{

        static mapNode(node){
            return node.map(a=>{
                var r = [a.name, a.attribs || {}];

                if(!a.children)
                    return r;
                r.push( HtmlContent.mapNode(a.children) );
                return r;
            });
        }

        static parseNode(node, name?){
            if(node.type != 'tag')
                return "";
            var result = "";

            if(node.attribs){
                name = node.attribs["atom-component"];
                delete node.attribs["atom-component"];
            }

            result = "[" + HtmlContent.mapNode(node).join(",") + "]";


            return `(function(window,baseType){

                window.jsonML["WebAtoms.${name}.template"]

                return classCreatorEx({
                    name: ${name},
                    base: baseType,
                    start: function(){

                    }
                })
            })(window, WebAtoms.AtomControl.prototype)`;

        }

        static parse(input:string):string{

            var handler = new htmlparser.DefaultHandler(function (error, dom) {
                if (error)
                {
                    console.error(error);
                }
            });
            var parser = new htmlparser.Parser(handler);
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