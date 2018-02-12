// tslint:disable
function classCreator__(name, basePrototype, classConstructor, classPrototype, classProperties, thisPrototype, thisProperties) {
    var baseClass = basePrototype ? basePrototype.constructor : null;
    var old = classConstructor || (function () { });
    var cp = classProperties;
    var f = null;
    if (baseClass) {
        if (classProperties) {
            f = function () {
                this.constructor = classPrototype;
                for (var k in cp) {
                    this["_" + k] = cp[k];
                }
                baseClass.apply(this, arguments);
                this.__typeName = name;
                //var cp = Atom.clone(classProperties);
                old.apply(this, arguments);
            };
        }
        else {
            f = function () {
                this.constructor = classPrototype;
                baseClass.apply(this, arguments);
                this.__typeName = name;
                old.apply(this, arguments);
            };
        }
        var bpt = baseClass.prototype;
        // extend
        for (var k in bpt) {
            if (classPrototype[k])
                continue;
            if (bpt.hasOwnProperty(k)) {
                var pd = Object.getOwnPropertyDescriptor(bpt, k);
                if (!pd) {
                    classPrototype[k] = bpt[k];
                }
                else {
                    Object.defineProperty(classPrototype, k, pd);
                }
            }
        }
    }
    else {
        if (classProperties) {
            f = function () {
                this.__typeName = name;
                //var cp = Atom.clone(classProperties);
                for (var k in cp) {
                    this["_" + k] = cp[k];
                }
                old.apply(this, arguments);
            };
        }
        else {
            f = function () {
                this.__typeName = name;
                old.apply(this, arguments);
            };
        }
    }
    if (classProperties) {
        for (var k in classProperties) {
            if (!classPrototype["get_" + k]) {
                classPrototype["get_" + k] = createProperty("_" + k, true);
            }
            if (!classPrototype["set_" + k]) {
                classPrototype["set_" + k] = createProperty("_" + k);
            }
        }
    }
    for (var k in classPrototype) {
        if (/^get\_/.test(k)) {
            var gx = classPrototype[k];
            var nx = k.substr(4);
            var sx = classPrototype["set_" + nx];
            Object.defineProperty(classPrototype, nx, {
                get: gx,
                set: sx ? createProperty("_" + nx, false, nx) : undefined,
                enumerable: true,
                configurable: true
            });
        }
    }
    f.__typeName = name;
    if (baseClass) {
        f.__baseType = baseClass;
        // var fx = f;
        // function __() {
        //     var args = [];
        //     for (var _i = 0; _i < arguments.length; _i++) {
        //         args[_i] = arguments[_i];
        //     }
        //     fx.call(this, args);
        //     this.constructor = classPrototype;
        // }
        // __.prototype = basePrototype;
        // f = new __();
        f.prototype = basePrototype;
        f = new f();
    }
    else {
        f.prototype = classPrototype;
        f.prototype.constructor = f;
    }
    //f.constructor = classPrototype;
    if (!classPrototype.hasOwnProperty("toString")) {
        f.prototype.toString = function () {
            return name;
        };
    }
    mapLibrary(/\./.test(name) ? name : 'WebAtoms.' + name, window, f);
    return f;
}
;
/**
 * Easy and Simple Dependency Injection
 */
var WebAtoms;
(function (WebAtoms) {
    var DIFactory = /** @class */ (function () {
        function DIFactory(key, factory, transient) {
            this.transient = transient;
            this.factory = factory;
            this.key = key;
        }
        DIFactory.prototype.resolve = function () {
            if (this.transient) {
                return this.factory();
            }
            return this.instance || (this.instance = this.factory());
        };
        DIFactory.prototype.push = function (factory, transient) {
            this.stack = this.stack || [];
            this.stack.push({
                factory: this.factory,
                instance: this.instance,
                transient: this.transient
            });
            this.transient = transient;
            this.instance = undefined;
            this.factory = factory;
        };
        DIFactory.prototype.pop = function () {
            if (!(this.stack && this.stack.length)) {
                throw new Error("Stack in DIFactory is empty");
            }
            var obj = this.stack.pop();
            this.factory = obj.factory;
            this.transient = obj.transient;
            this.instance = obj.instance;
        };
        return DIFactory;
    }());
    /**
     * @export
     * @class DI
     */
    var DI = /** @class */ (function () {
        function DI() {
        }
        /**
         * @static
         * @template T
         * @param {new () => T} key
         * @param {() => T} factory
         * @param {boolean} [transient=false] - If true, always new instance will be created
         * @memberof DI
         */
        DI.register = function (key, factory, transient) {
            if (transient === void 0) { transient = false; }
            var k = key;
            var existing = DI.factory[k];
            if (existing) {
                throw new Error("Factory for " + key.name + " is already registered");
            }
            DI.factory[k] = new DIFactory(key, factory, transient);
        };
        /**
         * @static
         * @template T
         * @param {new () => T} c
         * @returns {T}
         * @memberof DI
         */
        DI.resolve = function (c) {
            var f = DI.factory[c];
            if (!f) {
                throw new Error("No factory registered for " + c);
            }
            return f.resolve();
        };
        /**
         * Use this for unit testing, this will push existing
         * DI factory and all instances will be resolved with
         * given instance
         *
         * @static
         * @param {*} key
         * @param {*} instance
         * @memberof DI
         */
        DI.push = function (key, instance) {
            var f = DI.factory[key];
            if (!f) {
                DI.register(key, function () { return instance; });
            }
            else {
                f.push(function () { return instance; }, true);
            }
        };
        /**
         * @static
         * @param {*} key
         * @memberof DI
         */
        DI.pop = function (key) {
            var f = DI.factory[key];
            if (f) {
                f.pop();
            }
        };
        DI.factory = {};
        return DI;
    }());
    WebAtoms.DI = DI;
    /**
     * This decorator will register given class as singleton instance on DI.
     * @example
     *      @DIGlobal
     *      class BackendService{
     *      }
     * @export
     * @param {new () => any} c
     * @returns
     */
    function DIGlobal(c) {
        DI.register(c, function () { return new c(); });
        return c;
    }
    WebAtoms.DIGlobal = DIGlobal;
    /**
     * This decorator will register given class as transient instance on DI.
     * @example
     *      @DIAlwaysNew
     *      class StringHelper{
     *      }
     * @export
     * @param {new () => any} c
     * @returns
     */
    function DIAlwaysNew(c) {
        DI.register(c, function () { return new c(); }, true);
        return c;
    }
    WebAtoms.DIAlwaysNew = DIAlwaysNew;
})(WebAtoms || (WebAtoms = {}));
var DIGlobal = WebAtoms.DIGlobal;
var DIAlwaysNew = WebAtoms.DIAlwaysNew;
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
if (location) {
    Atom.designMode = /file/i.test(location.protocol);
}
/**
 * This decorator will mark given property as bindable, it will define
 * getter and setter, and in the setter, it will refresh the property.
 *
 *      class Customer{
 *
 *          @bindableProperty
 *          firstName:string;
 *
 *      }
 *
 * @param {*} target
 * @param {string} key
 */
