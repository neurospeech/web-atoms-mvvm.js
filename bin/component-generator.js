"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// tslint:disable
var htmlparser2_1 = require("htmlparser2");
var fs = require("fs");
var path = require("path");
var ComponentGenerator;
(function (ComponentGenerator_1) {
    var currentFileName = "";
    var currentFileLines = [];
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
            var ms = txt.replace(regex, function (match) {
                var original = match;
                var nv = "v" + (path.length + 1);
                if (match.indexOf("$owner.") == 0) {
                    match = match.substr(7);
                }
                else {
                    if (match.indexOf("owner.") == 0) {
                        match = match.substr(6);
                    }
                    else {
                        match = match.substr(1);
                    }
                }
                match = match.split(".");
                var trail = "";
                match = match.filter(function (m) {
                    if (!m.endsWith("(")) {
                        return true;
                    }
                    trail = "." + m;
                    return false;
                });
                if (match.length > 0) {
                    path.push(match);
                    vars.push(nv);
                }
                else {
                    return original;
                }
                return "(" + nv + ")" + trail;
            });
            var method = "return " + ms + ";";
            var methodString = method;
            try {
                method = AtomEvaluator.compile(vars, method);
            }
            catch (e) {
                //throw new Error("Error executing \n" + methodString + "\nOriginal: " + txt + "\r\n" + e);
                throw new Error(e.message + " in \"" + txt + "\"");
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
            e = new Function(vars, method);
            this.ecache[k] = e;
            return e;
        }
    };
    var TagInitializerList = /** @class */ (function () {
        function TagInitializerList(name) {
            this.tags = [];
            this.component = name;
        }
        TagInitializerList.prototype.toScript = function () {
            var _this = this;
            return this.tags.map(function (tag, i) {
                return "this." + _this.component + "_t" + i + " = function(e) { \n                        " + tag.toScript() + "\n                    };";
            }).join("\r\n\t\t");
        };
        return TagInitializerList;
    }());
    var TagInitializer = /** @class */ (function () {
        function TagInitializer(inits) {
            this.inits = inits;
        }
        TagInitializer.prototype.toScript = function () {
            return this.inits.join("\r\n\t\t\t");
        };
        return TagInitializer;
    }());
    var HtmlContent = /** @class */ (function () {
        function HtmlContent() {
        }
        HtmlContent.processTwoWayBinding = function (v) {
            v = v.substr(2, v.length - 3);
            if (v.startsWith("$")) {
                v = v.substr(1);
            }
            var plist = v.split(".");
            v = " " + JSON.stringify(plist) + ", 1 ";
            return v;
        };
        HtmlContent.escapeLambda = function (v) {
            v = v.trim();
            if (v.startsWith("()=>") || v.startsWith("() =>") || v.startsWith("=>")) {
                v = v.replace("()=>", "");
                v = v.replace("() =>", "");
                v = v.replace("=>", "");
                return "function(){ \n                    return " + v + "; \n                }";
            }
            return v;
        };
        HtmlContent.processOneWayBinding = function (v) {
            v = v.substr(1, v.length - 2);
            v = HtmlContent.escapeLambda(v);
            var vx = AtomEvaluator.parse(v);
            v = "";
            var plist = vx.path.map(function (p, i) { return "v" + (i + 1); }).join(",");
            v += " " + JSON.stringify(vx.path) + ", 0, function(" + plist + ") { return " + vx.original + "; }";
            return v;
        };
        HtmlContent.processOneTimeBinding = function (v) {
            v = v.substr(1, v.length - 2);
            v = HtmlContent.escapeLambda(v);
            var vx = AtomEvaluator.parse(v);
            v = vx.original;
            for (var i = 0; i < vx.path.length; i++) {
                var p = vx.path[i];
                var start = "this";
                v = v.replace("v" + (i + 1), "Atom.get(this,\"" + p.join(".") + "\")");
            }
            return v;
        };
        HtmlContent.camelCase = function (text) {
            if (text.startsWith("atom-")) {
                text = text.substr(5);
            }
            return text.split('-').map(function (v, i) {
                if (i) {
                    v = v.charAt(0).toUpperCase() + v.substr(1);
                }
                return v;
            }).join("");
        };
        HtmlContent.formLayoutNode = function (a) {
            var cl1 = a.children.filter(function (c) { return c.type == "tag"; }).map(function (c) {
                var fieldAttributes = {
                    "class": "atom-field"
                };
                var aa = c.attribs || {};
                var label = aa["atom-label"] || "";
                if (label) {
                    delete aa["atom-label"];
                }
                var isRequired = aa["atom-required"];
                if (isRequired) {
                    delete aa["atom-required"];
                }
                else {
                    isRequired = "";
                }
                if (isRequired.endsWith("}") || isRequired.endsWith("]")) {
                    var last = isRequired.substr(isRequired.length - 1);
                    isRequired = isRequired.substr(0, isRequired.length - 1) + " ? '*' : 'false'" + last;
                }
                if (/true/i.test(isRequired)) {
                    isRequired = "*";
                }
                var error = aa["atom-error"] || "";
                if (error) {
                    delete aa["atom-error"];
                }
                var fieldVisible = aa["atom-field-visible"] ||
                    aa["field-visible"] ||
                    aa["atom-field-visibility"] ||
                    aa["field-visibility"];
                if (fieldVisible) {
                    delete aa["atom-field-visible"];
                    delete aa["field-visible"];
                    delete aa["atom-field-visibility"];
                    delete aa["field-visibility"];
                    fieldVisible = fieldVisible.trim();
                    if (fieldVisible.startsWith("{")) {
                        fieldVisible = fieldVisible.substr(1, fieldVisible.length - 2);
                        fieldVisible = "{ " + fieldVisible + " ? '' : 'none' }";
                    }
                    if (fieldVisible.startsWith("[")) {
                        fieldVisible = fieldVisible.substr(1, fieldVisible.length - 2);
                        fieldVisible = "[ " + fieldVisible + " ? '' : 'none' ]";
                    }
                    fieldAttributes["style-display"] = fieldVisible;
                }
                var errorAttribs = {
                    "class": "atom-error",
                    "atom-text": error
                };
                var errorStyle = "";
                if (error) {
                    if (error.endsWith("}") || error.endsWith("]")) {
                        var last = error.substr(error.length - 1);
                        errorStyle = error.substr(0, error.length - 1) + " ? '' : 'none'" + last;
                        errorAttribs["style-display"] = errorStyle;
                    }
                }
                var cl = [
                    {
                        name: "label",
                        type: "tag",
                        attribs: {
                            "atom-text": label,
                            "class": "atom-label"
                        },
                        children: []
                    },
                    {
                        name: "span",
                        type: "tag",
                        attribs: {
                            "class": "atom-required",
                            "atom-text": isRequired
                        },
                        children: []
                    },
                    c,
                    {
                        name: "div",
                        type: "tag",
                        attribs: errorAttribs,
                        children: []
                    }
                ];
                return {
                    name: "div",
                    type: "tag",
                    attribs: fieldAttributes,
                    children: cl
                };
            });
            var formAttribs = a.attribs || {};
            var fc = formAttribs["class"];
            if (fc) {
                formAttribs["class"] = "atom-form " + fc;
            }
            else {
                formAttribs["class"] = "atom-form";
            }
            return {
                name: "div",
                type: "tag",
                attribs: formAttribs,
                children: cl1
            };
        };
        return HtmlContent;
    }());
    ComponentGenerator_1.HtmlContent = HtmlContent;
    var HtmlComponent = /** @class */ (function () {
        function HtmlComponent(node, nsNamespace, name) {
            this.baseType = null;
            this.name = null;
            this.nsNamespace = null;
            this.generated = null;
            this.generatedStyle = "";
            this.nsNamespace = nsNamespace;
            this.parseNode(node, name);
        }
        HtmlComponent.prototype.mapNode = function (a, tags, children) {
            var _this = this;
            var original = a;
            // debugger;
            if (/style/i.test(a.name)) {
                // debugger;
                this.generatedStyle += a.children.map(function (x) { return x.text; }).join("\r\n");
                this.generatedStyle += "\r\n";
                return;
            }
            if (a.name === "form-layout") {
                // console.log(`converting form layout with ${a.children.length} children`);
                a = HtmlContent.formLayoutNode(a);
                // console.log(`converting form layout to ${a.children.length} children`);
            }
            var r = [a.name];
            var ca = {};
            // debugger;
            if (!a.children) {
                return r;
            }
            var aa = a.attribs || {};
            var inits = [];
            if (aa) {
                for (var key in aa) {
                    //if(!aa.hasOwnProperty(key))
                    //    continue;
                    try {
                        var ckey = HtmlContent.camelCase(key);
                        var v = aa[key].trim();
                        if (!v)
                            continue;
                        if (key === "data-atom-init") {
                            inits.push("WebAtoms.PageSetup." + v + "(e);");
                            continue;
                        }
                        if (v.startsWith("{") && v.endsWith("}")) {
                            // one time binding...
                            if (/^viewmodel$/i.test(ckey)) {
                                inits.push("this.setLocalValue('" + ckey + "'," + HtmlContent.processOneTimeBinding(v) + ",e, true);");
                            }
                            else {
                                inits.push("this.setLocalValue('" + ckey + "'," + HtmlContent.processOneTimeBinding(v) + ",e);");
                            }
                            continue;
                        }
                        if (v.startsWith("[") && v.endsWith("]")) {
                            // one way binding...
                            inits.push("this.bind(e,'" + ckey + "'," + HtmlContent.processOneWayBinding(v) + ");");
                            continue;
                        }
                        if (v.startsWith("$[") && v.endsWith("]")) {
                            // two way binding...
                            inits.push("this.bind(e,'" + ckey + "'," + HtmlContent.processTwoWayBinding(v) + ");");
                            continue;
                        }
                        if (v.startsWith("^[") && v.endsWith("]")) {
                            // two way binding...
                            inits.push("this.bind(e,'" + ckey + "'," + HtmlContent.processTwoWayBinding(v) + ",null,\"keyup,keydown,keypress,blur,click\");");
                            continue;
                        }
                        if (/autofocus/i.test(key)) {
                            inits.push("window.WebAtoms.dispatcher.callLater( \n                                function() { \n                                    e.focus(); \n                                });");
                            continue;
                        }
                        ca[key] = aa[key];
                    }
                    catch (er) {
                        //debugger;
                        var en = a.startIndex || 0;
                        var cn = 0;
                        var ln = currentFileLines.findIndex(function (x) { return en < x; });
                        var sln = currentFileLines[ln - 1];
                        cn = en - sln;
                        var errorText = ("" + er.message).split("\n").join(" ").split("\r").join("");
                        console.log(currentFileName + "(" + ln + "," + cn + "): error TS0001: " + errorText + ".");
                    }
                }
                if (children) {
                    inits.push("var oldInit = AtomUI.attr(e,'base-data-atom-init');\n                        if(oldInit){\n                            (window.WebAtoms.PageSetup[oldInit]).call(this,e);\n                        }\n                    ");
                }
                if (inits.length) {
                    ca["data-atom-init"] = tags.component + "_t" + tags.tags.length;
                    tags.tags.push(new TagInitializer(inits));
                }
                r.push(ca);
            }
            var text = a.children.filter(function (f) { return f.type == 'text' && f.data.trim(); }).map(function (f) { return f.data; }).join("");
            if (text) {
                ca["atom-text"] = text.trim();
            }
            var processedChildren = a.children
                .filter(function (f) { return /tag|style/i.test(f.type); })
                .map(function (n) { return _this.mapNode(n, tags); })
                .filter(function (n) { return n; });
            if (children) {
                for (var _i = 0, processedChildren_1 = processedChildren; _i < processedChildren_1.length; _i++) {
                    var child = processedChildren_1[_i];
                    children.push(child);
                }
            }
            else {
                for (var _a = 0, processedChildren_2 = processedChildren; _a < processedChildren_2.length; _a++) {
                    var child = processedChildren_2[_a];
                    r.push(child);
                }
            }
            return r;
        };
        HtmlComponent.prototype.parseNode = function (node, name) {
            if (node.type != 'tag')
                return "";
            var result = "";
            var type = "WebAtoms.AtomControl";
            var props = "";
            if (node.attribs) {
                name = node.attribs["atom-component"];
                this.name = name;
                delete node.attribs["atom-component"];
                if (node.attribs["atom-type"]) {
                    type = node.attribs["atom-type"];
                    delete node.attribs["atom-type"];
                    if (type.startsWith("Atom")) {
                        type = "WebAtoms." + type;
                    }
                }
                if (node.attribs["atom-properties"]) {
                    props = node.attribs["atom-properties"];
                    delete node.attribs["atom-properties"];
                }
            }
            else {
                if (!name) {
                    return;
                }
            }
            this.baseType = type;
            var tags = new TagInitializerList(name);
            var rootChildren = [];
            var rootNode = this.mapNode(node, tags, rootChildren)[1];
            var startScript = "";
            for (var key in rootNode) {
                if (!rootNode.hasOwnProperty(key))
                    continue;
                var value = rootNode[key];
                if (key === "data-atom-init") {
                    startScript += "\n                        var oldInit = AtomUI.attr(e,'data-atom-init');\n                        if(oldInit){\n                            AtomUI.attr(e, 'base-data-atom-init',oldInit);\n                        };\n                        AtomUI.attr(e, 'data-atom-init','" + value + "');\n                    ";
                }
                else {
                    startScript += " if(!AtomUI.attr(e,'" + key + "')) AtomUI.attr(e, '" + key + "', '" + value + "' );\r\n\t\t";
                }
            }
            result = JSON.stringify(rootChildren, undefined, 2);
            name = "" + (this.nsNamespace + "." || "") + name;
            var style = "";
            if (this.generatedStyle) {
                style += "\n                    (function(d){\n                        var css = " + JSON.stringify(this.generatedStyle) + ";\n                        var head = d.head || d.getElementsByTagName('head')[0];\n                        var style = d.createElement('style');\n                        style.type = 'text/css';\n                        style.id = \"component_style_" + (this.nsNamespace ? this.nsNamespace + "." : "") + this.name + "\";\n                        if(style.styleSheet){\n                            style.styleSheet.cssText = css;\n                        }else{\n                            style.appendChild(d.createTextNode(css));\n                        }\n                        head.appendChild(style);\n                    })(document);\n                ";
            }
            this.generated = style + ("\n                window." + name + " = (function(window,baseType){\n\n                window.Templates.jsonML[\"" + name + ".template\"] = \n                    " + result + ";\n\n                (function(window,WebAtoms){\n                    " + tags.toScript() + "\n                }).call(WebAtoms.PageSetup,window,WebAtoms);\n\n                return classCreatorEx({\n                    name: \"" + name + "\",\n                    base: baseType,\n                    start: function(e){\n                        " + startScript + "\n                    },\n                    methods:{\n                        setLocalValue: window.__atomSetLocalValue(baseType)\n                    },\n                    properties:{\n                        " + props + "\n                    }\n                })\n            })(window, " + type + ".prototype);\r\n");
        };
        return HtmlComponent;
    }());
    ComponentGenerator_1.HtmlComponent = HtmlComponent;
    var HtmlFragment = /** @class */ (function () {
        function HtmlFragment(html, nsNamespace) {
            this.baseType = null;
            this.nodes = [];
            this.html = html;
            this.nsNamesapce = nsNamespace;
        }
        HtmlFragment.prototype.compile = function () {
            this.nodes = [];
            var handler = new htmlparser2_1.DomHandler(function (error, dom) {
                if (error) {
                    console.error(error);
                }
            }, { withStartIndices: true });
            var parser = new htmlparser2_1.Parser(handler);
            parser.write(this.html);
            parser.end();
            // debugger;
            for (var _i = 0, _a = handler.dom; _i < _a.length; _i++) {
                var node = _a[_i];
                var cn = new HtmlComponent(node, this.nsNamesapce);
                if (cn.generated) {
                    this.nodes.push(cn);
                }
            }
        };
        return HtmlFragment;
    }());
    ComponentGenerator_1.HtmlFragment = HtmlFragment;
    var HtmlFile = /** @class */ (function () {
        function HtmlFile(file, nsNamespace) {
            this.file = file;
            this.nsNamespace = nsNamespace;
            this.lastTime = 0;
        }
        Object.defineProperty(HtmlFile.prototype, "currentTime", {
            get: function () {
                return fs.statSync(this.file).mtime.getTime();
            },
            enumerable: true,
            configurable: true
        });
        HtmlFile.prototype.compile = function () {
            currentFileName = this.file.split('\\').join("/");
            var html = fs.readFileSync(this.file, 'utf8');
            var lastLength = 0;
            currentFileLines = html.split('\n').map(function (x) {
                var n = lastLength;
                lastLength += x.length + 1;
                return n;
            });
            var node = new HtmlFragment(html, this.nsNamespace);
            node.compile();
            this.nodes = node.nodes;
            this.lastTime = this.currentTime;
        };
        return HtmlFile;
    }());
    ComponentGenerator_1.HtmlFile = HtmlFile;
    var ComponentGenerator = /** @class */ (function () {
        function ComponentGenerator(folder, outFile, nsNamespace, emitDeclaration) {
            this.folder = folder;
            this.outFile = outFile;
            this.nsNamesapce = nsNamespace;
            if (emitDeclaration !== undefined) {
                this.emitDeclaration = emitDeclaration;
            }
            else {
                this.emitDeclaration = true;
            }
            this.files = [];
            this.watch();
            this.compile();
            console.log((new Date()).toLocaleTimeString() + " - Compilation complete. Watching for file changes.");
            console.log("    ");
        }
        ComponentGenerator.prototype.loadFiles = function (folder) {
            // scan all html files...
            for (var _i = 0, _a = fs.readdirSync(folder); _i < _a.length; _i++) {
                var file = _a[_i];
                var fullName = path.join(folder, file);
                var s = fs.statSync(fullName);
                if (s.isDirectory()) {
                    this.loadFiles(fullName);
                }
                else {
                    if (/\.html$/i.test(fullName)) {
                        if (this.files.findIndex(function (x) { return x.file == fullName; }) !== -1)
                            continue;
                        this.files.push(new HtmlFile(fullName, this.nsNamesapce));
                    }
                }
            }
        };
        ComponentGenerator.prototype.compile = function () {
            this.loadFiles(this.folder);
            var deletedFiles = [];
            var nodes = [];
            for (var _i = 0, _a = this.files; _i < _a.length; _i++) {
                var file = _a[_i];
                if (file.currentTime != file.lastTime) {
                    if (!fs.existsSync(file.file)) {
                        deletedFiles.push(file);
                    }
                    //console.log(`Generating ${file.file}`);
                    file.compile();
                }
                for (var _b = 0, _c = file.nodes; _b < _c.length; _b++) {
                    var n = _c[_b];
                    nodes.push(n);
                }
            }
            // sort by baseType...
            nodes = nodes.sort(function (a, b) {
                if (a.baseType == b.name) {
                    return -1;
                }
                return 0;
            });
            for (var _d = 0, deletedFiles_1 = deletedFiles; _d < deletedFiles_1.length; _d++) {
                var file = deletedFiles_1[_d];
                this.files = this.files.filter(function (x) { return x.file == file.file; });
            }
            var result = "";
            var declarations = "";
            var mock = "";
            for (var _e = 0, nodes_1 = nodes; _e < nodes_1.length; _e++) {
                var node = nodes_1[_e];
                if (node.nsNamespace) {
                    var nsStart = "window";
                    for (var _f = 0, _g = node.nsNamespace.split('.'); _f < _g.length; _f++) {
                        var ns = _g[_f];
                        result += "if(!" + nsStart + "['" + ns + "']){\n                            " + nsStart + "['" + ns + "'] = {};\n                        }";
                        nsStart += "." + ns;
                    }
                }
                result += "\r\n";
                result += node.generated;
                if (node.nsNamespace) {
                    declarations += "declare namespace " + node.nsNamespace + "{    class " + node.name + "{ }   }\r\n";
                    //mock += `namespace ${node.nsNamespace} { export  class ${node.name} {}  }`;
                    mock += " var " + node.nsNamespace + " = " + node.nsNamespace + " || {}; ";
                    mock += " " + node.nsNamespace + "." + node.name + " = {}; ";
                }
                else {
                    declarations += "declare class " + node.name + " {  }\r\n";
                    mock += "var " + node.name + " = {}; ";
                }
            }
            fs.writeFileSync(this.outFile, result);
            var now = new Date();
            if (this.emitDeclaration) {
                fs.writeFileSync(this.outFile + ".d.ts", declarations);
                fs.writeFileSync(this.outFile + ".mock.js", mock);
            }
        };
        ComponentGenerator.prototype.watch = function () {
            var _this = this;
            fs.watch(this.folder, { recursive: true }, function (event, file) {
                _this.postCompile();
            });
        };
        ComponentGenerator.prototype.postCompile = function () {
            var _this = this;
            if (this.last) {
                clearTimeout(this.last);
            }
            this.last = setTimeout(function () {
                _this.last = 0;
                console.log("    ");
                console.log((new Date()).toLocaleTimeString() + " - File change detected. Starting incremental compilation...");
                console.log("     ");
                _this.compile();
                console.log("     ");
                console.log((new Date()).toLocaleTimeString() + " - Compilation complete. Watching for file changes.");
            }, 100);
        };
        return ComponentGenerator;
    }());
    ComponentGenerator_1.ComponentGenerator = ComponentGenerator;
    function parseFolder(folder) {
        var dirs = [];
        for (var _i = 0, _a = fs.readdirSync(folder); _i < _a.length; _i++) {
            var file = _a[_i];
            var fullName = path.join(folder, file);
            var stat = fs.statSync(fullName);
            if (stat.isDirectory()) {
                dirs.push(fullName);
            }
            else {
                if (/^waconfig\.json$/i.test(file)) {
                    var config = JSON.parse(fs.readFileSync(fullName, 'utf8'));
                    config.srcFolder = path.join(folder, config.srcFolder);
                    config.outFile = path.join(folder, config.outFile);
                    var cc = new ComponentGenerator(config.srcFolder, config.outFile, config.namespace || "", config.emitDeclaration);
                    return;
                }
            }
        }
        for (var _b = 0, dirs_1 = dirs; _b < dirs_1.length; _b++) {
            var dir = dirs_1[_b];
            parseFolder(dir);
        }
    }
    if (process && process.argv) {
        if (process.argv[2]) {
            if (process.argv[3]) {
                var cc = new ComponentGenerator(process.argv[2], process.argv[3]);
            }
            else {
                parseFolder(process.argv[2]);
            }
        }
    }
    global["HtmlContent"] = HtmlContent;
    global["ComponentGenerator"] = ComponentGenerator;
    global["HtmlFragment"] = HtmlFragment;
})(ComponentGenerator || (ComponentGenerator = {}));
//# sourceMappingURL=component-generator.js.map