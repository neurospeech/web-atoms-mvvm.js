var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
function bindableProperty(target, key) {
    var Atom = window["Atom"];
    // property value
    var _val = this[key];
    var keyName = "_" + key;
    this[keyName] = _val;
    // property getter
    var getter = function () {
        //console.log(`Get: ${key} => ${_val}`);
        return this[keyName];
    };
    // property setter
    var setter = function (newVal) {
        //console.log(`Set: ${key} => ${newVal}`);
        this[keyName] = newVal;
        Atom.refresh(this, key);
    };
    // Delete property.
    if (delete this[key]) {
        // Create new property with getter and setter
        Object.defineProperty(target, key, {
            get: getter,
            set: setter,
            enumerable: true,
            configurable: true
        });
    }
}
var WebAtoms;
(function (WebAtoms) {
    var Atom = window["Atom"];
    var AtomModel = /** @class */ (function () {
        function AtomModel() {
        }
        AtomModel.prototype.refresh = function (name) {
            Atom.refresh(this, name);
        };
        return AtomModel;
    }());
    WebAtoms.AtomModel = AtomModel;
    var AtomCommand = /** @class */ (function (_super) {
        __extends(AtomCommand, _super);
        function AtomCommand(action) {
            var _this = _super.call(this) || this;
            _this.isMVVMAtomCommand = true;
            _this._enabled = true;
            _this._busy = false;
            _this.action = action;
            var self = _this;
            _this.execute = function (p) {
                if (_this.enabled) {
                    _this.executeAction(p);
                }
            };
            return _this;
        }
        Object.defineProperty(AtomCommand.prototype, "enabled", {
            get: function () {
                return this._enabled;
            },
            set: function (v) {
                this._enabled = v;
                this.refresh("enabled");
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AtomCommand.prototype, "busy", {
            get: function () {
                return this._busy;
            },
            set: function (v) {
                this._busy = v;
                this.refresh("busy");
            },
            enumerable: true,
            configurable: true
        });
        AtomCommand.prototype.executeAction = function (p) {
            var _this = this;
            if (this._busy)
                return;
            this.busy = true;
            var result = this.action(p);
            if (result) {
                if (result.catch) {
                    result.catch(function (error) {
                        console.error(error);
                        Atom.showError(error);
                        _this.busy = false;
                    });
                    return;
                }
                if (result.then) {
                    result.then(function () {
                        _this.busy = false;
                    });
                    return;
                }
            }
            this.busy = false;
        };
        return AtomCommand;
    }(AtomModel));
    WebAtoms.AtomCommand = AtomCommand;
})(WebAtoms || (WebAtoms = {}));
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
var WebAtoms;
(function (WebAtoms) {
    var Atom = window["Atom"];
    var AtomBinder = window["AtomBinder"];
    var AtomPromise = window["AtomPromise"];
    var AtomHandler = /** @class */ (function () {
        function AtomHandler(message) {
            this.message = message;
            this.list = new Array();
        }
        return AtomHandler;
    }());
    var AtomMessageAction = /** @class */ (function () {
        function AtomMessageAction(msg, a) {
            this.message = msg;
            this.action = a;
        }
        return AtomMessageAction;
    }());
    WebAtoms.AtomMessageAction = AtomMessageAction;
    var AtomDevice = /** @class */ (function () {
        function AtomDevice() {
            this.bag = {};
        }
        AtomDevice.prototype.runAsync = function (task) {
            return __awaiter(this, void 0, void 0, function () {
                var error_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, task];
                        case 1:
                            _a.sent();
                            return [3 /*break*/, 3];
                        case 2:
                            error_1 = _a.sent();
                            console.error(error_1);
                            Atom.showError(error_1);
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            });
        };
        AtomDevice.prototype.broadcast = function (msg, data) {
            var ary = this.bag[msg];
            if (!ary)
                return;
            for (var _i = 0, _a = ary.list; _i < _a.length; _i++) {
                var entry = _a[_i];
                entry.call(this, msg, data);
            }
        };
        AtomDevice.prototype.subscribe = function (msg, action) {
            var ary = this.bag[msg];
            if (!ary) {
                ary = new AtomHandler(msg);
                this.bag[msg] = ary;
            }
            ary.list.push(action);
            return action;
        };
        AtomDevice.prototype.unsubscribe = function (msg, action) {
            var ary = this.bag[msg];
            if (!ary) {
                return;
            }
            ary.list = ary.list.filter(function (a) { return a !== action; });
        };
        AtomDevice.instance = new AtomDevice();
        return AtomDevice;
    }());
    WebAtoms.AtomDevice = AtomDevice;
})(WebAtoms || (WebAtoms = {}));
var WebAtoms;
(function (WebAtoms) {
    var AtomBinder = window["AtomBinder"];
    var AtomPromise = window["AtomPromise"];
    var AtomList = /** @class */ (function (_super) {
        __extends(AtomList, _super);
        function AtomList() {
            var _this = _super.call(this) || this;
            _this["__proto__"] = AtomList.prototype;
            return _this;
        }
        AtomList.prototype.add = function (item) {
            var i = this.length;
            var n = this.push(item);
            AtomBinder.invokeItemsEvent(this, "add", i, item);
            Atom.refresh(this, "length");
            return n;
        };
        AtomList.prototype.addAll = function (items) {
            for (var _i = 0, items_1 = items; _i < items_1.length; _i++) {
                var item = items_1[_i];
                var i = this.length;
                this.push(item);
                AtomBinder.invokeItemsEvent(this, "add", i, item);
                Atom.refresh(this, "length");
            }
        };
        AtomList.prototype.insert = function (i, item) {
            var n = this.splice(i, 0, item);
            AtomBinder.invokeItemsEvent(this, "add", i, item);
            Atom.refresh(this, "length");
        };
        AtomList.prototype.removeAt = function (i) {
            var item = this[i];
            this.splice(i, 1);
            AtomBinder.invokeItemsEvent(this, "remove", i, item);
            Atom.refresh(this, "length");
        };
        AtomList.prototype.remove = function (item) {
            var n = this.indexOf(item);
            if (n != -1) {
                this.removeAt(n);
            }
        };
        AtomList.prototype.clear = function () {
            this.length = 0;
            this.refresh();
        };
        AtomList.prototype.refresh = function () {
            AtomBinder.invokeItemsEvent(this, "refresh", -1, null);
            Atom.refresh(this, "length");
        };
        return AtomList;
    }(Array));
    WebAtoms.AtomList = AtomList;
})(WebAtoms || (WebAtoms = {}));
/// <reference path="atom-device.ts"/>
/// <reference path="atom-command.ts"/>
var WebAtoms;
(function (WebAtoms) {
    var AtomViewModel = /** @class */ (function (_super) {
        __extends(AtomViewModel, _super);
        function AtomViewModel() {
            var _this = _super.call(this) || this;
            WebAtoms.AtomDevice.instance.runAsync(_this.init());
            return _this;
        }
        AtomViewModel.prototype.onMessage = function (msg, a) {
            var action = function (m, d) {
                a(d);
            };
            WebAtoms.AtomDevice.instance.subscribe(msg, action);
            this.subscriptions = this.subscriptions || new Array();
            this.subscriptions.push(new WebAtoms.AtomMessageAction(msg, action));
        };
        AtomViewModel.prototype.broadcast = function (msg, data) {
            WebAtoms.AtomDevice.instance.broadcast(msg, data);
        };
        AtomViewModel.prototype.init = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/];
                });
            });
        };
        AtomViewModel.prototype.dispose = function () {
            if (this.subscriptions) {
                for (var _i = 0, _a = this.subscriptions; _i < _a.length; _i++) {
                    var entry = _a[_i];
                    WebAtoms.AtomDevice.instance.unsubscribe(entry.message, entry.action);
                }
            }
        };
        return AtomViewModel;
    }(WebAtoms.AtomModel));
    WebAtoms.AtomViewModel = AtomViewModel;
})(WebAtoms || (WebAtoms = {}));
/**
 * Easy and Simple Dependency Injection
 */
