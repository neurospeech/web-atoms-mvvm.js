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
var AtomErrors = WebAtoms.AtomErrors;
var initCalled = false;
var SampleViewModelErrors = /** @class */ (function (_super) {
    __extends(SampleViewModelErrors, _super);
    function SampleViewModelErrors() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        errorIf(function (x) { return !x.data.firstName; }, "Name cannot be empty")
    ], SampleViewModelErrors.prototype, "name", void 0);
    return SampleViewModelErrors;
}(AtomErrors));
var SampleViewModel = /** @class */ (function (_super) {
    __extends(SampleViewModel, _super);
    function SampleViewModel() {
        var _this = _super.call(this) || this;
        _this.list = new WebAtoms.AtomList();
        _this.data = {};
        _this.errors = _this.createErrors(SampleViewModelErrors);
        return _this;
        // this.errors
        //     .ifEmpty( x => x.data.firstName || x.data.lastName)
        //     .setError("name","Name cannot be empty");
        // this.errors
        //     .ifExpression("data.firstName")
        //     .isEmpty()
        //     .setError("name","Name cannot be empty");
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
    ], SampleViewModel.prototype, "data", void 0);
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
    AtomViewModelTest.prototype.watch = function () {
        return __awaiter(this, void 0, void 0, function () {
            var sm;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        sm = new SampleViewModel();
                        return [4 /*yield*/, this.delay(100)];
                    case 1:
                        _a.sent();
                        debugger;
                        Atom.set(sm, "data.firstName", "something");
                        Assert.isTrue(sm.errors.name == "", "Error is not empty " + sm.errors.name);
                        Atom.set(sm, "data.firstName", "");
                        Assert.isTrue(sm.errors.name != "", "Error is empty " + sm.errors.name);
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
        Test("watch")
    ], AtomViewModelTest.prototype, "watch", null);
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