function bindableProperty(target, key) {
    // property value
    var _val = this[key];
    var keyName = "_" + key;
    this[keyName] = _val;
    // property getter
    var getter = function () {
        // console.log(`Get: ${key} => ${_val}`);
        return this[keyName];
    };
    // property setter
    var setter = function (newVal) {
        // console.log(`Set: ${key} => ${newVal}`);
        // debugger;
        var oldValue = this[keyName];
        // tslint:disable-next-line:triple-equals
        if (oldValue == newVal) {
            return;
        }
        this[keyName] = newVal;
        var c = this._$_supressRefresh;
        if (!(c && c[key])) {
            Atom.refresh(this, key);
        }
        if (this.onPropertyChanged) {
            this.onPropertyChanged(key);
        }
    };
    // delete property
    if (delete this[key]) {
        // create new property with getter and setter
        Object.defineProperty(target, key, {
            get: getter,
            set: setter,
            enumerable: true,
            configurable: true
        });
        // tslint:disable-next-line:no-string-literal
        if (target.constructor.prototype["get_atomParent"]) {
            target["get_" + key] = getter;
            target["set_" + key] = setter;
        }
    }
}
Atom.bindable = function (e) {
    if (!e) {
        return e;
    }
    if (e instanceof Array) {
        throw new TypeError("Invalid object, try to use AtomList instead of Atom.bindable");
    }
    if (typeof e === "string" || e.constructor === String) {
        return e;
    }
    if (typeof e === "number" || e.constructor === Number) {
        return e;
    }
    if (e.constructor === Date) {
        return e;
    }
    var self = e;
    if (e._$_isBindable) {
        return e;
    }
    var keys = Object.keys(e);
    e._$_isBindable = true;
    for (var _i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
        var key = keys_1[_i];
        var k = key;
        var v = e[key];
        var vk = "_" + key;
        e[vk] = v;
        delete e[key];
        Object.defineProperty(e, key, {
            get: function () { return this[vk]; },
            set: function (v) {
                this[vk] = v;
                Atom.refresh(this, k);
            },
            enumerable: true
        });
    }
    return e;
};
var WebAtoms;
(function (WebAtoms) {
    /**
     *
     *
     * @export
     * @class CancelToken
     */
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
    /**
     * Though you can directly call methods of view model in binding expression,
     * but we recommend using AtomCommand for two reasons.
     *
     * First one, it has enabled bindable property, which can be used to enable/disable UI.
     * AtomButton already has `command` and `commandParameter` property which automatically
     * binds execution and disabling the UI.
     *
     * Second one, it has busy bindable property, which can be used to display a busy indicator
     * when corresponding action is a promise and it is yet not resolved.
     *
     * @export
     * @class AtomCommand
     * @extends {AtomModel}
     * @template T
     */
    var AtomCommand = /** @class */ (function (_super) {
        __extends(AtomCommand, _super);
        function AtomCommand(action) {
            var _this = _super.call(this) || this;
            _this.isMVVMAtomCommand = true;
            _this._enabled = true;
            _this._busy = false;
            _this.action = action;
            _this.execute = function (p) {
                if (_this.enabled) {
                    _this.executeAction(p);
                }
            };
            return _this;
        }
        Object.defineProperty(AtomCommand.prototype, "enabled", {
            /**
             *
             *
             * @type {boolean}
             * @memberof AtomCommand
             */
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
            /**
             *
             *
             * @type {boolean}
             * @memberof AtomCommand
             */
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
            if (this._busy) {
                return;
            }
            this.busy = true;
            var result = this.action(p);
            if (result) {
                if (result.catch) {
                    result.catch(function (error) {
                        _this.busy = false;
                        if (error !== "cancelled") {
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
    /**
     * DisposableAction holds an action that
     * will be executed when dispose will be called.
     *
     *      subscribe(m,f):AtomDisposable{
     *          //...
     *          //subscribe to something...
     *          //...
     *          return new AtomDisposable(()=>{
     *
     *              //...
     *              //unsubscribe from something
     *              //
     *
     *          });
     *      }
     *
     * User can simply call dispose to make sure subscription was unsubscribed.
     *
     * @export
     * @class DisposableAction
     * @implements {AtomDisposable}
     */
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
    // tslint:disable-next-line
    var AtomUI = window["AtomUI"];
    // tslint:disable-next-line
    var oldCreateControl = AtomUI.createControl;
    // tslint:disable-next-line
    AtomUI.createControl = function (element, type, data, newScope) {
        if (type) {
            if (type.constructor === String || (typeof type) === "string") {
                var t = WebAtoms[type] || Atom.get(window, type);
                if (t) {
                    type = t;
                }
            }
        }
        return oldCreateControl.call(Atom, element, type, data, newScope);
    };
    Atom.post = function (f) {
        WebAtoms.dispatcher.callLater(f);
    };
    Atom.postAsync = function (f) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            WebAtoms.dispatcher.callLater(function () { return __awaiter(_this, void 0, void 0, function () {
                var p, e_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 3, , 4]);
                            p = f();
                            if (!(p && p.then && p.catch)) return [3 /*break*/, 2];
                            return [4 /*yield*/, p];
                        case 1:
                            _a.sent();
                            _a.label = 2;
                        case 2:
                            resolve();
                            return [3 /*break*/, 4];
                        case 3:
                            e_1 = _a.sent();
                            reject(e_1);
                            return [3 /*break*/, 4];
                        case 4: return [2 /*return*/];
                    }
                });
            }); });
        });
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
    /**
     * Device (usually browser), instance of which supports
     * singleton instance to provide broadcast/messaging
     *
     * @export
     * @class AtomDevice
     */
    var AtomDevice = /** @class */ (function () {
        function AtomDevice() {
            this.bag = {};
        }
        /**
         * This method will run any asynchronous method
         * and it will display an error if it will fail
         * asynchronously
         *
         * @template T
         * @param {() => Promise<T>} tf
         * @memberof AtomDevice
         */
        AtomDevice.prototype.runAsync = function (tf) {
            var task = tf();
            task.catch(function (error) {
                console.error(error);
                Atom.showError(error);
            });
            // tslint:disable-next-line
            task.then(function () { });
        };
        /**
         * Broadcast given data to channel, only within the current window.
         *
         * @param {string} channel
         * @param {*} data
         * @returns
         * @memberof AtomDevice
         */
        AtomDevice.prototype.broadcast = function (channel, data) {
            var ary = this.bag[channel];
            if (!ary) {
                return;
            }
            for (var _i = 0, _a = ary.list; _i < _a.length; _i++) {
                var entry = _a[_i];
                entry.call(this, channel, data);
            }
        };
        /**
         * Subscribe for given channel with action that will be
         * executed when anyone will broadcast (this only works within the
         * current browser window)
         *
         * This method returns a disposable, when you call `.dispose()` it will
         * unsubscribe for current subscription
         *
         * @param {string} channel
         * @param {AtomAction} action
         * @returns {AtomDisposable} Disposable that supports removal of subscription
         * @memberof AtomDevice
         */
        AtomDevice.prototype.subscribe = function (channel, action) {
            var _this = this;
            var ary = this.bag[channel];
            if (!ary) {
                ary = new AtomHandler(channel);
                this.bag[channel] = ary;
            }
            ary.list.push(action);
            return new DisposableAction(function () {
                ary.list = ary.list.filter(function (a) { return a !== action; });
                if (!ary.list.length) {
                    _this.bag[channel] = null;
                }
            });
        };
        /**
         *
         *
         * @static
         * @type {AtomDevice}
         * @memberof AtomDevice
         */
        AtomDevice.instance = new AtomDevice();
        return AtomDevice;
    }());
    WebAtoms.AtomDevice = AtomDevice;
})(WebAtoms || (WebAtoms = {}));
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var WebAtoms;
(function (WebAtoms) {
    var AtomPageView = /** @class */ (function (_super) {
        __extends(AtomPageView, _super);
        function AtomPageView(e) {
            var _this = _super.call(this, e) || this;
            _this.disposables = [];
            _this.stack = [];
            _this.keepStack = true;
            _this.current = null;
            _this.currentDisposable = null;
            e.style.position = "relative";
            _this.backCommand = function () {
                _this.onBackCommand();
            };
            return _this;
        }
        AtomPageView.prototype.onBackCommand = function () {
            if (!this.stack.length) {
                console.warn("FrameStack is empty !!");
                return;
            }
            var ctrl = this.current;
            var e = ctrl._element;
            // tslint:disable-next-line:no-string-literal
            ctrl.dispose();
            e.remove();
            this.current = this.stack.pop();
            this.current._element.style.display = "";
        };
        AtomPageView.prototype.canChange = function () {
            return __awaiter(this, void 0, void 0, function () {
                var ctrl, vm;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!this.current) {
                                return [2 /*return*/, true];
                            }
                            ctrl = this.current;
                            vm = ctrl.viewModel;
                            if (!vm.closeWarning) return [3 /*break*/, 2];
                            return [4 /*yield*/, WebAtoms.WindowService.instance.confirm(vm.closeWarning, "Are you sure?")];
                        case 1:
                            if (_a.sent()) {
                                return [2 /*return*/, true];
                            }
                            return [2 /*return*/, false];
                        case 2: return [2 /*return*/, true];
                    }
                });
            });
        };
        AtomPageView.prototype.push = function (ctrl) {
            if (this.current) {
                if (this.keepStack) {
                    this.current._element.style.display = "none";
                    this.stack.push(this.current);
                }
                else {
                    var c1 = this.current;
                    var e = c1._element;
                    c1.dispose();
                    e.remove();
                }
            }
            var element = ctrl._element;
            element.style.position = "absolute";
            element.style.top =
                element.style.bottom =
                    element.style.left =
                        element.style.right = "0";
            this._element.appendChild(element);
            this.current = ctrl;
        };
        AtomPageView.prototype.init = function () {
            var _this = this;
            _super.prototype.init.call(this);
            this.disposables.push(Atom.watch(this, "url", function () {
                _this.load(_this.url);
            }));
        };
        AtomPageView.prototype.dispose = function (e) {
            _super.prototype.dispose.call(this, e);
            if (!e) {
                for (var _i = 0, _a = this.disposables; _i < _a.length; _i++) {
                    var d = _a[_i];
                    d.dispose();
                }
                this.disposables = [];
            }
        };
        AtomPageView.prototype.createControl = function (c, vmt) {
            var div = document.createElement("div");
            div.id = this._element.id + "_" + (this.stack.length + 1);
            var ctrl = new (c)(div);
            var vm = null;
            if (vmt) {
                vm = new (vmt)();
                Atom.post(function () {
                    ctrl.viewModel = vm;
                });
            }
            return ctrl;
        };
        AtomPageView.prototype.load = function (url) {
            return __awaiter(this, void 0, void 0, function () {
                var _this = this;
                var uri, fragments, scope, vm, _i, fragments_1, f, ctrl;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.canChange()];
                        case 1:
                            if (!(_a.sent())) {
                                return [2 /*return*/];
                            }
                            uri = new AtomUri(url);
                            fragments = uri.path.split(/(\/|\.)/)
                                .map(function (f) { return _this.toUpperCase(f); });
                            scope = window;
                            vm = null;
                            for (_i = 0, fragments_1 = fragments; _i < fragments_1.length; _i++) {
                                f = fragments_1[_i];
                                vm = scope[f + "ViewModel"];
                                scope = scope[f];
                                if (!scope) {
                                    throw new Error("No " + f + " in " + url + " found.");
                                }
                            }
                            ctrl = this.createControl(scope, vm);
                            Atom.post(function () {
                                var q = uri.query;
                                vm = ctrl.viewModel;
                                if (vm) {
                                    if (q) {
                                        for (var k in q) {
                                            if (q.hasOwnProperty(k)) {
                                                var v = q[k];
                                                vm[k] = v;
                                            }
                                        }
                                    }
                                    if (vm instanceof WebAtoms.AtomPageViewModel) {
                                        var pvm = vm;
                                        pvm.pageId = ctrl._element.id;
                                    }
                                }
                            });
                            this.push(ctrl);
                            return [2 /*return*/];
                    }
                });
            });
        };
        AtomPageView.prototype.toUpperCase = function (s) {
            return s.split("-")
                .filter(function (t) { return t; })
                .map(function (t) { return t.substr(0, 1).toUpperCase() + t.substr(1); })
                .join("");
        };
        __decorate([
            bindableProperty
        ], AtomPageView.prototype, "url", void 0);
        __decorate([
            bindableProperty
        ], AtomPageView.prototype, "keepStack", void 0);
        __decorate([
            bindableProperty
        ], AtomPageView.prototype, "current", void 0);
        return AtomPageView;
    }(WebAtoms.AtomControl));
    WebAtoms.AtomPageView = AtomPageView;
})(WebAtoms || (WebAtoms = {}));
var WebAtoms;
(function (WebAtoms) {
    /**
     *
     *
     * @export
     * @class AtomList
     * @extends {Array<T>}
     * @template T
     */
    var AtomList = /** @class */ (function (_super) {
        __extends(AtomList, _super);
        function AtomList() {
            var _this = _super.call(this) || this;
            // tslint:disable-next-line
            _this["__proto__"] = AtomList.prototype;
            return _this;
        }
        /**
         * Adds the item in the list and refresh bindings
         * @param {T} item
         * @returns {number}
         * @memberof AtomList
         */
        AtomList.prototype.add = function (item) {
            var i = this.length;
            var n = this.push(item);
            AtomBinder.invokeItemsEvent(this, "add", i, item);
            Atom.refresh(this, "length");
            return n;
        };
        /**
         * Add given items in the list and refresh bindings
         * @param {Array<T>} items
         * @memberof AtomList
         */
        AtomList.prototype.addAll = function (items) {
            for (var _i = 0, items_1 = items; _i < items_1.length; _i++) {
                var item = items_1[_i];
                var i = this.length;
                this.push(item);
                AtomBinder.invokeItemsEvent(this, "add", i, item);
                Atom.refresh(this, "length");
            }
        };
        /**
         * Inserts given number in the list at position `i`
         * and refreshes the bindings.
         * @param {number} i
         * @param {T} item
         * @memberof AtomList
         */
        AtomList.prototype.insert = function (i, item) {
            var n = this.splice(i, 0, item);
            AtomBinder.invokeItemsEvent(this, "add", i, item);
            Atom.refresh(this, "length");
        };
        /**
         * Removes item at given index i and refresh the bindings
         * @param {number} i
         * @memberof AtomList
         */
        AtomList.prototype.removeAt = function (i) {
            var item = this[i];
            this.splice(i, 1);
            AtomBinder.invokeItemsEvent(this, "remove", i, item);
            Atom.refresh(this, "length");
        };
        /**
         * Removes given item or removes all items that match
         * given lambda as true and refresh the bindings
         * @param {(T | ((i:T) => boolean))} item
         * @returns {boolean} `true` if any item was removed
         * @memberof AtomList
         */
        AtomList.prototype.remove = function (item) {
            if (item instanceof Function) {
                var index = 0;
                var removed = false;
                for (var _i = 0, _a = this; _i < _a.length; _i++) {
                    var it = _a[_i];
                    if (item(it)) {
                        this.removeAt(index);
                        removed = true;
                    }
                    index++;
                }
                return removed;
            }
            var n = this.indexOf(item);
            if (n !== -1) {
                this.removeAt(n);
                return true;
            }
            return false;
        };
        /**
         * Removes all items from the list and refreshes the bindings
         * @memberof AtomList
         */
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
    // tslint:disable
    Array.prototype["add"] = AtomList.prototype.add;
    Array.prototype["addAll"] = AtomList.prototype.addAll;
    Array.prototype["clear"] = AtomList.prototype.clear;
    Array.prototype["refresh"] = AtomList.prototype.refresh;
    Array.prototype["remove"] = AtomList.prototype.remove;
    Array.prototype["removeAt"] = AtomList.prototype.removeAt;
    Array.prototype["watch"] = AtomList.prototype.watch;
})(WebAtoms || (WebAtoms = {}));
/// <reference path="atom-device.ts"/>
/// <reference path="atom-command.ts"/>
var WebAtoms;
(function (WebAtoms) {
    /**
     *
     *
     * @export
     * @class AtomViewModel
     * @extends {AtomModel}
     */
    var AtomViewModel = /** @class */ (function (_super) {
        __extends(AtomViewModel, _super);
        function AtomViewModel() {
            var _this = _super.call(this) || this;
            _this._channelPrefix = "";
            _this._isReady = false;
            _this.validations = [];
            WebAtoms.AtomDevice.instance.runAsync(function () { return _this.privateInit(); });
            return _this;
        }
        Object.defineProperty(AtomViewModel.prototype, "channelPrefix", {
            get: function () {
                return this._channelPrefix;
            },
            set: function (v) {
                this._channelPrefix = v;
                var temp = this.subscriptions;
                if (temp) {
                    this.subscriptions = [];
                    for (var _i = 0, temp_1 = temp; _i < temp_1.length; _i++) {
                        var s = temp_1[_i];
                        s.disposable.dispose();
                    }
                    for (var _a = 0, temp_2 = temp; _a < temp_2.length; _a++) {
                        var s1 = temp_2[_a];
                        this.subscribe(s.channel, s.action);
                    }
                }
                Atom.refresh(this, "channelPrefix");
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AtomViewModel.prototype, "isReady", {
            get: function () {
                return this._isReady;
            },
            enumerable: true,
            configurable: true
        });
        AtomViewModel.prototype.privateInit = function () {
            return __awaiter(this, void 0, void 0, function () {
                var _this = this;
                var _i, _a, i;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _b.trys.push([0, , 3, 4]);
                            return [4 /*yield*/, Atom.postAsync(function () { return __awaiter(_this, void 0, void 0, function () {
                                    return __generator(this, function (_a) {
                                        this.runDecoratorInits();
                                        return [2 /*return*/];
                                    });
                                }); })];
                        case 1:
                            _b.sent();
                            return [4 /*yield*/, Atom.postAsync(function () { return __awaiter(_this, void 0, void 0, function () {
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0: return [4 /*yield*/, this.init()];
                                            case 1:
                                                _a.sent();
                                                this.onReady();
                                                return [2 /*return*/];
                                        }
                                    });
                                }); })];
                        case 2:
                            _b.sent();
                            if (this.postInit) {
                                for (_i = 0, _a = this.postInit; _i < _a.length; _i++) {
                                    i = _a[_i];
                                    i();
                                }
                                this.postInit = null;
                            }
                            return [3 /*break*/, 4];
                        case 3:
                            this._isReady = true;
                            return [7 /*endfinally*/];
                        case 4: return [2 /*return*/];
                    }
                });
            });
        };
        AtomViewModel.prototype.waitForReady = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!!this._isReady) return [3 /*break*/, 2];
                            return [4 /*yield*/, Atom.delay(100)];
                        case 1:
                            _a.sent();
                            return [3 /*break*/, 0];
                        case 2: return [2 /*return*/];
                    }
                });
            });
        };
        // tslint:disable-next-line:no-empty
        AtomViewModel.prototype.onReady = function () { };
        AtomViewModel.prototype.runDecoratorInits = function () {
            var v = this.constructor.prototype;
            if (!v) {
                return;
            }
            var ris = v._$_inits;
            if (ris) {
                for (var _i = 0, ris_1 = ris; _i < ris_1.length; _i++) {
                    var ri = ris_1[_i];
                    ri.call(this, this);
                }
            }
        };
        /**
         * Internal method, do not use, instead use errors.hasErrors()
         *
         * @memberof AtomViewModel
         */
        AtomViewModel.prototype.validate = function () {
            for (var _i = 0, _a = this.validations; _i < _a.length; _i++) {
                var v = _a[_i];
                v.evaluate(true);
            }
        };
        /**
         * Adds validation expression to be executed when any bindable expression is updated.
         *
         * `target` must always be set to `this`.
         *
         *      this.addValidation(() => {
         *          this.errors.nameError = this.data.firstName ? "" : "Name cannot be empty";
         *      });
         *
         * Only difference here is, validation will not kick in first time, where else watch will
         * be invoked as soon as it is setup.
         *
         * Validation will be invoked when any bindable property in given expression is updated.
         *
         * Validation can be invoked explicitly only by calling `errors.hasErrors()`.
         *
         * @protected
         * @template T
         * @param {() => any} ft
         * @returns {AtomDisposable}
         * @memberof AtomViewModel
         */
        AtomViewModel.prototype.addValidation = function () {
            var _this = this;
            var fts = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                fts[_i] = arguments[_i];
            }
            var ds = [];
            for (var _a = 0, fts_1 = fts; _a < fts_1.length; _a++) {
                var ft = fts_1[_a];
                var d = new WebAtoms.AtomWatcher(this, ft, false, true);
                this.validations.push(d);
                this.registerDisposable(d);
                ds.push(d);
            }
            return new WebAtoms.DisposableAction(function () {
                _this.disposables = _this.disposables.filter(function (f) { return !ds.find(function (fd) { return f === fd; }); });
                for (var _i = 0, ds_1 = ds; _i < ds_1.length; _i++) {
                    var dispsoable = ds_1[_i];
                    dispsoable.dispose();
                }
            });
        };
        /**
         * Execute given expression whenever any bindable expression changes
         * in the expression.
         *
         * For correct generic type resolution, target must always be `this`.
         *
         *      this.watch(() => {
         *          if(!this.data.fullName){
         *              this.data.fullName = `${this.data.firstName} ${this.data.lastName}`;
         *          }
         *      });
         *
         * @protected
         * @template T
         * @param {() => any} ft
         * @returns {AtomDisposable}
         * @memberof AtomViewModel
         */
        AtomViewModel.prototype.watch = function () {
            var _this = this;
            var fts = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                fts[_i] = arguments[_i];
            }
            var dfd = [];
            for (var _a = 0, fts_2 = fts; _a < fts_2.length; _a++) {
                var ft = fts_2[_a];
                var d = new WebAtoms.AtomWatcher(this, ft, this._isReady);
                // debugger;
                this.registerDisposable(d);
                dfd.push(d);
                if (!this._isReady) {
                    this.postInit = this.postInit || [];
                    this.postInit.push(function () {
                        d.runEvaluate();
                    });
                }
            }
            return new WebAtoms.DisposableAction(function () {
                _this.disposables = _this.disposables.filter(function (f) { return !dfd.find(function (fd) { return f === fd; }); });
                for (var _i = 0, dfd_1 = dfd; _i < dfd_1.length; _i++) {
                    var disposable = dfd_1[_i];
                    disposable.dispose();
                }
            });
        };
        /**
         * Register a disposable to be disposed when view model will be disposed.
         *
         * @protected
         * @param {AtomDisposable} d
         * @memberof AtomViewModel
         */
        AtomViewModel.prototype.registerDisposable = function (d) {
            this.disposables = this.disposables || [];
            this.disposables.push(d);
        };
        // tslint:disable-next-line:no-empty
        AtomViewModel.prototype.onPropertyChanged = function (name) { };
        /**
         * Register listener for given message.
         *
         * @protected
         * @template T
         * @param {string} msg
         * @param {(data: T) => void} a
         * @memberof AtomViewModel
         */
        AtomViewModel.prototype.onMessage = function (msg, a) {
            console.warn("Do not use onMessage, instead use @receive decorator...");
            var action = function (m, d) {
                a(d);
            };
            var sub = WebAtoms.AtomDevice.instance.subscribe(this.channelPrefix + msg, action);
            this.registerDisposable(sub);
        };
        /**
         * Broadcast given data to channel (msg)
         *
         * @param {string} msg
         * @param {*} data
         * @memberof AtomViewModel
         */
        AtomViewModel.prototype.broadcast = function (msg, data) {
            WebAtoms.AtomDevice.instance.broadcast(this.channelPrefix + msg, data);
        };
        AtomViewModel.prototype.subscribe = function (channel, c) {
            var sub = WebAtoms.AtomDevice.instance.subscribe(this.channelPrefix + channel, c);
            this.subscriptions = this.subscriptions || [];
            this.subscriptions.push({
                channel: channel,
                action: c,
                disposable: sub
            });
        };
        /**
         * Put your asynchronous initializations here
         *
         * @returns {Promise<any>}
         * @memberof AtomViewModel
         */
        // tslint:disable-next-line:no-empty
        AtomViewModel.prototype.init = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/];
                });
            });
        };
        /**
         * dispose method will becalled when attached view will be disposed or
         * when a new view model will be assigned to view, old view model will be disposed.
         *
         * @memberof AtomViewModel
         */
        AtomViewModel.prototype.dispose = function () {
            if (this.disposables) {
                for (var _i = 0, _a = this.disposables; _i < _a.length; _i++) {
                    var d = _a[_i];
                    d.dispose();
                }
            }
            if (this.subscriptions) {
                for (var _b = 0, _c = this.subscriptions; _b < _c.length; _b++) {
                    var d = _c[_b];
                    d.disposable.dispose();
                }
                this.subscriptions = null;
            }
        };
        return AtomViewModel;
    }(WebAtoms.AtomModel));
    WebAtoms.AtomViewModel = AtomViewModel;
    /**
     * This view model should be used with WindowService to create and open window.
     *
     * This view model has `close` and `cancel` methods. `close` method will
     * close the window and will resolve the given result in promise. `cancel`
     * will reject the given promise.
     *
     * @example
     *
     *      var windowService = WebAtoms.DI.resolve(WindowService);
     *      var result = await
     *          windowService.openWindow(
     *              "Namespace.WindowName",
     *              new WindowNameViewModel());
     *
     *
     *
     *      class NewTaskWindowViewModel extends AtomWindowViewModel{
     *
     *          ....
     *          save(){
     *
     *              // close and send result
     *              this.close(task);
     *
     *          }
     *          ....
     *
     *      }
     *
     * @export
     * @class AtomWindowViewModel
     * @extends {AtomViewModel}
     */
    var AtomWindowViewModel = /** @class */ (function (_super) {
        __extends(AtomWindowViewModel, _super);
        function AtomWindowViewModel() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        Object.defineProperty(AtomWindowViewModel.prototype, "windowName", {
            // init(): Promise<any> {
            //     if(!Atom.testMode) {
            //         if(this._windowName) {
            //             return;
            //         }
            //     }
            //     return super.init();
            // }
            // windowInit(): Promise<any> {
            //     return super.init();
            // }
            /**
             * windowName will be set to generated html tag id, you can use this
             * to mock AtomWindowViewModel in testing.
             *
             * When window is closed or cancelled, view model only broadcasts
             * `atom-window-close:${this.windowName}`, you can listen for
             * such message.
             *
             * @type {string}
             * @memberof AtomWindowViewModel
             */
            get: function () {
                return this._windowName;
            },
            set: function (v) {
                this._windowName = v;
                Atom.refresh(this, "windowName");
            },
            enumerable: true,
            configurable: true
        });
        /**
         * This will broadcast `atom-window-close:windowName`.
         * WindowService will close the window on receipt of such message and
         * it will resolve the promise with given result.
         *
         *      this.close(someResult);
         *
         * @param {*} [result]
         * @memberof AtomWindowViewModel
         */
        AtomWindowViewModel.prototype.close = function (result) {
            // tslint:disable-next-line:no-string-literal
            this["_channelPrefix"] = "";
            this.broadcast("atom-window-close:" + this.windowName, result);
        };
        /**
         * This will broadcast `atom-window-cancel:windowName`
         * WindowService will cancel the window on receipt of such message and
         * it will reject the promise with "cancelled" message.
         *
         *      this.cancel();
         *
         * @memberof AtomWindowViewModel
         */
        AtomWindowViewModel.prototype.cancel = function () {
            // tslint:disable-next-line:no-string-literal
            this["_channelPrefix"] = "";
            this.broadcast("atom-window-cancel:" + this.windowName, null);
        };
        return AtomWindowViewModel;
    }(AtomViewModel));
    WebAtoms.AtomWindowViewModel = AtomWindowViewModel;
    var AtomPageViewModel = /** @class */ (function (_super) {
        __extends(AtomPageViewModel, _super);
        function AtomPageViewModel() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        AtomPageViewModel.prototype.cancel = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!this.closeWarning) {
                                this.broadcast("pop-page:" + this.pageId, null);
                                return [2 /*return*/];
                            }
                            return [4 /*yield*/, WebAtoms.WindowService.instance.confirm(this.closeWarning, "Are you sure?")];
                        case 1:
                            if (_a.sent()) {
                                this.broadcast("pop-page:" + this.pageId, null);
                            }
                            return [2 /*return*/];
                    }
                });
            });
        };
        return AtomPageViewModel;
    }(AtomViewModel));
    WebAtoms.AtomPageViewModel = AtomPageViewModel;
})(WebAtoms || (WebAtoms = {}));
function registerInit(target, fx) {
    var t = target;
    var inits = t._$_inits = t._$_inits || [];
    inits.push(fx);
}
/**
 * Receive messages for given channel
 * @param {(string | RegExp)} channel
 * @returns {Function}
 */
