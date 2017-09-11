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
        if (this.onPropertyChanged) {
            this.onPropertyChanged(keyName);
        }
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
    var CancelToken = /** @class */ (function () {
        function CancelToken() {
            this.listeners = [];
        }
        Object.defineProperty(CancelToken.prototype, "cancelled", {
            get: function () {
                return this._cancelled;
            },
            enumerable: true,
            configurable: true
        });
        CancelToken.prototype.cancel = function () {
            this._cancelled = true;
            for (var _i = 0, _a = this.listeners; _i < _a.length; _i++) {
                var fx = _a[_i];
                fx();
            }
        };
        CancelToken.prototype.reset = function () {
            this._cancelled = false;
            this.listeners.length = 0;
        };
        CancelToken.prototype.registerForCancel = function (f) {
            if (this._cancelled) {
                f();
                this.cancel();
                return;
            }
            this.listeners.push(f);
        };
        return CancelToken;
    }());
    WebAtoms.CancelToken = CancelToken;
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
                        _this.busy = false;
                        if (error !== 'cancelled') {
                            console.error(error);
                            Atom.showError(error);
                        }
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
    var DisposableAction = /** @class */ (function () {
        function DisposableAction(f) {
            this.f = f;
        }
        DisposableAction.prototype.dispose = function () {
            this.f();
        };
        return DisposableAction;
    }());
    WebAtoms.DisposableAction = DisposableAction;
    var AtomUI = window["AtomUI"];
    var oldCreateControl = AtomUI.createControl;
    AtomUI.createControl = function (element, type, data, newScope) {
        if (type) {
            if (type.constructor === String || (typeof type) === 'string') {
                var t = WebAtoms[type] || Atom.get(window, type);
                if (t) {
                    type = t;
                }
            }
        }
        return oldCreateControl.call(Atom, element, type, data, newScope);
    };
    Atom.using = function (d, f) {
        try {
            f();
        }
        finally {
            d.dispose();
        }
    };
    Atom.usingAsync = function (d, f) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, , 2, 3]);
                        return [4 /*yield*/, f()];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        d.dispose();
                        return [7 /*endfinally*/];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // watch for changes...
    Atom.watch = function (item, property, f) {
        AtomBinder.add_WatchHandler(item, property, f);
        return new DisposableAction(function () {
            AtomBinder.remove_WatchHandler(item, property, f);
        });
    };
    Atom.delay = function (n, ct) {
        return new Promise(function (resolve, reject) {
            var t = setTimeout(function () {
                resolve();
            }, (n));
            if (ct) {
                ct.registerForCancel(function () {
                    clearTimeout(t);
                    reject("cancelled");
                });
            }
        });
    };
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
            var _this = this;
            var ary = this.bag[msg];
            if (!ary) {
                ary = new AtomHandler(msg);
                this.bag[msg] = ary;
            }
            ary.list.push(action);
            return new DisposableAction(function () {
                ary.list = ary.list.filter(function (a) { return a !== action; });
                if (!ary.list.length) {
                    _this.bag[msg] = null;
                }
            });
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
        AtomList.prototype.watch = function (f) {
            var _this = this;
            AtomBinder.add_CollectionChanged(this, f);
            return new WebAtoms.DisposableAction(function () {
                AtomBinder.remove_CollectionChanged(_this, f);
            });
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
            _this.setupWatchers();
            return _this;
        }
        AtomViewModel.prototype.setupWatchers = function () {
            //debugger;
            var vm = this.constructor.prototype;
            if (!vm._watchMethods)
                return;
            var wm = vm._watchMethods;
            for (var k in wm) {
                if (!vm.hasOwnProperty(k))
                    continue;
                var params = wm[k];
                var op = new WebAtoms.AtomWatcher(this, params, this[k]);
                this.registerDisposable(op);
            }
        };
        AtomViewModel.prototype.watch = function (item, property, f) {
            this.registerDisposable(Atom.watch(item, property, f));
        };
        AtomViewModel.prototype.registerDisposable = function (d) {
            this.disposables = this.disposables || [];
            this.disposables.push(d);
        };
        AtomViewModel.prototype.onPropertyChanged = function (name) {
        };
        AtomViewModel.prototype.onMessage = function (msg, a) {
            var action = function (m, d) {
                a(d);
            };
            var sub = WebAtoms.AtomDevice.instance.subscribe(msg, action);
            this.registerDisposable(sub);
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
            if (this.disposables) {
                for (var _i = 0, _a = this.disposables; _i < _a.length; _i++) {
                    var d = _a[_i];
                    d.dispose();
                }
            }
        };
        return AtomViewModel;
    }(WebAtoms.AtomModel));
    WebAtoms.AtomViewModel = AtomViewModel;
    var AtomWindowViewModel = /** @class */ (function (_super) {
        __extends(AtomWindowViewModel, _super);
        function AtomWindowViewModel() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        AtomWindowViewModel.prototype.close = function (result) {
            this.broadcast("atom-window-close:" + this.windowName, result);
        };
        AtomWindowViewModel.prototype.cancel = function () {
            this.broadcast("atom-window-cancel:" + this.windowName, null);
        };
        return AtomWindowViewModel;
    }(AtomViewModel));
    WebAtoms.AtomWindowViewModel = AtomWindowViewModel;
})(WebAtoms || (WebAtoms = {}));
var WebAtoms;
(function (WebAtoms) {
    var AtomErrors = /** @class */ (function () {
        function AtomErrors() {
        }
        AtomErrors.prototype.set = function (name, value) {
            this[name] = value;
            Atom.refresh(this, name);
        };
        AtomErrors.prototype.clear = function () {
            for (var k in this) {
                if (this.hasOwnProperty(k)) {
                    this[k] = null;
                    Atom.refresh(this, k);
                }
            }
        };
        return AtomErrors;
    }());
    WebAtoms.AtomErrors = AtomErrors;
    var ObjectProperty = /** @class */ (function () {
        function ObjectProperty(name) {
            this.name = name;
        }
        return ObjectProperty;
    }());
    WebAtoms.ObjectProperty = ObjectProperty;
    var AtomWatcher = /** @class */ (function () {
        function AtomWatcher(target, path, f) {
            this.target = target;
            this.path = path.map(function (x) { return x.split(".").map(function (y) { return new ObjectProperty(y); }); });
            this.func = f;
            this.evaluate();
        }
        AtomWatcher.prototype.evaluate = function () {
            var _this = this;
            var values = this.path.map(function (p) {
                var t = _this.target;
                return p.map(function (op) {
                    var tx = t;
                    t = Atom.get(t, op.name);
                    if (t !== op.target) {
                        if (op.watcher) {
                            op.watcher.dispose();
                        }
                        op.target = t;
                        if (tx) {
                            op.watcher = Atom.watch(tx, op.name, function () {
                                _this.evaluate();
                            });
                        }
                    }
                    return t;
                });
            });
            this.func.apply(this.target, values);
        };
        AtomWatcher.prototype.dispose = function () {
            for (var _i = 0, _a = this.path; _i < _a.length; _i++) {
                var p = _a[_i];
                for (var _b = 0, p_1 = p; _b < p_1.length; _b++) {
                    var op = p_1[_b];
                    if (op.watcher) {
                        op.watcher.dispose();
                    }
                }
            }
        };
        return AtomWatcher;
    }());
    WebAtoms.AtomWatcher = AtomWatcher;
})(WebAtoms || (WebAtoms = {}));
/**
 * Easy and Simple Dependency Injection
 */
