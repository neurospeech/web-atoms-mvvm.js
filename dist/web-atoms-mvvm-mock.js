var WebAtoms;
(function (WebAtoms) {
    /**
     * BrowserService provides access to browser attributes
     * such as title of current window, location etc.
     *
     * @export
     * @class BrowserService
     */
    var MockBrowserService = /** @class */ (function () {
        function MockBrowserService() {
            this._title = null;
            this._location = {};
        }
        Object.defineProperty(MockBrowserService, "instance", {
            /**
             * DI Resolved instance
             *
             * @readonly
             * @static
             * @type {BrowserService}
             * @memberof BrowserService
             */
            get: function () {
                return WebAtoms.DI.resolve(WebAtoms.BrowserService);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MockBrowserService.prototype, "title", {
            /**
             * Get current window title
             *
             * @type {string}
             * @memberof BrowserService
             */
            get: function () {
                return this._title;
            },
            /**
             * Set current window title
             * @memberof BrowserService
             */
            set: function (v) {
                this._title = v;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MockBrowserService.prototype, "location", {
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
                return this._location;
            },
            enumerable: true,
            configurable: true
        });
        /**
         * Navigate current browser to given url.
         * @param {string} url
         * @memberof BrowserService
         */
        MockBrowserService.prototype.navigate = function (url) {
            this._location.href = url;
        };
        Object.defineProperty(MockBrowserService.prototype, "appScope", {
            /**
             * Get access to available appScope from Web Atoms.
             * @readonly
             * @type {*}
             * @memberof BrowserService
             */
            get: function () {
                // tslint:disable-next-line:no-string-literal
                return MockBrowserService._appScope;
            },
            enumerable: true,
            configurable: true
        });
        MockBrowserService._appScope = {};
        return MockBrowserService;
    }());
    WebAtoms.MockBrowserService = MockBrowserService;
})(WebAtoms || (WebAtoms = {}));
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
var WebAtoms;
(function (WebAtoms) {
    var MockConfirmViewModel = /** @class */ (function (_super) {
        __extends(MockConfirmViewModel, _super);
        function MockConfirmViewModel() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return MockConfirmViewModel;
    }(WebAtoms.AtomWindowViewModel));
    WebAtoms.MockConfirmViewModel = MockConfirmViewModel;
    /**
     * Mock of WindowService for unit tests
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
            /**
             * DI resolved instance of MockWindowService (WindowService)
             * @readonly
             * @static
             * @type {MockWindowService}
             * @memberof MockWindowService
             */
            get: function () {
                var d = WebAtoms.DI.resolve(WebAtoms.WindowService);
                if (d instanceof MockWindowService) {
                    return d;
                }
                throw new Error("MockWindowService not yet setup");
            },
            enumerable: true,
            configurable: true
        });
        /**
         * Registers new MockWindowService
         * @static
         * @memberof MockWindowService
         */
        MockWindowService.register = function () {
            WebAtoms.DI.push(WebAtoms.WindowService, new MockWindowService());
        };
        /**
         * Internal usage
         * @param {string} msg
         * @param {string} [title]
         * @returns {Promise<any>}
         * @memberof MockWindowService
         */
        MockWindowService.prototype.alert = function (msg, title) {
            var mvm = new MockConfirmViewModel();
            mvm.message = msg;
            mvm.title = title;
            return this.openWindow("__AlertWindow_" + msg, mvm);
        };
        /**
         * Internal usage
         * @param {string} msg
         * @param {string} [title]
         * @returns {Promise<boolean>}
         * @memberof MockWindowService
         */
        MockWindowService.prototype.confirm = function (msg, title) {
            var mvm = new MockConfirmViewModel();
            mvm.message = msg;
            mvm.title = title;
            return this.openWindow("__ConfirmWindow_" + msg, mvm);
        };
        /**
         * Internal usage
         * @template T
         * @param {__windowType} c
         * @param {AtomViewModel} vm
         * @returns {Promise<T>}
         * @memberof MockWindowService
         */
        MockWindowService.prototype.openWindow = function (c, vm) {
            var _this = this;
            return new Promise(function (resolve, reject) {
                var w = _this.windowStack.find(function (x) { return x.windowType === c; });
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
         * Call this method before any method that should expect an alert.
         * You can add many alerts, but each expected alert will only be called
         * once.
         * @param {string} msg
         * @returns {AtomDisposable}
         * @memberof MockWindowService
         */
        MockWindowService.prototype.expectAlert = function (msg) {
            return this.expectWindow("__AlertWindow_" + msg, function (vm) { return true; });
        };
        /**
         * Call this method before any method that should expect a confirm.
         * You can add many confirms, but each expected confirm will only be called
         * once.
         * @param {string} msg
         * @param {(vm:MockConfirmViewModel) => boolean} action
         * @returns {AtomDisposable}
         * @memberof MockWindowService
         */
        MockWindowService.prototype.expectConfirm = function (msg, action) {
            return this.expectWindow("__ConfirmWindow_" + msg, action);
        };
        /**
         * Call this method before any method that should expect a window of given type.
         * Each window will only be used once and return value in windowAction will be
         * resolved in promise created by openWindow call.
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
            if (!this.windowStack.length) {
                return;
            }
            throw new Error("Expected windows did not open " + this.windowStack.map(function (x) { return x.windowType; }).join(","));
        };
        return MockWindowService;
    }(WebAtoms.WindowService));
    WebAtoms.MockWindowService = MockWindowService;
})(WebAtoms || (WebAtoms = {}));
//# sourceMappingURL=web-atoms-mvvm-mock.js.map