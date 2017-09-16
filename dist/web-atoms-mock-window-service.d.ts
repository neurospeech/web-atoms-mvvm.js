declare namespace WebAtoms {
    class MockWindow<T> {
        windowName: string;
        static id: number;
        /**
         * Creates an instance of MockWindow.
         * Window will cancel in given delay milliseconds and it will
         * reject the corresponding promise
         * @param {number} [delay=10000]
         * @memberof MockWindow
         */
        constructor(delay?: number);
        close(): void;
        register(): Promise<any>;
    }
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
     *
     *
     * @export
     * @class MockWindowService
     * @extends {WebAtoms.WindowService}
     */
    class MockWindowService extends WebAtoms.WindowService {
        static readonly instance: MockWindowService;
        static register(): void;
        alert(msg: string, title?: string): Promise<any>;
        confirm(msg: string, title?: string): Promise<boolean>;
        openWindow<T>(c: __windowType, vm: AtomViewModel): Promise<T>;
        private windowStack;
        /**
         *
         *
         * @param {string} msg
         * @returns {AtomDisposable}
         * @memberof MockWindowService
         */
        expectAlert(msg: string): AtomDisposable;
        /**
         *
         *
         * @param {string} msg
         * @param {(vm:MockConfirmViewModel) => boolean} action
         * @returns {AtomDisposable}
         * @memberof MockWindowService
         */
        expectConfirm(msg: string, action: (vm: MockConfirmViewModel) => boolean): AtomDisposable;
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
        expectWindow<TViewModel extends AtomViewModel>(windowType: __windowType, windowAction: (vm: TViewModel) => any): AtomDisposable;
        removeRegistration(r: __windowRegistration): void;
        assert(): void;
    }
}