var WebAtoms;
(function (WebAtoms) {
    var DI = /** @class */ (function () {
        function DI() {
        }
        return DI;
    }());
    WebAtoms.DI = DI;
})(WebAtoms || (WebAtoms = {}));
function methodBuilder(method) {
    return function (url) {
        return function (target, propertyKey, descriptor) {
            var a = target.methods[propertyKey];
            descriptor.value = function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                //console.log("methodBuilder executed");
                var rn = target.methodReturns[propertyKey];
                var r = target.invoke(url, method, a, args, rn);
                //console.log(r);
                return r;
            };
            //console.log("methodBuilder called");
            console.log({ url: url, propertyKey: propertyKey, descriptor: descriptor });
        };
    };
}
function Return(type) {
    return function (target, propertyKey, descriptor) {
        if (!target.methodReturns) {
            target.methodReturns = {};
        }
        target.methodReturns[propertyKey] = type;
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
var Get = methodBuilder("Get");
var Delete = methodBuilder("Delete");
var Put = methodBuilder("Put");
var WebAtoms;
(function (WebAtoms) {
    var Rest;
    (function (Rest) {
        var ServiceParameter = /** @class */ (function () {
            function ServiceParameter(type, key) {
                this.type = type.toLowerCase();
                this.key = key;
            }
            return ServiceParameter;
        }());
        Rest.ServiceParameter = ServiceParameter;
        var AjaxOptions = /** @class */ (function () {
            function AjaxOptions() {
            }
            return AjaxOptions;
        }());
        Rest.AjaxOptions = AjaxOptions;
        var BaseService = /** @class */ (function () {
            function BaseService() {
                //bs
                this.methods = {};
                this.methodReturns = {};
            }
            BaseService.prototype.encodeData = function (o) {
                o.type = "JSON";
                return o;
            };
            BaseService.prototype.invoke = function (url, method, bag, values, returns) {
                return __awaiter(this, void 0, void 0, function () {
                    var options, i, p, v, pr;
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
                        pr = Atom.json(url, options);
                        pr.invoke("Ok");
                        return [2 /*return*/, new Promise(function (resolve, reject) {
                                pr.then(function () {
                                    var v = pr.value();
                                    // deep clone...
                                    var rv = new returns();
                                    reject("Clone pending");
                                    //resolve(v);
                                });
                                pr.failed(function (e) {
                                    reject(e);
                                });
                            })];
                    });
                });
            };
            return BaseService;
        }());
        Rest.BaseService = BaseService;
    })(Rest = WebAtoms.Rest || (WebAtoms.Rest = {}));
})(WebAtoms || (WebAtoms = {}));
//# sourceMappingURL=web-atoms-mvvm.js.map