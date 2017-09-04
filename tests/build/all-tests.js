// Test dummy
// Do not use in live
var AtomPromise = /** @class */ (function () {
    function AtomPromise() {
        this.aborted = false;
        this.success = [];
        this.fails = [];
    }
    AtomPromise.prototype.failed = function (f) {
        this.fails.push(f);
    };
    AtomPromise.prototype.then = function (f) {
        this.success.push(f);
    };
    AtomPromise.prototype.value = function () {
        return this._value;
    };
    AtomPromise.prototype.abort = function (throwIfResolved) {
        this.aborted = true;
        if (this.resolved) {
            if (throwIfResolved) {
                throw new Error("Abort cannot be called after promise was resolved");
            }
        }
    };
    AtomPromise.prototype.invoke = function (r, f) {
        var _this = this;
        setTimeout(function () {
            _this.resolved = true;
            if (_this.aborted || f) {
                for (var _i = 0, _a = _this.fails; _i < _a.length; _i++) {
                    var fx1 = _a[_i];
                    fx1(f || "cancelled");
                }
            }
            else {
                _this._value = r;
                for (var _b = 0, _c = _this.success; _b < _c.length; _b++) {
                    var fx = _c[_b];
                    fx();
                }
            }
        }, 100);
    };
    return AtomPromise;
}());
var Atom = window["Atom"];
Atom.json = function (url, options) {
    var pr = new AtomPromise();
    return pr;
};
var AtomDate = window["AtomDate"];
var AtomEnumerator = /** @class */ (function () {
    function AtomEnumerator(a) {
        this.a = a;
        this.i = -1;
    }
    AtomEnumerator.prototype.next = function () {
        this.i++;
        return this.i < this.a.length;
    };
    AtomEnumerator.prototype.current = function () {
        return this.a[this.i];
    };
    AtomEnumerator.prototype.currentIndex = function () {
        return this.i;
    };
    return AtomEnumerator;
}());
Atom.refresh = function (item, property) {
    var hs = item._$_handlers;
    if (!hs)
        return;
    var hl = hs[property];
    if (!hl)
        return;
    for (var _i = 0, hl_1 = hl; _i < hl_1.length; _i++) {
        var f = hl_1[_i];
        f();
    }
};
window["Atom"] = Atom;
var AtomBinder = {
    getClone: function (dupeObj) {
        var retObj = {};
        if (typeof (dupeObj) == 'object') {
            if (typeof (dupeObj.length) != 'undefined')
                retObj = new Array();
            for (var objInd in dupeObj) {
                var val = dupeObj[objInd];
                if (val === undefined)
                    continue;
                if (val === null) {
                    retObj[objInd] = null;
                    continue;
                }
                if (/^\_\$\_/gi.test(objInd))
                    continue;
                var type = typeof (val);
                if (type == 'object') {
                    if (val.constructor == Date) {
                        retObj[objInd] = "/DateISO(" + AtomDate.toLocalTime(val) + ")/";
                    }
                    else {
                        retObj[objInd] = AtomBinder.getClone(val);
                    }
                }
                else if (type == 'string') {
                    retObj[objInd] = val;
                }
                else if (type == 'number') {
                    retObj[objInd] = val;
                }
                else if (type == 'boolean') {
                    ((val == true) ? retObj[objInd] = true : retObj[objInd] = false);
                }
                // else if (type == 'date') {
                //     retObj[objInd] = val.getTime();
                // }
            }
        }
        return retObj;
    },
    setValue: function (target, key, value) {
        if (!target && value === undefined)
            return;
        var oldValue = AtomBinder.getValue(target, key);
        if (oldValue === value)
            return;
        var f = target["set_" + key];
        if (f) {
            f.apply(target, [value]);
        }
        else {
            target[key] = value;
        }
        AtomBinder.refreshValue(target, key, oldValue, value);
    },
    refreshValue: function (target, key, oldValue, value) {
        var handlers = AtomBinder.get_WatchHandler(target, key);
        if (handlers == undefined || handlers == null)
            return;
        var ae = new AtomEnumerator(handlers);
        while (ae.next()) {
            var item = ae.current();
            item(target, key, oldValue, value);
        }
        if (target._$_watcher) {
            target._$_watcher._onRefreshValue(target, key);
        }
    },
    getValue: function (target, key) {
        if (target == null)
            return null;
        var f = target["get_" + key];
        if (f) {
            return f.apply(target);
        }
        return target[key];
    },
    add_WatchHandler: function (target, key, handler) {
        if (target == null)
            return;
        var handlers = AtomBinder.get_WatchHandler(target, key);
        handlers.push(handler);
    },
    get_WatchHandler: function (target, key) {
        if (target == null)
            return null;
        var handlers = target._$_handlers;
        if (!handlers) {
            handlers = {};
            target._$_handlers = handlers;
        }
        var handlersForKey = handlers[key];
        if (handlersForKey == undefined || handlersForKey == null) {
            handlersForKey = [];
            handlers[key] = handlersForKey;
        }
        return handlersForKey;
    },
    remove_WatchHandler: function (target, key, handler) {
        if (target == null)
            return;
        if (target._$_handlers === undefined || target._$_handlers === null)
            return;
        var handlersForKey = target._$_handlers[key];
        if (handlersForKey == undefined || handlersForKey == null)
            return;
        var ae = new AtomEnumerator(handlersForKey);
        while (ae.next()) {
            if (ae.current() == handler) {
                handlersForKey.splice(ae.currentIndex(), 1);
                return;
            }
        }
    },
    invokeItemsEvent: function (target, mode, index, item) {
        var key = "_items";
        var handlers = AtomBinder.get_WatchHandler(target, key);
        if (!handlers)
            return;
        var ae = new AtomEnumerator(handlers);
        while (ae.next()) {
            var obj = ae.current();
            obj(mode, index, item);
        }
        if (target._$_watcher) {
            target._$_watcher._onRefreshItems(target, mode, index, item);
        }
        AtomBinder.refreshValue(target, "length", undefined, undefined);
    },
    clear: function (ary) {
        ary.length = 0;
        AtomBinder.invokeItemsEvent(ary, "refresh", 0, null);
    },
    addItem: function (ary, item) {
        var l = ary.length;
        ary.push(item);
        AtomBinder.invokeItemsEvent(ary, "add", l, item);
    },
    insertItem: function (ary, index, item) {
        ary.splice(index, 0, item);
        AtomBinder.invokeItemsEvent(ary, "add", index, item);
    },
    addItems: function (ary, items) {
        var ae = new AtomEnumerator(items);
        while (ae.next()) {
            AtomBinder.addItem(ary, ae.current());
        }
    },
    removeItem: function (ary, item) {
        var i = ary.indexOf(item);
        if (i == -1)
            return;
        ary.splice(i, 1);
        AtomBinder.invokeItemsEvent(ary, "remove", i, item);
    },
    removeAtIndex: function (ary, i) {
        if (i == -1)
            return;
        var item = ary[i];
        ary.splice(i, 1);
        AtomBinder.invokeItemsEvent(ary, "remove", i, item);
    },
    refreshItems: function (ary) {
        AtomBinder.invokeItemsEvent(ary, "refresh", -1, null);
    },
    add_CollectionChanged: function (target, handler) {
        if (target == null)
            return;
        var key = "_items";
        var handlers = AtomBinder.get_WatchHandler(target, key);
        handlers.push(handler);
    },
    remove_CollectionChanged: function (target, handler) {
        if (target == null)
            return;
        if (!target._$_handlers)
            return;
        var key = "_items";
        var handlersForKey = target._$_handlers[key];
        if (handlersForKey == undefined || handlersForKey == null)
            return;
        var ae = new AtomEnumerator(handlersForKey);
        while (ae.next()) {
            if (ae.current() == handler) {
                handlersForKey.splice(ae.currentIndex(), 1);
                return;
            }
        }
    },
    setError: function (target, key, message) {
        var errors = AtomBinder.getValue(target, "__errors");
        if (!errors) {
            AtomBinder.setValue(target, "__errors", {});
        }
        AtomBinder.setValue(errors, key, message);
    }
};
//window["AtomBinder"] = AtomBinder;
for (var item in AtomBinder) {
    window["AtomBinder"][item] = AtomBinder[item];
}
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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
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
var Task = /** @class */ (function (_super) {
    __extends(Task, _super);
    function Task() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        bindableProperty
    ], Task.prototype, "label", void 0);
    return Task;
}(WebAtoms.AtomModel));
var ServiceTest = /** @class */ (function (_super) {
    __extends(ServiceTest, _super);
    function ServiceTest() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ServiceTest.prototype.postData = function (data, a, cancel) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, null];
            });
        });
    };
    __decorate([
        Post("/post/data/{a}"),
        Return(Task),
        __param(0, Body),
        __param(1, Path("a")),
        __param(2, Cancel)
    ], ServiceTest.prototype, "postData", null);
    ServiceTest = __decorate([
        DIGlobal
    ], ServiceTest);
    return ServiceTest;
}(WebAtoms.Rest.BaseService));
var AtomViewModel = WebAtoms.AtomViewModel;
var Category = WebAtoms.Unit.Category;
var Test = WebAtoms.Unit.Test;
var TestItem = WebAtoms.Unit.TestItem;
var Assert = WebAtoms.Unit.Assert;
var AtomList = WebAtoms.AtomList;
var initCalled = false;
var SampleViewModel = /** @class */ (function (_super) {
    __extends(SampleViewModel, _super);
    function SampleViewModel() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.list = new WebAtoms.AtomList();
        return _this;
    }
    SampleViewModel.prototype.init = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        initCalled = true;
                        this.broadcast("ui-alert", "Model is ready");
                        return [4 /*yield*/, Atom.delay(100)];
                    case 1:
                        _a.sent();
                        this.list.add({
                            name: "Sample"
                        });
                        return [2 /*return*/];
                }
            });
        });
    };
    __decorate([
        bindableProperty
    ], SampleViewModel.prototype, "name", void 0);
    __decorate([
        bindableProperty
    ], SampleViewModel.prototype, "list", void 0);
    return SampleViewModel;
}(AtomViewModel));
var AtomViewModelTest = /** @class */ (function (_super) {
    __extends(AtomViewModelTest, _super);
    function AtomViewModelTest() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    AtomViewModelTest.prototype.run = function () {
        return __awaiter(this, void 0, void 0, function () {
            var nameUpated, vm, subscription;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        vm = new SampleViewModel();
                        subscription = Atom.watch(vm, "name", function () {
                            nameUpated = true;
                        });
                        return [4 /*yield*/, this.delay(100)];
                    case 1:
                        _a.sent();
                        vm.name = "changed";
                        Assert.isTrue(nameUpated);
                        subscription.dispose();
                        nameUpated = false;
                        vm.name = "c";
                        Assert.isFalse(nameUpated);
                        return [2 /*return*/];
                }
            });
        });
    };
    AtomViewModelTest.prototype.broadcast = function () {
        return __awaiter(this, void 0, void 0, function () {
            var msg, subscription, vm;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        msg = {};
                        subscription = WebAtoms.AtomDevice.instance.subscribe("ui-alert", function (a, g) {
                            msg.message = a;
                            msg.data = g;
                        });
                        vm = new SampleViewModel();
                        return [4 /*yield*/, this.delay(1000)];
                    case 1:
                        _a.sent();
                        Assert.equals(msg.message, "ui-alert");
                        Assert.equals(msg.data, "Model is ready");
                        subscription.dispose();
                        return [2 /*return*/];
                }
            });
        });
    };
    AtomViewModelTest.prototype.list = function () {
        return __awaiter(this, void 0, void 0, function () {
            var vm, eventCalled, subscription;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        vm = new SampleViewModel();
                        eventCalled = false;
                        subscription = vm.list.watch(function () {
                            eventCalled = true;
                        });
                        return [4 /*yield*/, this.delay(1000)];
                    case 1:
                        _a.sent();
                        Assert.isTrue(eventCalled);
                        subscription.dispose();
                        eventCalled = false;
                        vm.list.add({});
                        Assert.isFalse(eventCalled);
                        return [2 /*return*/];
                }
            });
        });
    };
    __decorate([
        Test("bindableProperty")
    ], AtomViewModelTest.prototype, "run", null);
    __decorate([
        Test("broadcast")
    ], AtomViewModelTest.prototype, "broadcast", null);
    __decorate([
        Test("Atom List")
    ], AtomViewModelTest.prototype, "list", null);
    AtomViewModelTest = __decorate([
        Category("AtomViewModel")
    ], AtomViewModelTest);
    return AtomViewModelTest;
}(TestItem));
//# sourceMappingURL=all-tests.js.map