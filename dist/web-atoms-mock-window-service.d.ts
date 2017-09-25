declare namespace WebAtoms {
    /**
     * BrowserService provides access to browser attributes
     * such as title of current window, location etc.
     *
     * @export
     * @class BrowserService
     */
    class MockBrowserService {
        /**
         * DI Resolved instance
         *
         * @readonly
         * @static
         * @type {BrowserService}
         * @memberof BrowserService
         */
        static readonly instance: BrowserService;
        private _title;
        /**
         * Get current window title
         *
         * @type {string}
         * @memberof BrowserService
         */
        /**
         * Set current window title
         * @memberof BrowserService
         */
        title: string;
        private _location;
        /**
         * Gets current location of browser, this does not return
         * actual location but it returns values of browser location.
         * This is done to provide mocking behaviour for unit testing.
         *
         * @readonly
         * @type {AtomLocation}
         * @memberof BrowserService
         */
        readonly location: AtomLocation;
        /**
         * Navigate current browser to given url.
         * @param {string} url
         * @memberof BrowserService
         */
        navigate(url: string): void;
        private static _appScope;
        /**
         * Get access to available appScope from Web Atoms.
         * @readonly
         * @type {*}
         * @memberof BrowserService
         */
        readonly appScope: any;
    }
}
declare namespace WebAtoms {
    type __windowType = (string | (new () => any));
    type __windowRegistration = {
        windowType: __windowType;
        action: (vm: AtomViewModel) => any;
    };
    class MockConfirmViewModel extends AtomWindowViewModel {
        message: string;
        title: string;
    }
    /**
     * Mock of WindowService for unit tests
     * @export
     * @class MockWindowService
     * @extends {WebAtoms.WindowService}
     */
    class MockWindowService extends WebAtoms.WindowService {
        /**
         * DI resolved instance of MockWindowService (WindowService)
         * @readonly
         * @static
         * @type {MockWindowService}
         * @memberof MockWindowService
         */
        static readonly instance: MockWindowService;
        /**
         * Registers new MockWindowService
         * @static
         * @memberof MockWindowService
         */
        static register(): void;
        /**
         * Internal usage
         * @param {string} msg
         * @param {string} [title]
         * @returns {Promise<any>}
         * @memberof MockWindowService
         */
        alert(msg: string, title?: string): Promise<any>;
        /**
         * Internal usage
         * @param {string} msg
         * @param {string} [title]
         * @returns {Promise<boolean>}
         * @memberof MockWindowService
         */
        confirm(msg: string, title?: string): Promise<boolean>;
        /**
         * Internal usage
         * @template T
         * @param {__windowType} c
         * @param {AtomViewModel} vm
         * @returns {Promise<T>}
         * @memberof MockWindowService
         */
        openWindow<T>(c: __windowType, vm: AtomViewModel): Promise<T>;
        private windowStack;
        /**
         * Call this method before any method that should expect an alert.
         * You can add many alerts, but each expected alert will only be called
         * once.
         * @param {string} msg
         * @returns {AtomDisposable}
         * @memberof MockWindowService
         */
        expectAlert(msg: string): AtomDisposable;
        /**
         * Call this method before any method that should expect a confirm.
         * You can add many confirms, but each expected confirm will only be called
         * once.
         * @param {string} msg
         * @param {(vm:MockConfirmViewModel) => boolean} action
         * @returns {AtomDisposable}
         * @memberof MockWindowService
         */
        expectConfirm(msg: string, action: (vm: MockConfirmViewModel) => boolean): AtomDisposable;
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
        expectWindow<TViewModel extends AtomViewModel>(windowType: __windowType, windowAction: (vm: TViewModel) => any): AtomDisposable;
        removeRegistration(r: __windowRegistration): void;
        assert(): void;
    }
}
