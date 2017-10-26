// tslint:disable
import {DomHandler,Parser} from "htmlparser2";
import * as less from "less";
import * as deasync from "deasync" ;

import * as fs from "fs";
import * as path from "path";

namespace ComponentGenerator{


    var currentFileName:string = "";
    var currentFileLines: Array<number> = [];

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
                        var original = match;
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

                        if(match.length>0){
                            path.push(match);
                            vars.push(nv);
                        }else{
                            return original;
                        }
                        return "(" + nv + ")" + trail;
                    }
                    );


                var method = "return " + ms + ";";
                var methodString = method;
                try {
                    method = AtomEvaluator.compile(vars, method);
                } catch (e) {
                    //throw new Error("Error executing \n" + methodString + "\nOriginal: " + txt + "\r\n" + e);
                    throw new Error(`${e.message} in "${txt}"`);
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

        static formLayoutNode(a){


            var cl1 = a.children.filter(c=>c.type == "tag").map( c => {

                var fieldAttributes = {
                    "class":"atom-field"
                };


                var aa = c.attribs || {};

                var label = aa["atom-label"] || "";
                if(label){
                    delete aa["atom-label"];
                }

                var isRequired = aa["atom-required"];

                if(isRequired){
                    delete aa["atom-required"];
                }
                else{
                    isRequired = "";
                }



                if(isRequired.endsWith("}") || isRequired.endsWith("]")){
                    var last = isRequired.substr(isRequired.length-1);
                    isRequired = isRequired.substr(0,isRequired.length-1) + " ? '*' : 'false'" + last;
                }

                if(/true/i.test(isRequired)){
                    isRequired = "*";
                }

                var error:string = aa["atom-error"] || "";
                if(error) {
                    delete aa["atom-error"];
                }

                var fieldVisible:string = aa["atom-field-visible"] ||
                    aa["field-visible"] ||
                    aa["atom-field-visibility"] ||
                    aa["field-visibility"];
                if(fieldVisible) {
                    delete aa["atom-field-visible"];
                    delete aa["field-visible"];
                    delete aa["atom-field-visibility"];
                    delete aa["field-visibility"];

                    fieldVisible = fieldVisible.trim();

                    if(fieldVisible.startsWith("{")) {
                        fieldVisible = fieldVisible.substr(1,fieldVisible.length-2);
                        fieldVisible = `{ ${fieldVisible} ? '' : 'none' }`;
                    }

                    if(fieldVisible.startsWith("[")) {
                        fieldVisible = fieldVisible.substr(1,fieldVisible.length-2);
                        fieldVisible = `[ ${fieldVisible} ? '' : 'none' ]`;
                    }

                    fieldAttributes["style-display"] = fieldVisible;
                }

                var errorAttribs = {
                    "class":"atom-error",
                    "atom-text": error
                };

                var errorStyle = "";
                if(error){
                    if(error.endsWith("}") || error.endsWith("]")){
                        var last:any = error.substr(error.length-1);
                        errorStyle = error.substr(0,error.length-1) + " ? '' : 'none'" + last;
                        errorAttribs["style-display"] = errorStyle;
                    }
                }



                var cl = [
                    { 
                        name: "label", 
                        type:"tag",
                        attribs:{
                            "atom-text": label,
                            "class":"atom-label"
                        },
                        children:[]
                    },
                    {
                        name:"span",
                        type:"tag",
                        attribs:{
                            "class":"atom-required",
                            "atom-text": isRequired
                        },
                        children:[]
                    },
                    c,
                    {
                        name: "div",
                        type:"tag",
                        attribs:errorAttribs,
                        children:[]
                    }
                ];



                return {
                    name:"div",
                    type:"tag",
                    attribs:fieldAttributes,
                    children:cl
                };

            });

            var formAttribs:any = a.attribs || {};
            var fc:string = formAttribs["class"];
            if(fc) {
                formAttribs["class"] = "atom-form " + fc;
            }else{
                formAttribs["class"] = "atom-form";
            }

            return { 
                name:"div",
                type:"tag",
                attribs:formAttribs,
                children: cl1
            } ;
        }


    }

    export class HtmlComponent{

        baseType:string = null;
        name:string = null;
        nsNamespace:string = null;
        generated:string = null;
        generatedStyle: string = "";

        constructor(node,nsNamespace,name?:string, less?:string){
            this.nsNamespace = nsNamespace;
            if(less){
                this.generatedStyle = less;
            }
            this.parseNode(node,name);
        }

        mapNode(a:any,tags:TagInitializerList, children?:Array<any>): string[] {
            
            var original = a;

            // debugger;

            if( /style/i.test(a.name)){
                // debugger;
                this.generatedStyle += a.children.map(x => x.data).join("\r\n");
                this.generatedStyle += "\r\n";
                return;
            }

            if(a.name === "form-layout") {
                // console.log(`converting form layout with ${a.children.length} children`);
                a = HtmlContent.formLayoutNode(a);
                // console.log(`converting form layout to ${a.children.length} children`);

            }



            var r:string[] = [a.name];

            var ca:any = {};

            // debugger;
            if(!a.children) {
                return r;
            }

            var aa:any = a.attribs || {};

            var inits:Array<string> = [];

            if(aa){
                for(var key in aa){
                    //if(!aa.hasOwnProperty(key))
                    //    continue;

                    try{

                        var ckey = HtmlContent.camelCase(key);

                        var v = (aa[key] as string).trim();

                        if(!v)
                            continue;

                        if(key === "data-atom-init"){
                            inits.push(`WebAtoms.PageSetup.${v}(e);`);
                            continue;
                        }

                        if(v.startsWith("{") && v.endsWith("}")){
                            // one time binding...
                            if(/^viewmodel$/i.test(ckey)){
                                inits.push(`this.setLocalValue('${ckey}',${HtmlContent.processOneTimeBinding(v)},e, true);`);
                            }else{
                                inits.push(`this.setLocalValue('${ckey}',${HtmlContent.processOneTimeBinding(v)},e);`);
                            }
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

                        if(/autofocus/i.test(key)) {
                            inits.push(`window.WebAtoms.dispatcher.callLater( 
                                function() { 
                                    e.focus(); 
                                });`);
                            continue;
                        }
                        ca[key] = aa[key];
                    }catch(er){
                        //debugger;
                        var en = a.startIndex || 0;
                        var cn = 0;
                        var ln = currentFileLines.findIndex( x => en < x );
                        var sln = currentFileLines[ln-1];
                        cn = en - sln;
                        var errorText:string = `${er.message}`.split("\n").join(" ").split("\r").join("");
                        console.log(`${currentFileName}(${ln},${cn}): error TS0001: ${errorText}.`);
                    }
                }

                if(children){
                    inits.push(`var oldInit = AtomUI.attr(e,'base-data-atom-init');
                        if(oldInit){
                            (window.WebAtoms.PageSetup[oldInit]).call(this,e);
                        }
                    `);
                }

                if(inits.length){
                    ca["data-atom-init"] = `${tags.component}_t${tags.tags.length}`;
                    tags.tags.push(new TagInitializer(inits));
                }

                r.push(ca);
            }

            var text = a.children.filter(f=>f.type == 'text' && f.data.trim() ).map(f=>f.data).join("");
            if(text){
                ca["atom-text"] = text.trim();
            }

            var processedChildren = a.children
                .filter(f=> /tag|style/i.test(f.type))
                .map((n)=> this.mapNode(n,tags))
                .filter(n => n);

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


        parseNode(node, name?){
            if(node.type != 'tag')
                return "";
            var result = "";

            var type = "WebAtoms.AtomControl";

            var props = "";

            if(node.attribs){

                name = node.attribs["atom-component"];
                this.name = name;
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
            var rootNode = this.mapNode(node,tags, rootChildren)[1] as any;

            var startScript = "";

            for(var key in rootNode){
                if(!rootNode.hasOwnProperty(key)) continue;
                var value = rootNode[key];

                if(key === "data-atom-init"){
                    startScript += `
                        var oldInit = AtomUI.attr(e,'data-atom-init');
                        if(oldInit){
                            AtomUI.attr(e, 'base-data-atom-init',oldInit);
                        };
                        AtomUI.attr(e, 'data-atom-init','${value}');
                    `;
                }else{
                    var ck = key;
                    if(/class/i.test(ck)){
                        ck = "atom-class";
                    }
                    startScript += ` if(!AtomUI.attr(e,'${ck}')) AtomUI.attr(e, '${ck}', '${value}' );\r\n\t\t`;
                }

            }

            result = JSON.stringify( rootChildren, undefined,2);

            name = `${this.nsNamespace + "." || ""}${name}`;

            var style:string = "";

            if(this.generatedStyle) {

                this.compileLess();

                style += `
                    (function(d){
                        var css = ${ JSON.stringify(this.generatedStyle) };
                        var head = d.head || d.getElementsByTagName('head')[0];
                        var style = d.createElement('style');
                        style.type = 'text/css';
                        style.id = "component_style_${ (this.nsNamespace ? this.nsNamespace +"." : "") }${this.name}";
                        if(style.styleSheet){
                            style.styleSheet.cssText = css;
                        }else{
                            style.appendChild(d.createTextNode(css));
                        }
                        head.appendChild(style);
                    })(document);
                `;
            }

            this.generated = style + `
                window.${name} = (function(window,baseType){

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

        compileLess(): void {
            try{
            var finished = false;
            var lessSync = deasync((r) => {
                less.render(this.generatedStyle, (e,o) => {
                    this.generatedStyle = o.css;
                    finished = true;
                    r();
                });
            });

            lessSync();
            }catch(er){
                console.error(er);
            }

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


            currentFileName = this.file.split('\\').join("/");


            var html:string  = fs.readFileSync(this.file,'utf8');

            var dirName:string = path.dirname(this.file);
            var p: path.ParsedPath = path.parse(this.file);

            var less: string = "";

            var lessName = `${dirName}${path.sep}${p.name}.less`;
            if(fs.existsSync(lessName)){
                less = fs.readFileSync(lessName, 'utf8');
            }


            var lastLength = 0;
            currentFileLines = html.split('\n').map(x => {
                var n: number = lastLength;
                lastLength += x.length + 1;
                return n ;
            });
            

            this.compileNodes(html,less, this.pascalCase(p.name) );

            //this.nodes = node.nodes;
            this.lastTime = this.currentTime;
        }

        pascalCase(s:string): string {
            if(!s)
                return "";
            var str = s.replace(/-([a-z])/ig, function(all, letter) {
              return letter.toUpperCase();
            });
            return str.slice(0, 1).toUpperCase() + str.slice(1);
        }

        compileNodes(html:string, less: string, name: string):void {
            this.nodes = [];           
            var handler = new DomHandler(function (error, dom) {
                if (error)
                {
                    console.error(error);
                }
            }, { withStartIndices: true });
            
            var parser = new Parser(handler);
            parser.write(html);    
            parser.end();

            // debugger;

            for(var node of handler.dom){
                var cn = new HtmlComponent(node,this.nsNamespace, name,  less);
                less = null;
                if(cn.generated){
                    this.nodes.push(cn);
                }
            }
        }        



    }



    export class ComponentGenerator{

        nsNamesapce: string;

        emitDeclaration: boolean;

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



        constructor(folder: string, outFile?:string, nsNamespace?:string, emitDeclaration?:boolean) {
            this.folder = folder;
            this.outFile = outFile;
            this.nsNamesapce = nsNamespace;

            if(emitDeclaration !== undefined){
                this.emitDeclaration = emitDeclaration;
            }else{
                this.emitDeclaration = true;
            }

            this.files = [];


            this.watch();
            this.compile();
            console.log(`${(new Date()).toLocaleTimeString()} - Compilation complete. Watching for file changes.`);
            console.log("    ");

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

                    //console.log(`Generating ${file.file}`);
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

            var declarations = "";

            var mock = "";

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

                if(node.nsNamespace){
                    declarations += `declare namespace ${node.nsNamespace}{    class ${node.name}{ }   }\r\n`;
                    //mock += `namespace ${node.nsNamespace} { export  class ${node.name} {}  }`;
                    mock += ` var ${node.nsNamespace} = ${node.nsNamespace} || {}; `;
                    mock += ` ${node.nsNamespace}.${node.name} = {}; `
                }else{
                    declarations += `declare class ${node.name} {  }\r\n`;
                    mock += `var ${node.name} = {}; `;
                }
            }

            fs.writeFileSync(this.outFile,result);
            var now = new Date();

            if(this.emitDeclaration){
                fs.writeFileSync(`${this.outFile}.d.ts`,declarations);
                fs.writeFileSync(`${this.outFile}.mock.js`,mock);
            }
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
                console.log("    ");
                console.log(`${(new Date()).toLocaleTimeString()} - File change detected. Starting incremental compilation...`);
                console.log("     ");
                this.compile();
                console.log("     ");
                console.log(`${(new Date()).toLocaleTimeString()} - Compilation complete. Watching for file changes.`);

                
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

                    var cc = new ComponentGenerator(
                        config.srcFolder, 
                        config.outFile, 
                        config.namespace || "",
                        config.emitDeclaration);
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
    global["HtmlComponent"] = HtmlComponent;
    //global["HtmlFragment"] = HtmlFragment;

}