function receive() {
    var channel = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        channel[_i] = arguments[_i];
    }
    return function (target, key) {
        registerInit(target, function (vm) {
            var fx = vm[key];
            var a = function (ch, d) {
                fx.call(vm, ch, d);
            };
            // tslint:disable-next-line:no-string-literal
            var s = vm["subscribe"];
            for (var _i = 0, channel_1 = channel; _i < channel_1.length; _i++) {
                var c = channel_1[_i];
                s.call(vm, c, a);
            }
        });
    };
}
function bindableReceive() {
    var channel = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        channel[_i] = arguments[_i];
    }
    return function (target, key) {
        var bp = bindableProperty(target, key);
        registerInit(target, function (vm) {
            var fx = function (cx, m) {
                vm[key] = m;
            };
            // tslint:disable-next-line:no-string-literal
            var s = vm["subscribe"];
            for (var _i = 0, channel_2 = channel; _i < channel_2.length; _i++) {
                var c = channel_2[_i];
                s.call(vm, c, fx);
            }
        });
        return bp;
    };
}
function bindableBroadcast() {
    var channel = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        channel[_i] = arguments[_i];
    }
    return function (target, key) {
        var bp = bindableProperty(target, key);
        registerInit(target, function (vm) {
            var fx = function (t) {
                var v = vm[key];
                for (var _i = 0, channel_3 = channel; _i < channel_3.length; _i++) {
                    var c = channel_3[_i];
                    vm.broadcast(c, v);
                }
            };
            var d = new WebAtoms.AtomWatcher(vm, [key], false);
            d.func = fx;
            // tslint:disable-next-line:no-string-literal
            var f = d["evaluatePath"];
            // tslint:disable-next-line:no-string-literal
            for (var _i = 0, _a = d.path; _i < _a.length; _i++) {
                var p = _a[_i];
                f.call(d, vm, p);
            }
            vm.registerDisposable(d);
        });
        return bp;
    };
}
function watch(target, key, descriptor) {
    registerInit(target, function (vm) {
        // tslint:disable-next-line:no-string-literal
        var vfx = vm["watch"];
        vfx.call(vm, vm[key]);
    });
}
function validate(target, key, descriptor) {
    registerInit(target, function (vm) {
        // tslint:disable-next-line:no-string-literal
        var vfx = vm["addValidation"];
        // tslint:disable-next-line:no-string-literal
        vfx.call(vm, vm["key"]);
    });
}
var WebAtoms;
(function (WebAtoms) {
    var _viewModelParseWatchCache = {};
    function parsePath(f) {
        var str = f.toString().trim();
        var key = str;
        var px = _viewModelParseWatchCache[key];
        if (px) {
            return px;
        }
        if (str.endsWith("}")) {
            str = str.substr(0, str.length - 1);
        }
        if (str.startsWith("function (")) {
            str = str.substr("function (".length);
        }
        if (str.startsWith("function(")) {
            str = str.substr("function(".length);
        }
        str = str.trim();
        var index = str.indexOf(")");
        var isThis = index === 0;
        var p = isThis ? "\_this|this" : str.substr(0, index);
        str = str.substr(index + 1);
        var regExp = "(?:(" + p + ")(?:(\\.[a-zA-Z_][a-zA-Z_0-9]*)+)(?:\\(?))";
        var re = new RegExp(regExp, "gi");
        var path = [];
        var ms = str.replace(re, function (m) {
            // console.log(`m: ${m}`);
            var px = m;
            if (px.startsWith("this.")) {
                px = px.substr(5);
            }
            else if (px.startsWith("_this.")) {
                px = px.substr(6);
            }
            else {
                px = px.substr(p.length + 1);
            }
            // console.log(px);
            if (!path.find(function (y) { return y === px; })) {
                path.push(px);
            }
            path = path.filter(function (f) { return !f.endsWith("("); });
            return m;
        });
        // debugger;
        path = path.sort(function (a, b) { return b.localeCompare(a); });
        var rp = [];
        for (var _i = 0, path_1 = path; _i < path_1.length; _i++) {
            var rpitem = path_1[_i];
            if (rp.find(function (x) { return x.startsWith(rpitem); })) {
                continue;
            }
            rp.push(rpitem);
        }
        // console.log(`Watching: ${path.join(", ")}`);
        _viewModelParseWatchCache[key] = path;
        return path;
    }
    /**
     * AtomErrors class holds all validation errors registered in view model.
     *
     * hasErrors() method will return true if there are any validation errors in this AtomErrors object.
     *
     * @export
     * @class AtomErrors
     */
    var AtomErrors = /** @class */ (function () {
        /**
         * Creates an instance of AtomErrors.
         * @param {AtomViewModel} target
         * @memberof AtomErrors
         */
        function AtomErrors(target) {
            this.__target = target;
        }
        /**
         *
         *
         * @returns {boolean}
         * @memberof AtomErrors
         */
        AtomErrors.prototype.hasErrors = function () {
            if (this.__target) {
                this.__target.validate();
            }
            for (var k in this) {
                if (AtomErrors.isInternal.test(k)) {
                    continue;
                }
                if (this.hasOwnProperty(k)) {
                    if (this[k]) {
                        return true;
                    }
                }
            }
            return false;
        };
        /**
         *
         *
         * @memberof AtomErrors
         */
        AtomErrors.prototype.clear = function () {
            for (var k in this) {
                if (AtomErrors.isInternal.test(k)) {
                    continue;
                }
                if (this.hasOwnProperty(k)) {
                    this[k] = null;
                    Atom.refresh(this, k);
                }
            }
        };
        AtomErrors.isInternal = /^\_(\_target|\$\_)/;
        return AtomErrors;
    }());
    WebAtoms.AtomErrors = AtomErrors;
    var ObjectProperty = /** @class */ (function () {
        function ObjectProperty(name) {
            this.name = name;
        }
        ObjectProperty.prototype.toString = function () {
            return this.name;
        };
        return ObjectProperty;
    }());
    WebAtoms.ObjectProperty = ObjectProperty;
    /**
     *
     *
     * @export
     * @class AtomWatcher
     * @implements {AtomDisposable}
     * @template T
     */
    var AtomWatcher = /** @class */ (function () {
        /**
         * Creates an instance of AtomWatcher.
         *
         *      var w = new AtomWatcher(this, x => x.data.fullName = `${x.data.firstName} ${x.data.lastName}`);
         *
         * You must dispose `w` in order to avoid memory leaks.
         * Above method will set fullName whenver, data or its firstName,lastName property is modified.
         *
         * AtomWatcher will assign null if any expression results in null in single property path.
         *
         * In order to avoid null, you can rewrite above expression as,
         *
         *      var w = new AtomWatcher(this,
         *                  x => {
         *                      if(x.data.firstName && x.data.lastName){
         *                        x.data.fullName = `${x.data.firstName} ${x.data.lastName}`
         *                      }
         *                  });
         *
         * @param {T} target - Target on which watch will be set to observe given set of properties
         * @param {(string[] | ((x:T) => any))} path - Path is either lambda expression or array of
         *                      property path to watch, if path was lambda, it will be executed when any of
         *                      members will modify
         * @param {boolean} [forValidation] forValidtion - Ignore, used for internal purpose
         * @memberof AtomWatcher
         */
        function AtomWatcher(target, path, runAfterSetup, forValidation) {
            var _this = this;
            this._isExecuting = false;
            this.target = target;
            var e = false;
            if (forValidation === true) {
                this.forValidation = true;
            }
            if (path instanceof Function) {
                var f = path;
                path = parsePath(path);
                e = true;
                this.func = f;
                this.funcText = f.toString();
            }
            this.runEvaluate = function () {
                _this.evaluate();
            };
            this.runEvaluate.watcher = this;
            this.path = path.map(function (x) { return x.split(".").map(function (y) { return new ObjectProperty(y); }); });
            if (e) {
                if (runAfterSetup) {
                    this.evaluate();
                }
                // else {
                //     // setup watcher...
                //     for(var p of this.path) {
                //         this.evaluatePath(this.target,p);
                //     }
                // }
            }
        }
        AtomWatcher.prototype.evaluatePath = function (target, path) {
            // console.log(`\tevaluatePath: ${path.map(op=>op.name).join(", ")}`);
            var newTarget = null;
            for (var _i = 0, path_2 = path; _i < path_2.length; _i++) {
                var p = path_2[_i];
                newTarget = AtomBinder.getValue(target, p.name);
                if (!p.target) {
                    p.watcher = Atom.watch(target, p.name, this.runEvaluate);
                }
                else if (p.target !== target) {
                    if (p.watcher) {
                        p.watcher.dispose();
                    }
                    p.watcher = Atom.watch(target, p.name, this.runEvaluate);
                }
                p.target = target;
                target = newTarget;
                if (newTarget === undefined || newTarget === null) {
                    break;
                }
            }
            return newTarget;
        };
        /**
         *
         *
         * @param {boolean} [force]
         * @returns {*}
         * @memberof AtomWatcher
         */
        AtomWatcher.prototype.evaluate = function (force) {
            if (this._isExecuting) {
                return;
            }
            var disposeWatchers = [];
            this._isExecuting = true;
            try {
                var values = [];
                var logs = [];
                for (var _i = 0, _a = this.path; _i < _a.length; _i++) {
                    var p = _a[_i];
                    values.push(this.evaluatePath(this.target, p));
                }
                if (force === true) {
                    this.forValidation = false;
                }
                if (this.forValidation) {
                    var x = true;
                    if (values.find(function (x) { return x ? true : false; })) {
                        this.forValidation = false;
                    }
                    else {
                        return;
                    }
                }
                try {
                    this.func.call(this.target, this.target);
                }
                catch (e) {
                    console.warn(e);
                }
            }
            finally {
                this._isExecuting = false;
                for (var _b = 0, disposeWatchers_1 = disposeWatchers; _b < disposeWatchers_1.length; _b++) {
                    var d = disposeWatchers_1[_b];
                    d.dispose();
                }
            }
        };
        AtomWatcher.prototype.toString = function () {
            return this.func.toString();
        };
        /**
         * This will dispose and unregister all watchers
         *
         * @memberof AtomWatcher
         */
        AtomWatcher.prototype.dispose = function () {
            for (var _i = 0, _a = this.path; _i < _a.length; _i++) {
                var p = _a[_i];
                for (var _b = 0, p_1 = p; _b < p_1.length; _b++) {
                    var op = p_1[_b];
                    if (op.watcher) {
                        op.watcher.dispose();
                        op.watcher = null;
                        op.target = null;
                    }
                }
            }
            this.func = null;
            this.path.length = 0;
            this.path = null;
        };
        return AtomWatcher;
    }());
    WebAtoms.AtomWatcher = AtomWatcher;
})(WebAtoms || (WebAtoms = {}));
var WebAtoms;
(function (WebAtoms) {
    /**
     * BrowserService provides access to browser attributes
     * such as title of current window, location etc.
     *
     * @export
     * @class BrowserService
     */
    var BrowserService = /** @class */ (function () {
        function BrowserService() {
        }
        BrowserService_1 = BrowserService;
        Object.defineProperty(BrowserService, "instance", {
            /**
             * DI Resolved instance
             *
             * @readonly
             * @static
             * @type {BrowserService}
             * @memberof BrowserService
             */
            get: function () {
                return WebAtoms.DI.resolve(BrowserService_1);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BrowserService.prototype, "title", {
            /**
             * Get current window title
             *
             * @type {string}
             * @memberof BrowserService
             */
            get: function () {
                return window.document.title;
            },
            /**
             * Set current window title
             * @memberof BrowserService
             */
            set: function (v) {
                window.document.title = v;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BrowserService.prototype, "location", {
            /**
             * Gets current location of browser, this does not return
             * actual location but it returns values of browser location.
             * This is done to provide mocking behaviour for unit testing.
             *
             * @readonly
             * @type {AtomLocation}
             * @memberof BrowserService
             */
            get: function () {
                return {
                    href: location.href,
                    hash: location.hash,
                    host: location.host,
                    hostName: location.hostname,
                    port: location.port,
                    protocol: location.protocol
                };
            },
            enumerable: true,
            configurable: true
        });
        /**
         * Navigate current browser to given url.
         * @param {string} url
         * @memberof BrowserService
         */
        BrowserService.prototype.navigate = function (url) {
            location.href = url;
        };
        Object.defineProperty(BrowserService.prototype, "appScope", {
            /**
             * Get access to available appScope from Web Atoms.
             * @readonly
             * @type {*}
             * @memberof BrowserService
             */
            get: function () {
                // tslint:disable-next-line:no-string-literal
                return window["appScope"];
            },
            enumerable: true,
            configurable: true
        });
        BrowserService = BrowserService_1 = __decorate([
            WebAtoms.DIGlobal
        ], BrowserService);
        return BrowserService;
        var BrowserService_1;
    }());
    WebAtoms.BrowserService = BrowserService;
})(WebAtoms || (WebAtoms = {}));
var WebAtoms;
(function (WebAtoms) {
    var oldFunction = AtomBinder.setValue;
    AtomBinder.setValue = function (target, key, value) {
        target._$_supressRefresh = target._$_supressRefresh || {};
        target._$_supressRefresh[key] = 1;
        try {
            oldFunction(target, key, value);
        }
        finally {
            target._$_supressRefresh[key] = 0;
        }
    };
    /**
     * Core class as an replacement for jQuery
     * @class Core
     */
    var Core = /** @class */ (function () {
        function Core() {
        }
        Core.addClass = function (e, c) {
            var ex = e.className;
            var exa = ex ? ex.split(" ") : [];
            if (exa.find(function (f) { return f === c; })) {
                return;
            }
            exa.push(c);
            e.className = exa.join(" ");
        };
        Core.removeClass = function (e, c) {
            var ex = (e.className || "").split(" ");
            if (ex.length === 0) {
                return;
            }
            ex = ex.filter(function (cx) { return cx !== c; });
            e.className = ex.join(" ");
        };
        Core.atomParent = function (element) {
            if (element.atomControl) {
                return element.atomControl;
            }
            if (element === document || element === window || !element.parentNode) {
                return null;
            }
            return Core.atomParent(element._logicalParent || element.parentNode);
        };
        Core.hasClass = function (e, className) {
            return e.classList.contains(className);
        };
        Core.getOffsetRect = function (e) {
            var r = {
                x: e.offsetLeft,
                y: e.offsetTop,
                width: e.offsetWidth,
                height: e.offsetHeight
            };
            if (e.offsetParent) {
                var rp = Core.getOffsetRect(e.offsetParent);
                r.x += rp.x;
                r.y += rp.y;
            }
            return r;
        };
        return Core;
    }());
    WebAtoms.Core = Core;
})(WebAtoms || (WebAtoms = {}));
// tslint:disable-next-line
function methodBuilder(method) {
    // tslint:disable-next-line
    return function (url) {
        // tslint:disable-next-line
        return function (target, propertyKey, descriptor) {
            target.methods = target.methods || {};
            var a = target.methods[propertyKey];
            var oldFunction = descriptor.value;
            // tslint:disable-next-line:typedef
            descriptor.value = function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                if (this.testMode || Atom.designMode) {
                    console.log("TestDesign Mode: " + url + " .. " + args.join(","));
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
            // console.log("methodBuilder called");
            // console.log({ url: url, propertyKey: propertyKey,descriptor: descriptor });
        };
    };
}
// tslint:disable-next-line
function Return(type) {
    // tslint:disable-next-line
    return function (target, propertyKey, descriptor) {
        if (!target.methodReturns) {
            target.methodReturns = {};
        }
        target.methodReturns[propertyKey] = type;
    };
}
// tslint:disable-next-line
function parameterBuilder(paramName) {
    // tslint:disable-next-line
    return function (key) {
        // console.log("Declaration");
        // console.log({ key:key});
        // tslint:disable-next-line
        return function (target, propertyKey, parameterIndex) {
            // console.log("Instance");
            // console.log({ key:key, propertyKey: propertyKey,parameterIndex: parameterIndex });
            target.methods = target.methods || {};
            var a = target.methods[propertyKey];
            if (!a) {
                a = [];
                target.methods[propertyKey] = a;
            }
            a[parameterIndex] = new WebAtoms.Rest.ServiceParameter(paramName, key);
        };
    };
}
/**
 * This will register Url path fragment on parameter.
 *
 * @example
 *
 *      @Get("/api/products/{category}")
 *      async getProducts(
 *          @Path("category")  category: number
 *      ): Promise<Product[]> {
 *      }
 *
 * @export
 * @function Path
 * @param {name} - Name of the parameter
 */
var Path = parameterBuilder("Path");
/**
 * This will register header on parameter.
 *
 * @example
 *
 *      @Get("/api/products/{category}")
 *      async getProducts(
 *          @Header("x-http-auth")  category: number
 *      ): Promise<Product[]> {
 *      }
 *
 * @export
 * @function Path
 * @param {name} - Name of the parameter
 */
var Header = parameterBuilder("Header");
/**
 * This will register Url query fragment on parameter.
 *
 * @example
 *
 *      @Get("/api/products")
 *      async getProducts(
 *          @Query("category")  category: number
 *      ): Promise<Product[]> {
 *      }
 *
 * @export
 * @function Query
 * @param {name} - Name of the parameter
 */
var Query = parameterBuilder("Query");
/**
 * This will register data fragment on ajax.
 *
 * @example
 *
 *      @Post("/api/products")
 *      async getProducts(
 *          @Query("id")  id: number,
 *          @Body product: Product
 *      ): Promise<Product[]> {
 *      }
 *
 * @export
 * @function Body
 */
var Body = parameterBuilder("Body")("");
/**
 * This will register data fragment on ajax in old formModel way.
 *
 * @example
 *
 *      @Post("/api/products")
 *      async getProducts(
 *          @Query("id")  id: number,
 *          @BodyFormModel product: Product
 *      ): Promise<Product[]> {
 *      }
 *
 * @export
 * @function BodyFormModel
 */
var BodyFormModel = parameterBuilder("BodyFormModel")("");
/**
 * Http Post method
 * @example
 *
 *      @Post("/api/products")
 *      async saveProduct(
 *          @Body product: Product
 *      ): Promise<Product> {
 *      }
 *
 * @export
 * @function Post
 * @param {url} - Url for the operation
 */
var Post = methodBuilder("Post");
/**
 * Http Get Method
 *
 * @example
 *
 *      @Get("/api/products/{category}")
 *      async getProducts(
 *          @Path("category") category?:string
 *      ): Promise<Product[]> {
 *      }
 *
 * @export
 * @function Body
 */
var Get = methodBuilder("Get");
/**
 * Http Delete method
 * @example
 *
 *      @Delete("/api/products")
 *      async deleteProduct(
 *          @Body product: Product
 *      ): Promise<Product> {
 *      }
 *
 * @export
 * @function Delete
 * @param {url} - Url for the operation
 */
var Delete = methodBuilder("Delete");
/**
 * Http Put method
 * @example
 *
 *      @Put("/api/products")
 *      async saveProduct(
 *          @Body product: Product
 *      ): Promise<Product> {
 *      }
 *
 * @export
 * @function Put
 * @param {url} - Url for the operation
 */
var Put = methodBuilder("Put");
/**
 * Http Patch method
 * @example
 *
 *      @Patch("/api/products")
 *      async saveProduct(
 *          @Body product: any
 *      ): Promise<Product> {
 *      }
 *
 * @export
 * @function Patch
 * @param {url} - Url for the operation
 */
var Patch = methodBuilder("Patch");
/**
 * Cancellation token
 * @example
 *
 *      @Put("/api/products")
 *      async saveProduct(
 *          @Body product: Product
 *          @Cancel cancel: CancelToken
 *      ): Promise<Product> {
 *      }
 *
 * @export
 * @function Put
 * @param {url} - Url for the operation
 */
function Cancel(target, propertyKey, parameterIndex) {
    if (!target.methods) {
        target.methods = {};
    }
    var a = target.methods[propertyKey];
    if (!a) {
        a = [];
        target.methods[propertyKey] = a;
    }
    a[parameterIndex] = new WebAtoms.Rest.ServiceParameter("cancel", "");
}
// tslint:disable-next-line:no-string-literal
if (!window["__atomSetLocalValue"]) {
    // tslint:disable-next-line:no-string-literal
    window["__atomSetLocalValue"] = function (bt) {
        return function (k, v, e, r) {
            var self = this;
            if (v) {
                if (v.then && v.catch) {
                    e._promisesQueue = e._promisesQueue || {};
                    var c = e._promisesQueue[k];
                    if (c) {
                        c.abort();
                    }
                    v.then(function (pr) {
                        if (c && c.cancelled) {
                            return;
                        }
                        e._promisesQueue[k] = null;
                        bt.setLocalValue.call(self, k, pr, e, r);
                    });
                    v.catch(function (er) {
                        e._promisesQueue[k] = null;
                    });
                    return;
                }
            }
            bt.setLocalValue.call(this, k, v, e, r);
        };
    };
}
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
        /**
         *
         *
         * @export
         * @class CancellablePromise
         * @implements {Promise<T>}
         * @template T
         */
        var CancellablePromise = /** @class */ (function () {
            function CancellablePromise(p, onCancel) {
                this.p = p;
                this.onCancel = onCancel;
            }
            CancellablePromise.prototype.abort = function () {
                this.onCancel();
            };
            CancellablePromise.prototype.then = function (onfulfilled, onrejected) {
                return this.p.then(onfulfilled, onrejected);
            };
            CancellablePromise.prototype.catch = function (onrejected) {
                return this.p.catch(onrejected);
            };
            return CancellablePromise;
        }());
        Rest.CancellablePromise = CancellablePromise;
        AtomConfig.ajax.jsonPostEncode = function (o) {
            if (!o.inputProcessed) {
                if (o.data) {
                    o.data = { formModel: JSON.stringify(o.data) };
                }
                return o;
            }
            if (o.data) {
                o.contentType = "application/json";
                o.data = JSON.stringify(o.data);
            }
            return o;
        };
        /**
         *
         *
         * @export
         * @class BaseService
         */
        var BaseService = /** @class */ (function () {
            function BaseService() {
                this.testMode = false;
                this.showProgress = true;
                this.showError = false;
                // bs
                this.methods = {};
                this.methodReturns = {};
            }
            BaseService.prototype.encodeData = function (o) {
                o.inputProcessed = true;
                o.dataType = "json";
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
                    var options, i, p, v, pr, rp;
                    return __generator(this, function (_a) {
                        options = new AjaxOptions();
                        options.method = method;
                        options.type = method;
                        if (bag) {
                            for (i = 0; i < bag.length; i++) {
                                p = bag[i];
                                v = values[i];
                                switch (p.type) {
                                    case "path":
                                        url = url.replace("{" + p.key + "}", encodeURIComponent(v));
                                        break;
                                    case "query":
                                        if (url.indexOf("?") === -1) {
                                            url += "?";
                                        }
                                        url += "&" + p.key + "=" + encodeURIComponent(v);
                                        break;
                                    case "body":
                                        options.data = v;
                                        options = this.encodeData(options);
                                        break;
                                    case "bodyformmodel":
                                        options.inputProcessed = false;
                                        options.data = v;
                                        break;
                                    case "cancel":
                                        options.cancel = v;
                                        break;
                                    case "header":
                                        options.headers = options.headers = {};
                                        options.headers[p.key] = p;
                                        break;
                                }
                            }
                        }
                        options.url = url;
                        pr = AtomPromise.json(url, null, options);
                        if (options.cancel) {
                            options.cancel.registerForCancel(function () {
                                pr.abort();
                            });
                        }
                        rp = new Promise(function (resolve, reject) {
                            pr.then(function () {
                                var v = pr.value();
                                // deep clone...
                                // var rv = new returns();
                                // reject("Clone pending");
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
                        });
                        return [2 /*return*/, new CancellablePromise(rp, function () {
                                pr.abort();
                            })];
                    });
                });
            };
            return BaseService;
        }());
        Rest.BaseService = BaseService;
    })(Rest = WebAtoms.Rest || (WebAtoms.Rest = {}));
})(WebAtoms || (WebAtoms = {}));
var WebAtoms;
(function (WebAtoms) {
    /**
     *
     *
     * @export
     * @class WindowService
     */
    var WindowService = /** @class */ (function () {
        /**
         *
         */
        function WindowService() {
            var _this = this;
            this.popups = [];
            this.lastPopupID = 0;
            this.lastWindowID = 1;
            /**
             * zIndex of next window
             * @type {number}
             * @memberof WindowService
             */
            this.zIndex = 10001;
            window.addEventListener("click", function (e) {
                _this.currentTarget = e.target;
                _this.closePopup();
            });
        }
        WindowService_1 = WindowService;
        WindowService.prototype.closePopup = function () {
            if (!this.popups.length) {
                return;
            }
            var peek = this.popups[this.popups.length - 1];
            var element = peek._element;
            var target = this.currentTarget;
            while (target) {
                if (WebAtoms.Core.hasClass(target, "close-popup")) {
                    break;
                }
                if (target === element) {
                    // do not close this popup....
                    return;
                }
                target = target.parentElement;
            }
            this.close(peek);
        };
        WindowService.prototype.close = function (c) {
            // tslint:disable-next-line:no-string-literal
            var cp = c["close"];
            if (cp) {
                cp();
            }
        };
        /**
         * This method will open a new popup identified by name of the popup or class of popup.
         * Supplied view model has to be derived from AtomWindowViewModel.
         *
         *
         * @example
         *
         *     var result = await windowService.openPopup<Task>(NewTaskWindow, new NewTaskWindowViewModel() );
         *
         *      class NewTaskWindowViewModel extends AtomWindowViewModel{
         *
         *          ....
         *          save(){
         *
         *              // close and send result
         *              this.close(task);
         *
         *          }
         *          ....
         *
         *      }
         *
         * @template T
         * @param {(string | {new(e)})} windowType
         * @param {AtomWindowViewModel} [viewModel]
         * @returns {Promise<T>}
         * @memberof WindowService
         */
        WindowService.prototype.openPopup = function (p, vm) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, Atom.delay(5)];
                        case 1:
                            _a.sent();
                            return [4 /*yield*/, this._openPopupAsync(p, vm)];
                        case 2: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        };
        WindowService.prototype._openPopupAsync = function (p, vm) {
            var _this = this;
            return new Promise(function (resolve, reject) {
                var parent = WebAtoms.Core.atomParent(_this.currentTarget);
                var e = document.createElement("div");
                // tslint:disable-next-line:no-string-literal
                e["_logicalParent"] = parent._element;
                e.id = "atom_popup_" + _this.lastPopupID++;
                if (vm) {
                    // tslint:disable-next-line:no-string-literal
                    vm["windowName"] = e.id;
                }
                var r = WebAtoms.Core.getOffsetRect(_this.currentTarget);
                e.style.position = "absolute";
                e.style.left = r.x + "px";
                e.style.top = (r.y + r.height) + "px";
                e.style.zIndex = 10000 + _this.lastPopupID + "";
                document.body.appendChild(e);
                var ct;
                if (p instanceof HTMLElement) {
                    e.appendChild(p);
                    ct = new WebAtoms.AtomControl(e);
                }
                else {
                    ct = new p(e);
                }
                ct.viewModel = vm;
                ct.createChildren();
                ct.init();
                // tslint:disable-next-line:no-string-literal
                ct["close"] = function () {
                    WebAtoms.AtomDevice.instance.broadcast("atom-window-cancel:" + e.id, "cancelled");
                };
                _this.popups.push(ct);
                var d = {};
                // tslint:disable-next-line:no-string-literal
                var closeFunction = function () {
                    ct.dispose();
                    e.remove();
                    d.close.dispose();
                    d.cancel.dispose();
                    _this.popups = _this.popups.filter(function (f) { return f !== ct; });
                };
                d.close = WebAtoms.AtomDevice.instance.subscribe("atom-window-close:" + e.id, function (g, i) {
                    closeFunction();
                    resolve(i);
                });
                d.cancel = WebAtoms.AtomDevice.instance.subscribe("atom-window-cancel:" + e.id, function (g, i) {
                    closeFunction();
                    reject(i);
                });
            });
        };
        Object.defineProperty(WindowService, "instance", {
            /**
             * Resolves current Window Service, you can use this method
             * to resolve service using DI, internally it calls
             * DI.resolve(WindowService).
             *
             * @readonly
             * @static
             * @type {WindowService}
             * @memberof WindowService
             */
            get: function () {
                return WebAtoms.DI.resolve(WindowService_1);
            },
            enumerable: true,
            configurable: true
        });
        /**
         * Display an alert, and method will continue after alert is closed.
         *
         * @param {string} msg
         * @param {string} [title]
         * @returns {Promise<any>}
         * @memberof WindowService
         */
        WindowService.prototype.alert = function (msg, title) {
            return this.showAlert(msg, title || "Message", false);
        };
        /**
         * Display a confirm window with promise that will resolve when yes or no
         * is clicked.
         *
         * @param {string} msg
         * @param {string} [title]
         * @returns {Promise<boolean>}
         * @memberof WindowService
         */
        WindowService.prototype.confirm = function (msg, title) {
            return this.showAlert(msg, title || "Confirm", true);
        };
        WindowService.prototype.showAlert = function (msg, title, confirm) {
            var _this = this;
            return new Promise(function (resolve, reject) {
                // tslint:disable-next-line:no-string-literal
                var AtomUI = window["AtomUI"];
                // tslint:disable-next-line:no-string-literal
                var AtomWindow = window["WebAtoms"]["AtomWindow"];
                var d = { Message: msg, ConfirmValue: false, Confirm: confirm };
                var e = document.createElement("DIV");
                e.style.zIndex = "" + _this.zIndex++;
                document.body.appendChild(e);
                var w = AtomUI.createControl(e, AtomWindow, d);
                w.set_windowWidth(380);
                w.set_windowHeight(120);
                w.set_windowTemplate(w.getTemplate("alertTemplate"));
                w.set_title(title);
                w.set_next(function () {
                    this.zIndex = Number.parseInt(e.style.zIndex);
                    w.dispose();
                    // $(e).remove();
                    e.remove();
                    if (d.ConfirmValue) {
                        resolve(true);
                    }
                    else {
                        resolve(false);
                    }
                });
                w.set_cancelNext(function () {
                    _this.zIndex = Number.parseInt(e.style.zIndex);
                    w.dispose();
                    // $(e).remove();
                    e.remove();
                    resolve(false);
                });
                w.refresh();
            });
        };
        /**
         *
         *
         * @param {string} frameHostId
         * @param {((string | {new (e:any)}))} frameType
         * @param {AtomViewModel} [viewModel]
         * @returns {Promise<any>}
         * @memberof WindowService
         */
        WindowService.prototype.pushPage = function (frameHostId, frameType, viewModel) {
            return __awaiter(this, void 0, void 0, function () {
                var host, ctrl, canClose;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            host = window.document.getElementById(frameHostId);
                            if (!host) {
                                throw new Error("FrameView Host " + frameHostId + " not found on the current page");
                            }
                            ctrl = host["atomControl"];
                            return [4 /*yield*/, ctrl.canChange()];
                        case 1:
                            canClose = _a.sent();
                            if (!canClose) {
                                throw new Error("Cancelled");
                            }
                            return [4 /*yield*/, new Promise(function (resolve, reject) {
                                    var windowDiv = document.createElement("div");
                                    windowDiv.id = "atom_frame_" + frameHostId + "_" + (ctrl.stack.length + 1);
                                    var p = null;
                                    var windowCtrl = AtomUI.createControl(windowDiv, frameType);
                                    windowDiv.setAttribute("atom-local-scope", "true");
                                    windowCtrl.init();
                                    // tslint:disable-next-line:no-string-literal
                                    var dispatcher = WebAtoms["dispatcher"];
                                    if (viewModel !== undefined) {
                                        viewModel.pageId = windowDiv.id;
                                        Atom.set(windowCtrl, "viewModel", viewModel);
                                    }
                                    ctrl.push(windowCtrl);
                                    var d = {};
                                    d.disposable = WebAtoms.AtomDevice.instance.subscribe("pop-page:" + windowDiv.id, function () {
                                        ctrl.backCommand();
                                        d.disposable.dispose();
                                    });
                                    resolve();
                                })];
                        case 2:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * This method will open a new window identified by name of the window or class of window.
         * Supplied view model has to be derived from AtomWindowViewModel.
         *
         * By default this window has a localScope, so it does not corrupt scope.
         *
         * @example
         *
         *     var result = await windowService.openWindow<Task>(NewTaskWindow, new NewTaskWindowViewModel() );
         *
         *      class NewTaskWindowViewModel extends AtomWindowViewModel{
         *
         *          ....
         *          save(){
         *
         *              // close and send result
         *              this.close(task);
         *
         *          }
         *          ....
         *
         *      }
         *
         * @template T
         * @param {(string | {new(e)})} windowType
         * @param {AtomWindowViewModel} [viewModel]
         * @returns {Promise<T>}
         * @memberof WindowService
         */
        WindowService.prototype.openWindow = function (windowType, viewModel) {
            return __awaiter(this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    return [2 /*return*/, new Promise(function (resolve, reject) {
                            var windowDiv = document.createElement("div");
                            windowDiv.id = "atom_window_" + _this.lastWindowID++;
                            windowDiv.style.zIndex = "" + _this.zIndex++;
                            // tslint:disable-next-line:no-string-literal
                            var atomApplication = window["atomApplication"];
                            // tslint:disable-next-line:no-string-literal
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
                            // tslint:disable-next-line:no-string-literal
                            var dispatcher = WebAtoms["dispatcher"];
                            if (viewModel !== undefined) {
                                Atom.set(windowCtrl, "viewModel", viewModel);
                                viewModel.windowName = windowDiv.id;
                                viewModel.channelPrefix = windowDiv.id;
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
                                    _this.zIndex = Number.parseInt(windowDiv.style.zIndex);
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
                                    _this.zIndex = Number.parseInt(windowDiv.style.zIndex);
                                    windowCtrl.dispose();
                                    windowDiv.remove();
                                });
                            });
                            dispatcher.callLater(function () {
                                var scope = windowCtrl.get_scope();
                                var vm = windowCtrl.get_viewModel();
                                if (vm && !vm.windowName) {
                                    vm.windowName = windowDiv.id;
                                }
                                windowCtrl.openWindow(scope, null);
                            });
                        })];
                });
            });
        };
        WindowService = WindowService_1 = __decorate([
            WebAtoms.DIGlobal
        ], WindowService);
        return WindowService;
        var WindowService_1;
    }());
    WebAtoms.WindowService = WindowService;
})(WebAtoms || (WebAtoms = {}));
// tslint:disable-next-line:typedef
var WindowService = WebAtoms.WindowService;
//# sourceMappingURL=web-atoms-mvvm.js.map