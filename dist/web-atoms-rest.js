var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
function methodBuilder(method) {
    return function (url) {
        return function (target, propertyKey, descriptor) {
            var a = target.methods[propertyKey];
            descriptor.value = function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                console.log("methodBuilder executed");
                var r = target.invoke(url, method, a, args);
                console.log(r);
                return r;
            };
            console.log("methodBuilder called");
            //console.log({ url: url, propertyKey: propertyKey,descriptor: descriptor });
        };
    };
}
function parameterBuilder(paramName) {
    return function (key) {
        //console.log("Declaration");
        //console.log({ key:key});
        return function (target, propertyKey, parameterIndex) {
            //console.log("Instance");
            //console.log({ key:key, propertyKey: propertyKey,parameterIndex: parameterIndex });
            if (!target.methods) {
                target.methods = {};
            }
            var a = target.methods[propertyKey];
            if (!a) {
                a = [];
                target.methods[propertyKey] = a;
            }
            a[parameterIndex] = new WebAtoms.Rest.ServiceParameter(paramName, key);
        };
    };
}
var Path = parameterBuilder("Path");
var Query = parameterBuilder("Query");
var Body = parameterBuilder("Body");
var Post = methodBuilder("Post");
var WebAtoms;
(function (WebAtoms) {
    var Rest;
    (function (Rest) {
        var ServiceParameter = (function () {
            function ServiceParameter(type, key) {
                this.type = type.toLowerCase();
                this.key = key;
            }
            return ServiceParameter;
        }());
        Rest.ServiceParameter = ServiceParameter;
        var AjaxOptions = (function () {
            function AjaxOptions() {
            }
            return AjaxOptions;
        }());
        Rest.AjaxOptions = AjaxOptions;
        var BaseService = (function () {
            function BaseService() {
                //bs
                this.methods = {};
            }
            BaseService.prototype.encodeData = function (o) {
                o.type = "JSON";
                return o;
            };
            BaseService.prototype.invoke = function (url, method, bag, values) {
                return __awaiter(this, void 0, void 0, function () {
                    var options, i, p, v;
                    return __generator(this, function (_a) {
                        options = new AjaxOptions();
                        options.method = method;
                        for (i = 0; i < bag.length; i++) {
                            p = bag[i];
                            v = values[i];
                            switch (p.type) {
                                case 'path':
                                    url = url.replace("{" + p.key + "}", encodeURIComponent(v));
                                    break;
                                case 'query':
                                    if (url.indexOf('?') === -1) {
                                        url += "?";
                                    }
                                    url += "&" + p.key + "=" + encodeURIComponent(v);
                                    break;
                                case 'body':
                                    options.data = v;
                                    options = this.encodeData(options);
                                    break;
                            }
                        }
                        options.url = url;
                        return [2 /*return*/, Atom.json(url, options).toNativePromise()];
                    });
                });
            };
            return BaseService;
        }());
        Rest.BaseService = BaseService;
    })(Rest = WebAtoms.Rest || (WebAtoms.Rest = {}));
})(WebAtoms || (WebAtoms = {}));