var WebAtoms;
(function (WebAtoms) {
    var DIFactory = /** @class */ (function () {
        function DIFactory(key, factory) {
            this.factory = factory;
            this.key = key;
        }
        return DIFactory;
    }());
    var DI = /** @class */ (function () {
        function DI() {
        }
        DI.register = function (key, factory) {
            for (var _i = 0, _a = DI.factory; _i < _a.length; _i++) {
                var fx = _a[_i];
                if (fx.key === key)
                    return;
            }
            DI.factory.push(new DIFactory(key, factory));
        };
        DI.resolve = function (c) {
            var f = DI.factory.find(function (v) { return v.key === c; });
            if (!f) {
                throw new Error("No factory registered for " + c);
            }
            return f.factory();
        };
        DI.put = function (key, instance) {
            DI.instances[key] = instance;
        };
        DI.factory = [];
        DI.instances = {};
        return DI;
    }());
    WebAtoms.DI = DI;
    function DIGlobal() {
        return function (c) {
            DI.register(c, function () {
                var dr = DI.instances = DI.instances || {};
                var r = dr[c];
                if (r)
                    return r;
                var cx = c;
                var r = new cx();
                dr[c] = r;
                return r;
            });
            return c;
        };
    }
    WebAtoms.DIGlobal = DIGlobal;
    function DIAlwaysNew() {
        return function (c) {
            DI.register(c, function () {
                var r = new c();
                return r;
            });
            return c;
        };
    }
    WebAtoms.DIAlwaysNew = DIAlwaysNew;
})(WebAtoms || (WebAtoms = {}));
var DIGlobal = WebAtoms.DIGlobal();
var DIAlwaysNew = WebAtoms.DIAlwaysNew();
function methodBuilder(method) {
    return function (url) {
        return function (target, propertyKey, descriptor) {
            var a = target.methods[propertyKey];
            var oldFunction = descriptor.value;
            descriptor.value = function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                if (this.testMode) {
                    console.log("Test Mode: " + url);
                    var ro = oldFunction.apply(this, args);
                    if (ro) {
                        return ro;
                    }
                }
                var rn = null;
                if (target.methodReturns) {
                    rn = target.methodReturns[propertyKey];
                }
                var r = this.invoke(url, method, a, args, rn);
                return r;
            };
            //console.log("methodBuilder called");
            //console.log({ url: url, propertyKey: propertyKey,descriptor: descriptor });
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
var Body = parameterBuilder("Body")("");
var Post = methodBuilder("Post");
var Get = methodBuilder("Get");
var Delete = methodBuilder("Delete");
var Put = methodBuilder("Put");
var Cancel = function (target, propertyKey, parameterIndex) {
    if (!target.methods) {
        target.methods = {};
    }
    var a = target.methods[propertyKey];
    if (!a) {
        a = [];
        target.methods[propertyKey] = a;
    }
    a[parameterIndex] = new WebAtoms.Rest.ServiceParameter("cancel", "");
};
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
        var AtomPromise = window["AtomPromise"];
        var BaseService = /** @class */ (function () {
            function BaseService() {
                this.testMode = false;
                this.showProgress = true;
                this.showError = true;
                //bs
                this.methods = {};
                this.methodReturns = {};
            }
            BaseService.prototype.encodeData = function (o) {
                o.type = "JSON";
                return o;
            };
            BaseService.prototype.sendResult = function (result, error) {
                return __awaiter(this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        return [2 /*return*/, new Promise(function (resolve, reject) {
                                if (error) {
                                    setTimeout(function () {
                                        reject(error);
                                    }, 1);
                                    return;
                                }
                                setTimeout(function () {
                                    resolve(result);
                                }, 1);
                            })];
                    });
                });
            };
            BaseService.prototype.invoke = function (url, method, bag, values, returns) {
                return __awaiter(this, void 0, void 0, function () {
                    var _this = this;
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
                                case 'cancel':
                                    options.cancel = v;
                                    break;
                            }
                        }
                        options.url = url;
                        pr = AtomPromise.json(url, null, options);
                        if (options.cancel) {
                            options.cancel.registerForCancel(function () {
                                pr.abort();
                            });
                        }
                        return [2 /*return*/, new Promise(function (resolve, reject) {
                                pr.then(function () {
                                    var v = pr.value();
                                    // deep clone...
                                    //var rv = new returns();
                                    //reject("Clone pending");
                                    if (options.cancel) {
                                        if (options.cancel.cancelled) {
                                            reject("cancelled");
                                            return;
                                        }
                                    }
                                    resolve(v);
                                });
                                pr.failed(function () {
                                    reject(pr.error.msg);
                                });
                                pr.showError(_this.showError);
                                pr.showProgress(_this.showProgress);
                                pr.invoke("Ok");
                            })];
                    });
                });
            };
            return BaseService;
        }());
        Rest.BaseService = BaseService;
    })(Rest = WebAtoms.Rest || (WebAtoms.Rest = {}));
})(WebAtoms || (WebAtoms = {}));
var watch = function (name) {
    return function (target, propertyKey, i) {
        //debugger;
        var vm = target;
        if (!vm._watchMethods) {
            vm._watchMethods = {};
        }
        var a = vm._watchMethods[propertyKey]
            || (vm._watchMethods[propertyKey] = []);
        a[i] = name;
    };
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var WindowService = /** @class */ (function () {
    function WindowService() {
        this.lastWindowID = 1;
    }
    WindowService.prototype.alert = function (msg, title) {
        return this.showAlert(msg, title || "Message", false);
    };
    WindowService.prototype.confirm = function (msg, title) {
        return this.showAlert(msg, title || "Confirm", true);
    };
    WindowService.prototype.showAlert = function (msg, title, confirm) {
        return new Promise(function (resolve, reject) {
            var AtomUI = window["AtomUI"];
            var AtomWindow = window["WebAtoms"]["AtomWindow"];
            var d = { Message: msg, ConfirmValue: false, Confirm: confirm };
            var e = document.createElement("DIV");
            document.body.appendChild(e);
            var w = AtomUI.createControl(e, AtomWindow, d);
            w.set_windowWidth(380);
            w.set_windowHeight(120);
            w.set_windowTemplate(w.getTemplate("alertTemplate"));
            w.set_title(title);
            w.set_next(function () {
                w.dispose();
                //$(e).remove();
                e.remove();
                if (d.ConfirmValue) {
                    resolve(true);
                }
                else {
                    resolve(false);
                }
            });
            w.set_cancelNext(function () {
                w.dispose();
                //$(e).remove();
                e.remove();
                resolve(false);
            });
            w.refresh();
        });
    };
    WindowService.prototype.openWindow = function (windowType, viewModel) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        // if(modal === undefined){
                        //     modal = true;
                        // }
                        var windowDiv = document.createElement("div");
                        windowDiv.id = "atom_window_" + _this.lastWindowID++;
                        var atomApplication = window["atomApplication"];
                        var AtomUI = window["AtomUI"];
                        atomApplication._element.appendChild(windowDiv);
                        if (windowType instanceof String) {
                            windowType = window[windowType];
                        }
                        var windowCtrl = AtomUI.createControl(windowDiv, windowType);
                        var closeSubscription = WebAtoms.AtomDevice.instance.subscribe("atom-window-close:" + windowDiv.id, function (g, i) {
                            if (i !== undefined) {
                                Atom.set(windowCtrl, "value", i);
                            }
                            windowCtrl.closeCommand();
                        });
                        var cancelSubscription = WebAtoms.AtomDevice.instance.subscribe("atom-window-cancel:" + windowDiv.id, function (g, i) {
                            windowCtrl.cancelCommand();
                        });
                        windowDiv.setAttribute("atom-local-scope", "true");
                        windowCtrl.init();
                        var dispatcher = WebAtoms["dispatcher"];
                        if (viewModel !== undefined) {
                            Atom.set(windowCtrl, "viewModel", viewModel);
                        }
                        windowCtrl.set_next(function () {
                            cancelSubscription.dispose();
                            closeSubscription.dispose();
                            try {
                                resolve(windowCtrl.get_value());
                            }
                            catch (e) {
                                console.error(e);
                            }
                            dispatcher.callLater(function () {
                                windowCtrl.dispose();
                                windowDiv.remove();
                            });
                        });
                        windowCtrl.set_cancelNext(function () {
                            cancelSubscription.dispose();
                            closeSubscription.dispose();
                            try {
                                reject("cancelled");
                            }
                            catch (e) {
                                console.error(e);
                            }
                            dispatcher.callLater(function () {
                                windowCtrl.dispose();
                                windowDiv.remove();
                            });
                        });
                        dispatcher.callLater(function () {
                            var scope = windowCtrl.get_scope();
                            var vm = windowCtrl.get_viewModel();
                            if (vm) {
                                vm.windowName = windowDiv.id;
                            }
                            windowCtrl.openWindow(scope, null);
                        });
                    })];
            });
        });
    };
    WindowService = __decorate([
        DIGlobal
    ], WindowService);
    return WindowService;
}());
//# sourceMappingURL=web-atoms-mvvm.js.map