import {DomHandler,Parser} from "htmlparser2";

import * as fs from "fs";
import * as path from "path";

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
        
                var regex = /(?:(\$)(window|viewModel|appScope|scope|data|owner|localScope))(?:\.[a-zA-Z_][a-zA-Z_0-9]*(\()?)*/gi;
        
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

                        match = match.split(".");

                        var trail = "";

                        match = match.filter(m => {
                            if(!m.endsWith("(")){
                                return true;
                            }
                            trail = "." + m;
                            return false;
                        });

                        path.push(match);
                        vars.push(nv);
                        return "(" + nv + ")" + trail;
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

        static escapeLambda(v:string):string{

            v = v.trim();

            if(v.startsWith("()=>") || v.startsWith("() =>") || v.startsWith("=>")){
                v = v.replace("()=>","");
                v = v.replace("() =>","");
                v = v.replace("=>","");
                return `function(){ 
                    return ${v}; 
                }`;
            }

            return v;
        }

        static processOneWayBinding(v: string): string {
            v = v.substr(1,v.length-2);

            v = HtmlContent.escapeLambda(v);
            
            var vx = AtomEvaluator.parse(v);

            v = "";

            var plist = vx.path.map((p,i)=> `v${i+1}` ).join(",");

            v += ` ${JSON.stringify(vx.path)}, 0, function(${plist}) { return ${vx.original}; }`;

            return v;
        }

        static processOneTimeBinding(v: string): string {
            v = v.substr(1,v.length-2);

            v = HtmlContent.escapeLambda(v);

            var vx = AtomEvaluator.parse(v);

            v = vx.original;

            for(var i=0; i<vx.path.length;i++){
                var p = vx.path[i];
                var start = "this";
                v = v.replace(`v${i+1}`, `Atom.get(this,"${p.join(".")}")`  );
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

        static mapNode(a,tags:TagInitializerList, children?:Array<any>){
            var r = [a.name];

            var ca = {};

            //debugger;
            if(!a.children)
                return r;

            var aa = a.attribs || {};

            // if(aa["atom-type"]){
            //     // needs separate initializer...
            //     tags = new TagInitializerList(`${tags.component}_${tags.tags.length}`);
            // }


            var inits:Array<string> = [];

            if(aa){
                for(var key in aa){
                    if(!aa.hasOwnProperty(key))
                        continue;

                    var ckey = HtmlContent.camelCase(key);
                    
                    var v = (aa[key] as string).trim();
                    if(key === "atom-init"){
                        inits.push(`WebAtoms.PageSetup.${v}(e);`);
                        continue;
                    }

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
                    if(v.startsWith("^[") && v.endsWith("]")){
                        // two way binding...
                        inits.push(`this.bind(e,'${ckey}',${HtmlContent.processTwoWayBinding(v)},null,"keyup,keydown,keypress,blur,click");`)
                        continue;
                    }

                    if(/autofocus/i.test(key)){
                        inits.push(`window.WebAtoms.dispatcher.callLater( 
                            function() { 
                                e.focus(); 
                            });`);
                        continue;
                    }

                    ca[key] = aa[key];
                }

                if(children){
                    inits.push(`var oldInit = AtomUI.attr(e,'base-atom-init');
                        if(oldInit){
                            (window.WebAtoms.PageSetup[oldInit]).call(this,e);
                        }
                    `);
                }

                if(inits.length){
                    ca["atom-init"] = `${tags.component}_t${tags.tags.length}`;
                    tags.tags.push(new TagInitializer(inits));
                }

                r.push(ca);
            }

            var text = a.children.filter(f=>f.type == 'text' && f.data.trim() ).map(f=>f.data).join("");
            if(text){
                ca["atom-text"] = text.trim();
            }

            var processedChildren = a.children.filter(f=>f.type == 'tag').map((n)=> HtmlContent.mapNode(n,tags));

            if(children){
                for(var child of processedChildren){
                    children.push(child);
                }
            }else{
                for(var child of processedChildren){
                    r.push(child);
                }
            }
            return r;            
        }



    }

    export class HtmlComponent{

        baseType:string = null;
        name:string = null;
        nsNamespace:string = null;
        generated:string = null;

        constructor(node,nsNamespace,name?){
            this.nsNamespace = nsNamespace;
            this.parseNode(node,name);
        }

        parseNode(node, name?){
            if(node.type != 'tag')
                return "";
            var result = "";

            var type = "WebAtoms.AtomControl";

            var props = "";

            if(node.attribs){

                name = node.attribs["atom-component"];
                delete node.attribs["atom-component"];

                if(node.attribs["atom-type"]){
                    type = node.attribs["atom-type"]
                    delete node.attribs["atom-type"];

                    if(type.startsWith("Atom")){
                        type = "WebAtoms." + type;
                    }
                }

                if(node.attribs["atom-properties"]){
                    props = node.attribs["atom-properties"];
                    delete node.attribs["atom-properties"];
                }
            }else{
                if(!name){
                    return;
                }
            }

            this.baseType = type;

            var tags:TagInitializerList = new TagInitializerList(name);

            var rootChildren = [];
            var rootNode = HtmlContent.mapNode(node,tags, rootChildren)[1];

            var startScript = "";

            for(var key in rootNode){
                if(!rootNode.hasOwnProperty(key)) continue;
                var value = rootNode[key];

                if(key === "atom-init"){
                    startScript += `
                        var oldInit = AtomUI.attr(e,'atom-init');
                        if(oldInit){
                            AtomUI.attr(e, 'base-atom-init',oldInit);
                        };
                        AtomUI.attr(e, 'atom-init','${value}');
                    `;
                }else{
                    startScript += ` if(!AtomUI.attr(e,'${key}')) AtomUI.attr(e, '${key}', '${value}' );\r\n\t\t`;
                }

            }

            result = JSON.stringify( rootChildren, undefined,2);

            name = `${this.nsNamespace + "." || ""}${name}`;

            this.generated = `window.${name} = (function(window,baseType){

                window.Templates.jsonML["${name}.template"] = 
                    ${result};

                (function(window,WebAtoms){
                    ${tags.toScript()}
                }).call(WebAtoms.PageSetup,window,WebAtoms);

                return classCreatorEx({
                    name: "${name}",
                    base: baseType,
                    start: function(e){
                        ${startScript}
                    },
                    methods:{
                        setLocalValue: window.__atomSetLocalValue(baseType)
                    },
                    properties:{
                        ${props}
                    }
                })
            })(window, ${type}.prototype);\r\n`;

        }

    }

    export class HtmlFragment{

        baseType:string = null;

        nodes:Array<HtmlComponent> = [];

        compile() {

            this.nodes = [];

            var handler = new DomHandler(function (error, dom) {
                if (error)
                {
                    console.error(error);
                }
            });
            var parser = new Parser(handler);
            parser.write(this.html);    
            parser.end();

            for(var node of handler.dom){
                var cn = new HtmlComponent(node,this.nsNamesapce);
                if(cn.generated){
                    this.nodes.push(cn);
                }
            }

        }

        nsNamesapce: string;
        html: string;
        

        constructor(html: string, nsNamespace: string) {
            this.html = html;
            this.nsNamesapce = nsNamespace;
        }
    }

    export class HtmlFile{
        nsNamespace: string;

        file: string;
        lastTime: number;

        nodes:Array<HtmlComponent>;

        get currentTime(){
            return fs.statSync(this.file).mtime.getTime();
        }


        constructor(file:string,nsNamespace:string){
            this.file = file;
            this.nsNamespace = nsNamespace;

            this.lastTime = 0;

        }

        compile(){

            var html = fs.readFileSync(this.file,'utf8');

            var node = new HtmlFragment(html,this.nsNamespace);
            node.compile();
            this.nodes = node.nodes;
            this.lastTime = this.currentTime;
        }

        

    }


    export class ComponentGenerator{
        
        nsNamesapce: string;

        loadFiles(folder: string){

            // scan all html files...
            for(var file of fs.readdirSync(folder)){
                
                var fullName = path.join(folder,file);
                var s = fs.statSync(fullName);
                if(s.isDirectory()){
                    this.loadFiles(fullName)
                }else{
                    if( /\.html$/i.test(fullName)){

                        if(this.files.findIndex( x => x.file == fullName)  !== -1)
                            continue;

                         this.files.push( new HtmlFile(fullName, this.nsNamesapce));
                    }
                }
            }
        }

        outFile: string;

        folder: string;

        files:Array<HtmlFile>;

        

        constructor(folder: string, outFile?:string, nsNamespace?:string) {
            this.folder = folder;
            this.outFile = outFile;
            this.nsNamesapce = nsNamespace;

            this.files = [];

            
            this.watch();
            this.compile();

            console.log(`Watching for changes in ${folder}`);
            
        }


        compile():void{

            this.loadFiles(this.folder);


            var deletedFiles:Array<HtmlFile> = [];

            var nodes:Array<HtmlComponent> = [];

            for(var file of this.files){
                if(file.currentTime != file.lastTime){

                    if(!fs.existsSync(file.file)){
                        deletedFiles.push(file);
                    }

                    console.log(`Generating ${file.file}`);
                    file.compile();
                }
                for(var n of file.nodes){
                    nodes.push(n);
                }
            }


            // sort by baseType...
            nodes = nodes.sort( (a,b) => {
                if(a.baseType == b.name){
                    return -1;
                }
                return 0;
            });

            for(var file of deletedFiles){
                this.files = this.files.filter( x => x.file == file.file );
            }

            var result = "";
            for(var node of nodes){

                if(node.nsNamespace){
                    var nsStart = "window";
                    for(var ns of node.nsNamespace.split('.')){
                        result += `if(!${nsStart}['${ns}']){
                            ${nsStart}['${ns}'] = {};
                        }`;
                        nsStart += "." + ns;
                    }
                }

                result += "\r\n";
                result += node.generated;
            }

            fs.writeFileSync(this.outFile,result);
            var now = new Date();
            
            console.log(`${now.toLocaleTimeString()} - File generated ${this.outFile}`);
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



    function parseFolder (folder:string):void{

        var dirs:Array<string> = [];

        for(var file of fs.readdirSync(folder)){
            var fullName = path.join(folder,file); 
            var stat = fs.statSync(fullName);
            if(stat.isDirectory()){
                dirs.push(fullName);
            }else{
                if(/^waconfig\.json$/i.test(file)){
                    var config = JSON.parse(fs.readFileSync(fullName, 'utf8'));

                    config.srcFolder = path.join(folder,config.srcFolder);
                    config.outFile = path.join(folder,config.outFile);

                    var cc = new ComponentGenerator(config.srcFolder, config.outFile, config.namespace || "");
                    return;
                }
            }
        }

        for(var dir of dirs){
            parseFolder(dir);
        }


    }

    if(process && process.argv){
        if(process.argv[2]){
            if(process.argv[3]){
                var cc = new ComponentGenerator(process.argv[2], process.argv[3] );
            }
            else{
                parseFolder(process.argv[2]);
            }
        }
    }

    global["HtmlContent"] = HtmlContent;
    global["ComponentGenerator"] = ComponentGenerator;

}