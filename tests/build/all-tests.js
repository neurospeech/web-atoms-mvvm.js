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
// tslint:disable
var AtomViewModel = WebAtoms.AtomViewModel;
var Category = WebAtoms.Unit.Category;
var Test = WebAtoms.Unit.Test;
var TestItem = WebAtoms.Unit.TestItem;
var Assert = WebAtoms.Unit.Assert;
var AtomList = WebAtoms.AtomList;
var AtomErrors = WebAtoms.AtomErrors;
var initCalled = false;
var SampleViewModelErrors = /** @class */ (function () {
    function SampleViewModelErrors() {
    }
    __decorate([
        bindableProperty
    ], SampleViewModelErrors.prototype, "name", void 0);
    return SampleViewModelErrors;
}());
var SampleViewModel = /** @class */ (function (_super) {
    __extends(SampleViewModel, _super);
    function SampleViewModel() {
        var _this = _super.call(this) || this;
        _this.list = new WebAtoms.AtomList();
        _this.data = {};
        _this.errors = new SampleViewModelErrors();
        return _this;
    }
    SampleViewModel.prototype.receiveMessages = function (msg, data) {
        this.name = msg;
        this.data = data;
    };
    SampleViewModel.prototype.watchName = function () {
        this.errors.name = this.data.firstName ? "" : "Name cannot be empty";
    };
    SampleViewModel.prototype.watchName2 = function () {
        this.broadcast("name", this.data.firstName);
    };
    SampleViewModel.prototype.init = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                initCalled = true;
                this.broadcast("ui-alert", "Model is ready");
                this.list.add({
                    name: "Sample"
                });
                return [2 /*return*/];
            });
        });
    };
    SampleViewModel.prototype.watchFullName = function () {
        var _this = this;
        return this.watch(function () {
            _this.data.fullName = (_this.data.firstName + " " + _this.data.lastName).trim();
            // console.log(this.data.fullName);
        });
    };
    __decorate([
        bindableProperty
    ], SampleViewModel.prototype, "data", void 0);
    __decorate([
        bindableProperty
    ], SampleViewModel.prototype, "name", void 0);
    __decorate([
        bindableProperty
    ], SampleViewModel.prototype, "list", void 0);
    __decorate([
        receive("message1", "message2")
    ], SampleViewModel.prototype, "receiveMessages", null);
    __decorate([
        watch
    ], SampleViewModel.prototype, "watchName", null);
    __decorate([
        watch
    ], SampleViewModel.prototype, "watchName2", null);
    return SampleViewModel;
}(AtomViewModel));
var AtomViewModelTest = /** @class */ (function (_super) {
    __extends(AtomViewModelTest, _super);
    function AtomViewModelTest() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    AtomViewModelTest.prototype.validation = function () {
        return __awaiter(this, void 0, void 0, function () {
            var sm;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        sm = new SampleViewModel();
                        return [4 /*yield*/, sm.waitForReady()];
                    case 1:
                        _a.sent();
                        Atom.set(sm, "data.firstName", "something");
                        Assert.isTrue(sm.errors.name == "", "Error is not empty " + sm.errors.name);
                        Atom.set(sm, "data.firstName", "");
                        Assert.isTrue(sm.errors.name != "", "Error is empty " + sm.errors.name);
                        sm.dispose();
                        return [2 /*return*/];
                }
            });
        });
    };
    AtomViewModelTest.prototype.watch = function () {
        return __awaiter(this, void 0, void 0, function () {
            var sm, fullName, d;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        sm = new SampleViewModel();
                        return [4 /*yield*/, sm.waitForReady()];
                    case 1:
                        _a.sent();
                        fullName = "";
                        Atom.set(sm, "data.lastName", "");
                        d = sm.watchFullName();
                        Atom.set(sm, "data.firstName", "Akash");
                        Assert.equals("Akash", sm.data.fullName);
                        Atom.set(sm, "data.lastName", "Kava");
                        Assert.equals("Akash Kava", sm.data.fullName);
                        sm.data = { firstName: "A", lastName: "K" };
                        Assert.equals("A K", sm.data.fullName);
                        d.dispose();
                        Atom.set(sm, "data.lastName", "Kav");
                        Assert.equals(sm.data.fullName, "Akash Kava");
                        sm.dispose();
                        return [2 /*return*/];
                }
            });
        });
    };
    AtomViewModelTest.prototype.receive = function () {
        return __awaiter(this, void 0, void 0, function () {
            var sm;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        sm = new SampleViewModel();
                        return [4 /*yield*/, sm.waitForReady()];
                    case 1:
                        _a.sent();
                        WebAtoms.AtomDevice.instance.broadcast("message1", "message-1");
                        Assert.equals("message1", sm.name);
                        Assert.equals("message-1", sm.data);
                        WebAtoms.AtomDevice.instance.broadcast("message2", "message-2");
                        Assert.equals("message2", sm.name);
                        Assert.equals("message-2", sm.data);
                        return [2 /*return*/];
                }
            });
        });
    };
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
                        return [4 /*yield*/, vm.waitForReady()];
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
                        return [4 /*yield*/, vm.waitForReady()];
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
                        return [4 /*yield*/, vm.waitForReady()];
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
        Test("validation")
    ], AtomViewModelTest.prototype, "validation", null);
    __decorate([
        Test("watch")
    ], AtomViewModelTest.prototype, "watch", null);
    __decorate([
        Test("receive")
    ], AtomViewModelTest.prototype, "receive", null);
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
var WebAtoms;
(function (WebAtoms) {
    var Task = /** @class */ (function () {
        function Task() {
        }
        return Task;
    }());
    WebAtoms.Task = Task;
    var SourceViewModel = /** @class */ (function (_super) {
        __extends(SourceViewModel, _super);
        function SourceViewModel() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        __decorate([
            bindableBroadcast("task-updated")
        ], SourceViewModel.prototype, "task", void 0);
        return SourceViewModel;
    }(WebAtoms.AtomViewModel));
    WebAtoms.SourceViewModel = SourceViewModel;
    var DestinationViewModel = /** @class */ (function (_super) {
        __extends(DestinationViewModel, _super);
        function DestinationViewModel() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        __decorate([
            bindableReceive("task-updated")
        ], DestinationViewModel.prototype, "task", void 0);
        return DestinationViewModel;
    }(WebAtoms.AtomViewModel));
    WebAtoms.DestinationViewModel = DestinationViewModel;
    var BindableTest = /** @class */ (function (_super) {
        __extends(BindableTest, _super);
        function BindableTest() {
            return _super.call(this) || this;
        }
        BindableTest.prototype.bindable = function () {
            return __awaiter(this, void 0, void 0, function () {
                var svm, dvm, t;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            svm = new SourceViewModel();
                            dvm = new DestinationViewModel();
                            return [4 /*yield*/, svm.waitForReady()];
                        case 1:
                            _a.sent();
                            return [4 /*yield*/, dvm.waitForReady()];
                        case 2:
                            _a.sent();
                            t = new Task();
                            t.label = "Test";
                            svm.task = t;
                            Assert.equals("Test", dvm.task.label);
                            return [2 /*return*/];
                    }
                });
            });
        };
        __decorate([
            Test("bindable")
        ], BindableTest.prototype, "bindable", null);
        BindableTest = __decorate([
            Category("Bindable")
        ], BindableTest);
        return BindableTest;
    }(TestItem));
    WebAtoms.BindableTest = BindableTest;
})(WebAtoms || (WebAtoms = {}));
var WebAtoms;
(function (WebAtoms) {
    var BroadcastTest = /** @class */ (function (_super) {
        __extends(BroadcastTest, _super);
        function BroadcastTest() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        BroadcastTest.prototype.prefix = function () {
            return __awaiter(this, void 0, void 0, function () {
                var svm, dvm, t;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            svm = new WebAtoms.SourceViewModel();
                            dvm = new WebAtoms.DestinationViewModel();
                            return [4 /*yield*/, svm.waitForReady()];
                        case 1:
                            _a.sent();
                            return [4 /*yield*/, dvm.waitForReady()];
                        case 2:
                            _a.sent();
                            svm.channelPrefix = "c";
                            t = new WebAtoms.Task();
                            t.label = "new";
                            svm.task = t;
                            Assert.isFalse(dvm.task ? true : false);
                            dvm.channelPrefix = "c";
                            t = new WebAtoms.Task();
                            t.label = "c";
                            svm.task = t;
                            Assert.equals(svm.task.label, dvm.task.label);
                            return [2 /*return*/];
                    }
                });
            });
        };
        __decorate([
            Test("Prefix")
        ], BroadcastTest.prototype, "prefix", null);
        BroadcastTest = __decorate([
            Category("Broadcast Prefix")
        ], BroadcastTest);
        return BroadcastTest;
    }(TestItem));
    WebAtoms.BroadcastTest = BroadcastTest;
})(WebAtoms || (WebAtoms = {}));
var DateTimeService = /** @class */ (function () {
    function DateTimeService() {
    }
    Object.defineProperty(DateTimeService.prototype, "now", {
        get: function () {
            return new Date();
        },
        enumerable: true,
        configurable: true
    });
    DateTimeService = __decorate([
        DIGlobal
    ], DateTimeService);
    return DateTimeService;
}());
var MockDateTimeService = /** @class */ (function (_super) {
    __extends(MockDateTimeService, _super);
    function MockDateTimeService() {
        var _this = _super.call(this) || this;
        _this.current = new Date();
        return _this;
    }
    Object.defineProperty(MockDateTimeService.prototype, "now", {
        get: function () {
            return this.current;
        },
        enumerable: true,
        configurable: true
    });
    return MockDateTimeService;
}(DateTimeService));
var DITests = /** @class */ (function (_super) {
    __extends(DITests, _super);
    function DITests() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DITests.prototype.resolveTest = function () {
        return __awaiter(this, void 0, void 0, function () {
            var ts1, ts2, d1, d2, mts1, mts2, ts3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        ts1 = WebAtoms.DI.resolve(DateTimeService);
                        ts2 = WebAtoms.DI.resolve(DateTimeService);
                        Assert.isTrue(ts1 === ts2);
                        d1 = ts1.now;
                        return [4 /*yield*/, this.delay(100)];
                    case 1:
                        _a.sent();
                        d2 = ts2.now;
                        Assert.isTrue(d1.getTime() !== d2.getTime());
                        WebAtoms.DI.push(DateTimeService, new MockDateTimeService());
                        mts1 = WebAtoms.DI.resolve(DateTimeService);
                        Assert.isTrue(ts1 !== mts1);
                        mts2 = WebAtoms.DI.resolve(DateTimeService);
                        Assert.isTrue(mts1 === mts2);
                        d1 = mts1.now;
                        return [4 /*yield*/, this.delay(100)];
                    case 2:
                        _a.sent();
                        d2 = mts2.now;
                        Assert.isTrue(d1.getTime() === d2.getTime());
                        WebAtoms.DI.pop(DateTimeService);
                        ts3 = WebAtoms.DI.resolve(DateTimeService);
                        Assert.isTrue(ts1 === ts3);
                        return [2 /*return*/];
                }
            });
        });
    };
    __decorate([
        Test("Resolve Test")
    ], DITests.prototype, "resolveTest", null);
    DITests = __decorate([
        Category("DI Tests")
    ], DITests);
    return DITests;
}(TestItem));
var MockWindowService = WebAtoms.MockWindowService;
var WindowTest = /** @class */ (function (_super) {
    __extends(WindowTest, _super);
    function WindowTest() {
        var _this = _super.call(this) || this;
        WebAtoms.DI.push(WindowService, new WebAtoms.MockWindowService());
        return _this;
    }
    WindowTest.prototype.dispose = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                WebAtoms.DI.pop(WindowService);
                return [2 /*return*/];
            });
        });
    };
    WindowTest.prototype.alertTest = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var windowService, alertMsg, alertTitle, confirmMsg, r;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        windowService = WebAtoms.DI.resolve(WindowService);
                        alertMsg = "Sample message";
                        alertTitle = "Sample title";
                        MockWindowService.instance.expectAlert(alertMsg);
                        return [4 /*yield*/, windowService.alert(alertMsg, alertTitle)];
                    case 1:
                        _a.sent();
                        confirmMsg = "Are you sure?";
                        MockWindowService.instance.expectConfirm(confirmMsg, function () { return true; });
                        return [4 /*yield*/, windowService.confirm(confirmMsg, "Some title")];
                    case 2:
                        r = _a.sent();
                        Assert.isTrue(r);
                        MockWindowService.instance.expectConfirm(confirmMsg, function () { return false; });
                        return [4 /*yield*/, windowService.confirm(confirmMsg, "Some title")];
                    case 3:
                        r = _a.sent();
                        Assert.isFalse(r);
                        MockWindowService.instance.assert();
                        return [4 /*yield*/, Assert.throwsAsync("No window registered for __ConfirmWindow_Are you sure?", function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, windowService.confirm(confirmMsg, "Some title")];
                                        case 1:
                                            r = _a.sent();
                                            return [2 /*return*/];
                                    }
                                });
                            }); })];
                    case 4:
                        _a.sent();
                        MockWindowService.instance.expectConfirm(confirmMsg, function () { return false; });
                        Assert.throws("Expected windows did not open __ConfirmWindow_Are you sure?", function () {
                            MockWindowService.instance.assert();
                        });
                        return [2 /*return*/];
                }
            });
        });
    };
    __decorate([
        Test("Alert test")
    ], WindowTest.prototype, "alertTest", null);
    WindowTest = __decorate([
        Category("Window Service Tests")
    ], WindowTest);
    return WindowTest;
}(TestItem));
//# sourceMappingURL=all-tests.js.map