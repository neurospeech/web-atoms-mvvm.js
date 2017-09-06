System.register("html-compiler", ["htmlparser", "fs"], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var htmlparser_1, fs, HtmlCompiler;
    return {
        setters: [
            function (htmlparser_1_1) {
                htmlparser_1 = htmlparser_1_1;
            },
            function (fs_1) {
                fs = fs_1;
            }
        ],
        execute: function () {
            (function (HtmlCompiler_1) {
                var HtmlContent = /** @class */ (function () {
                    function HtmlContent() {
                    }
                    HtmlContent.mapNode = function (node) {
                        return node.map(function (a) {
                            var r = [a.name, a.attribs || {}];
                            if (!a.children)
                                return r;
                            r.push(HtmlContent.mapNode(a.children));
                            return r;
                        });
                    };
                    HtmlContent.parseNode = function (node, name) {
                        if (node.type != 'tag')
                            return "";
                        var result = "";
                        if (node.attribs) {
                            name = node.attribs["atom-component"];
                            delete node.attribs["atom-component"];
                        }
                        result = "[" + HtmlContent.mapNode(node).join(",") + "]";
                        return "(function(window,baseType){\n\n                window.jsonML[\"WebAtoms." + name + ".template\"]\n\n                return classCreatorEx({\n                    name: " + name + ",\n                    base: baseType,\n                    start: function(){\n\n                    }\n                })\n            })(window, WebAtoms.AtomControl.prototype)";
                    };
                    HtmlContent.parse = function (input) {
                        var handler = new htmlparser_1.htmlparser.DefaultHandler(function (error, dom) {
                            if (error) {
                                console.error(error);
                            }
                        });
                        var parser = new htmlparser_1.htmlparser.Parser(handler);
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
        }
    };
});
//# sourceMappingURL=cc.js.map