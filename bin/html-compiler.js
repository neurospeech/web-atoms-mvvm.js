"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var htmlparser_1 = require("htmlparser");
var fs = require("fs");
var HtmlCompiler;
(function (HtmlCompiler_1) {
    var TagInitializerList = /** @class */ (function () {
        function TagInitializerList(name) {
            this.tags = [];
            this.component = name;
        }
        return TagInitializerList;
    }());
    var TagInitializer = /** @class */ (function () {
        function TagInitializer(inits) {
            this.inits = inits;
        }
        return TagInitializer;
    }());
    var HtmlContent = /** @class */ (function () {
        function HtmlContent() {
        }
        HtmlContent.processOneTimeBinding = function (v) {
            v = v.substr(1, v.length - 2);
            return v;
        };
        HtmlContent.camelCase = function (text) {
            if (text.startsWith("atom-")) {
                text = text.substr(0, 5);
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
                        continue;
                    }
                    if (v.startsWith("$[") && v.endsWith("]")) {
                        // two way binding...
                        continue;
                    }
                    ca[key] = aa[key];
                }
                if (inits.length) {
                    ca["data-atom-init"] = tags.component + ".t" + tags.tags.length;
                    tags.tags.push(new TagInitializer(inits));
                }
                r.push(ca);
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
            return "(function(window,baseType){\n\n                window.jsonML[\"WebAtoms." + name + ".template\"] = " + result + ";\n\n                return classCreatorEx({\n                    name: " + name + ",\n                    base: baseType,\n                    start: function(){\n\n                    }\n                })\n            })(window, WebAtoms.AtomControl.prototype)";
        };
        HtmlContent.parse = function (input) {
            var handler = new htmlparser_1.DefaultHandler(function (error, dom) {
                if (error) {
                    console.error(error);
                }
            });
            var parser = new htmlparser_1.Parser(handler);
            parser.parseComplete(input);
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
    HtmlCompiler_1.HtmlContent = HtmlContent;
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
    HtmlCompiler_1.HtmlFile = HtmlFile;
    var HtmlCompiler = /** @class */ (function () {
        function HtmlCompiler(folder, outFile, outFolder) {
            this.folder = folder;
            this.outFile = outFile;
            this.outFolder = outFolder;
            this.files = [];
            // scan all html files...
            for (var _i = 0, _a = fs.readdirSync(folder); _i < _a.length; _i++) {
                var file = _a[_i];
                this.files.push(new HtmlFile(file));
            }
            this.watch();
            this.compile();
        }
        HtmlCompiler.prototype.compile = function () {
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
        HtmlCompiler.prototype.watch = function () {
            var _this = this;
            fs.watch(this.folder, { recursive: true }, function (event, file) {
                _this.postCompile();
            });
        };
        HtmlCompiler.prototype.postCompile = function () {
            var _this = this;
            if (this.last) {
                clearTimeout(this.last);
            }
            this.last = setTimeout(function () {
                _this.compile();
            }, 100);
        };
        return HtmlCompiler;
    }());
    HtmlCompiler_1.HtmlCompiler = HtmlCompiler;
    if (process && process.argv && process.argv[2] && process.argv[3]) {
        var cc = new HtmlCompiler(process.argv[2], process.argv[3]);
    }
    global["HtmlContent"] = HtmlContent;
    global["HtmlCompiler"] = HtmlCompiler;
})(HtmlCompiler || (HtmlCompiler = {}));
//# sourceMappingURL=html-compiler.js.map