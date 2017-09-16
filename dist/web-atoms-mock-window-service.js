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
    var MockWindow = /** @class */ (function () {
        /**
         * Creates an instance of MockWindow.
         * Window will cancel in given delay milliseconds and it will
         * reject the corresponding promise
         * @param {number} [delay=10000]
         * @memberof MockWindow
         */
        function MockWindow(delay) {
            if (delay === void 0) { delay = 10000; }
            this.windowName = "window_" + MockWindow.id++;
            // subscribe for all messages...
            this.register();
        }
        MockWindow.prototype.close = function () {
        };
        MockWindow.prototype.register = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/];
                });
            });
        };
        MockWindow.id = 1;
        return MockWindow;
    }());
    WebAtoms.MockWindow = MockWindow;
    var MockConfirmViewModel = /** @class */ (function (_super) {
        __extends(MockConfirmViewModel, _super);
        function MockConfirmViewModel() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return MockConfirmViewModel;
    }(WebAtoms.AtomWindowViewModel));
    WebAtoms.MockConfirmViewModel = MockConfirmViewModel;
    /**
     *
     *
     * @export
     * @class MockWindowService
     * @extends {WebAtoms.WindowService}
     */
    var MockWindowService = /** @class */ (function (_super) {
        __extends(MockWindowService, _super);
        function MockWindowService() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.windowStack = [];
            return _this;
        }
        Object.defineProperty(MockWindowService, "instance", {
            get: function () {
                var d = WebAtoms.DI.resolve(WebAtoms.WindowService);
                if (d instanceof MockWindowService)
                    return d;
                throw new Error("MockWindowService not yet setup");
            },
            enumerable: true,
            configurable: true
        });
        MockWindowService.register = function () {
            WebAtoms.DI.push(WebAtoms.WindowService, new MockWindowService());
        };
        MockWindowService.prototype.alert = function (msg, title) {
            var mvm = new MockConfirmViewModel();
            mvm.message = msg;
            mvm.title = title;
            return this.openWindow("__AlertWindow_" + msg, mvm);
        };
        MockWindowService.prototype.confirm = function (msg, title) {
            var mvm = new MockConfirmViewModel();
            mvm.message = msg;
            mvm.title = title;
            return this.openWindow("__ConfirmWindow_" + msg, mvm);
        };
        MockWindowService.prototype.openWindow = function (c, vm) {
            var _this = this;
            return new Promise(function (resolve, reject) {
                var w = _this.windowStack.find(function (x) { return x.windowType == c; });
                if (!w) {
                    var ex = new Error("No window registered for " + c);
                    reject(ex);
                    return;
                }
                setTimeout(function () {
                    try {
                        resolve(w.action(vm));
                    }
                    catch (e) {
                        reject(e);
                    }
                }, 5);
            });
        };
        /**
         *
         *
         * @param {string} msg
         * @returns {AtomDisposable}
         * @memberof MockWindowService
         */
        MockWindowService.prototype.expectAlert = function (msg) {
            return this.expectWindow("__AlertWindow_" + msg, function (vm) { return true; });
        };
        /**
         *
         *
         * @param {string} msg
         * @param {(vm:MockConfirmViewModel) => boolean} action
         * @returns {AtomDisposable}
         * @memberof MockWindowService
         */
        MockWindowService.prototype.expectConfirm = function (msg, action) {
            return this.expectWindow("__ConfirmWindow_" + msg, action);
        };
        /**
         *
         *
         * @template TViewModel
         * @param {__windowType} windowType
         * @param {(vm:TViewModel) => any} windowAction
         * @param {number} [maxDelay=10000]
         * @returns {AtomDisposable}
         * @memberof MockWindowService
         */
        MockWindowService.prototype.expectWindow = function (windowType, windowAction) {
            var _this = this;
            var registration = { windowType: windowType, action: windowAction };
            registration.action = function (vm) {
                _this.removeRegistration(registration);
                return windowAction(vm);
            };
            this.windowStack.push(registration);
            return new WebAtoms.DisposableAction(function () {
                _this.removeRegistration(registration);
            });
        };
        MockWindowService.prototype.removeRegistration = function (r) {
            this.windowStack = this.windowStack.filter(function (x) { return x !== r; });
        };
        MockWindowService.prototype.assert = function () {
            if (!this.windowStack.length)
                return;
            throw new Error("Expected windows did not open " + this.windowStack.map(function (x) { return x.windowType; }).join(","));
        };
        return MockWindowService;
    }(WebAtoms.WindowService));
    WebAtoms.MockWindowService = MockWindowService;
})(WebAtoms || (WebAtoms = {}));
//# sourceMappingURL=web-atoms-mock-window-service.js.map