"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var htmlparser2_1 = require("htmlparser2");
var fs = require("fs");
debugger;
var ComponentGenerator;
(function (ComponentGenerator_1) {
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
            var ms = txt.replace(regex, function (match) {
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
                path.push(match.split('.'));
                vars.push(nv);
                return nv;
            });
            var method = "return " + ms + ";";
            var methodString = method;
            try {
                method = AtomEvaluator.compile(vars, method);
            }
            catch (e) {
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
            if (v.startsWith("()=>") || v.startsWith("() =>")) {
                v = v.replace("()=>", "");
                v = v.replace("() =>", "");
                return "function(){ return " + v + "; }";
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
        HtmlContent.mapNode = function (a, tags) {
            var r = [a.name];
            var ca = {};
            //debugger;
            if (!a.children)
                return r;
            var aa = a.attribs || {};
            var inits = [];
            if (aa) {
                for (var key in aa) {
                    if (!aa.hasOwnProperty(key))
                        continue;
                    var ckey = HtmlContent.camelCase(key);
                    var v = aa[key].trim();
                    if (v.startsWith("{") && v.endsWith("}")) {
                        // one time binding...
                        inits.push("this.setLocalValue('" + ckey + "'," + HtmlContent.processOneTimeBinding(v) + ",e);");
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
                    ca[key] = aa[key];
                }
                if (inits.length) {
                    ca["data-atom-init"] = tags.component + "_t" + tags.tags.length;
                    tags.tags.push(new TagInitializer(inits));
                }
                r.push(ca);
            }
            var text = a.children.filter(function (f) { return f.type == 'text' && f.data.trim(); }).map(function (f) { return f.data; }).join("");
            if (text) {
                ca["text"] = text;
            }
            for (var _i = 0, _a = a.children.filter(function (f) { return f.type == 'tag'; }).map(function (n) { return HtmlContent.mapNode(n, tags); }); _i < _a.length; _i++) {
                var child = _a[_i];
                r.push(child);
            }
            return r;
        };
        HtmlContent.parseNode = function (node, name) {
            if (node.type != 'tag')
                return "";
            var result = "";
            if (node.attribs) {
                name = node.attribs["atom-component"];
                delete node.attribs["atom-component"];
            }
            var tags = new TagInitializerList(name);
            result = "[" + HtmlContent.mapNode(node, tags).map(function (n) { return JSON.stringify(n, undefined, 2); }).join(",\r\n") + "]";
            return "(function(window,baseType){\n\n                window.jsonML[\"WebAtoms." + name + ".template\"] = " + result + ";\n\n                (function(window,WebAtoms){\n                    " + tags.toScript() + "\n                }).call(WebAtoms.PageSetup,window,WebAtoms);\n\n                return classCreatorEx({\n                    name: \"" + name + "\",\n                    base: baseType,\n                    start: function(){\n\n                    }\n                })\n            })(window, WebAtoms.AtomControl.prototype)";
        };
        HtmlContent.parse = function (input) {
            var handler = new htmlparser2_1.DomHandler(function (error, dom) {
                if (error) {
                    console.error(error);
                }
            });
            var parser = new htmlparser2_1.Parser(handler);
            parser.write(input);
            parser.end();
            var result = "";
            for (var _i = 0, _a = handler.dom; _i < _a.length; _i++) {
                var node = _a[_i];
                result += "\r\n";
                result += HtmlContent.parseNode(node);
            }
            return result;
        };
        return HtmlContent;
    }());
    ComponentGenerator_1.HtmlContent = HtmlContent;
    var HtmlFile = /** @class */ (function () {
        function HtmlFile(file) {
            this.file = file;
            this.lastTime = 0;
        }
        Object.defineProperty(HtmlFile.prototype, "currentTime", {
            get: function () {
                return fs.statSync(this.file).ctimeMs;
            },
            enumerable: true,
            configurable: true
        });
        HtmlFile.prototype.compile = function () {
            this.compiled = HtmlContent.parse(fs.readFileSync(this.file, "utf8"));
            this.lastTime = this.currentTime;
        };
        return HtmlFile;
    }());
    ComponentGenerator_1.HtmlFile = HtmlFile;
    var ComponentGenerator = /** @class */ (function () {
        function ComponentGenerator(folder, outFile, outFolder) {
            this.folder = folder;
            this.outFile = outFile;
            this.outFolder = outFolder;
            this.files = [];
            this.loadFiles(folder);
            this.watch();
            this.compile();
        }
        ComponentGenerator.prototype.loadFiles = function (folder) {
            // scan all html files...
            for (var _i = 0, _a = fs.readdirSync(folder); _i < _a.length; _i++) {
                var file = _a[_i];
                var fullName = folder + "/" + file;
                var s = fs.statSync(fullName);
                if (s.isDirectory()) {
                    this.loadFiles(fullName);
                }
                else {
                    console.log("compiling " + fullName);
                    this.files.push(new HtmlFile(fullName));
                }
            }
        };
        ComponentGenerator.prototype.compile = function () {
            var result = "";
            for (var _i = 0, _a = this.files; _i < _a.length; _i++) {
                var file = _a[_i];
                if (file.currentTime != file.lastTime) {
                    file.compile();
                }
                result += "\r\n";
                result += file.compiled;
            }
            fs.writeFileSync(this.outFile, result);
        };
        ComponentGenerator.prototype.watch = function () {
            var _this = this;
            fs.watch(this.folder, { recursive: true }, function (event, file) {
                console.log("File - " + event + " - " + file);
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
                _this.compile();
            }, 100);
        };
        return ComponentGenerator;
    }());
    ComponentGenerator_1.ComponentGenerator = ComponentGenerator;
    if (process && process.argv && process.argv[2] && process.argv[3]) {
        var cc = new ComponentGenerator(process.argv[2], process.argv[3]);
    }
    global["HtmlContent"] = HtmlContent;
    global["ComponentGenerator"] = ComponentGenerator;
})(ComponentGenerator || (ComponentGenerator = {}));
//# sourceMappingURL=component-generator.js.map