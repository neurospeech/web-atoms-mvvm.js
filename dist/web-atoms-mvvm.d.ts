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
declare function bindableProperty(target: any, key: string): void;
declare namespace WebAtoms {
    /**
     *
     *
     * @export
     * @class CancelToken
     */
    class CancelToken {
        listeners: Array<() => void>;
        private _cancelled;
        readonly cancelled: boolean;
        cancel(): void;
        reset(): void;
        registerForCancel(f: () => void): void;
    }
    class AtomModel {
        refresh(name: String): void;
    }
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
    class AtomCommand<T> extends AtomModel {
        readonly isMVVMAtomCommand: boolean;
        private _enabled;
        /**
         *
         *
         * @type {boolean}
         * @memberof AtomCommand
         */
        enabled: boolean;
        private _busy;
        /**
         *
         *
         * @type {boolean}
         * @memberof AtomCommand
         */
        busy: boolean;
        private action;
        execute: (p: T) => any;
        private executeAction(p);
        constructor(action: (p: T) => any);
    }
}
declare namespace WebAtoms {
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
    class DisposableAction implements AtomDisposable {
        f: () => void;
        constructor(f: () => void);
        dispose(): void;
    }
    /**
     *
     *
     * @export
     * @interface AtomDisposable
     */
    interface AtomDisposable {
        dispose(): any;
    }
    type AtomAction = (msg: string, data: any) => void;
    class AtomMessageAction {
        message: string;
        action: AtomAction;
        constructor(msg: string, a: AtomAction);
    }
    /**
     *
     *
     * @export
     * @class AtomDevice
     */
    class AtomDevice {
        /**
         *
         *
         * @static
         * @type {AtomDevice}
         * @memberof AtomDevice
         */
        static instance: AtomDevice;
        constructor();
        runAsync<T>(tf: () => Promise<T>): void;
        private bag;
        /**
         *
         *
         * @param {string} msg
         * @param {*} data
         * @returns
         * @memberof AtomDevice
         */
        broadcast(msg: string, data: any): void;
        /**
         *
         *
         * @param {string} msg
         * @param {AtomAction} action
         * @returns {AtomDisposable}
         * @memberof AtomDevice
         */
        subscribe(msg: string, action: AtomAction): AtomDisposable;
    }
}
declare namespace WebAtoms {
    /**
     *
     *
     * @export
     * @class AtomList
     * @extends {Array<T>}
     * @template T
     */
    class AtomList<T> extends Array<T> {
        constructor();
        add(item: T): number;
        addAll(items: Array<T>): void;
        insert(i: number, item: T): void;
        removeAt(i: number): void;
        remove(item: T): void;
        clear(): void;
        refresh(): void;
        watch(f: () => void): AtomDisposable;
    }
}
declare namespace WebAtoms {
    /**
     *
     *
     * @export
     * @class AtomViewModel
     * @extends {AtomModel}
     */
    class AtomViewModel extends AtomModel {
        private disposables;
        constructor();
        private privateInit();
        private validations;
        /**
         * Internal method, do not use, instead use errors.hasErrors()
         *
         * @memberof AtomViewModel
         */
        validate(): void;
        /**
         * Adds validation expression to be executed when any bindable expression is updated.
         *
         * `target` must always be set to `this`.
         *
         *      this.addValidation(this, x => {
         *          x.errors.nameError = x.data.firstName ? "" : "Name cannot be empty";
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
         * @param {T} target
         * @param {(x:T) => any} ft
         * @returns {AtomDisposable}
         * @memberof AtomViewModel
         */
        protected addValidation<T extends AtomViewModel>(target: T, ft: (x: T) => any): AtomDisposable;
        /**
         * Execute given expression whenever any bindable expression changes
         * in the expression.
         *
         * For correct generic type resolution, target must always be `this`.
         *
         *      this.watch(this, x => {
         *          if(!x.data.fullName){
         *              x.data.fullName = `${x.data.firstName} ${x.data.lastName}`;
         *          }
         *      });
         *
         * @protected
         * @template T
         * @param {T} target
         * @param {(x:T) => any} ft
         * @returns {AtomDisposable}
         * @memberof AtomViewModel
         */
        protected watch<T extends AtomViewModel>(target: T, ft: (x: T) => any): AtomDisposable;
        /**
         * Register a disposable to be disposed when view model will be disposed.
         *
         * @protected
         * @param {AtomDisposable} d
         * @memberof AtomViewModel
         */
        protected registerDisposable(d: AtomDisposable): void;
        protected onPropertyChanged(name: string): void;
        /**
         * Register listener for given message.
         *
         * @protected
         * @template T
         * @param {string} msg
         * @param {(data: T) => void} a
         * @memberof AtomViewModel
         */
        protected onMessage<T>(msg: string, a: (data: T) => void): void;
        /**
         * Broadcast given data to channel (msg)
         *
         * @param {string} msg
         * @param {*} data
         * @memberof AtomViewModel
         */
        broadcast(msg: string, data: any): void;
        /**
         * Put your asynchronous initializations here
         *
         * @returns {Promise<any>}
         * @memberof AtomViewModel
         */
        init(): Promise<any>;
        /**
         * dispose method will becalled when attached view will be disposed or
         * when a new view model will be assigned to view, old view model will be disposed.
         *
         * @memberof AtomViewModel
         */
        dispose(): void;
    }
    /**
     * This view model should be used with WindowService to create and open window.
     *
     * This view model has `close` and `cancel` methods. `close` method will
     * close the window and will resolve the given result in promise. `cancel`
     * will reject the given promise.
     *
     *      var windowService = WebAtoms.DI.resolve(WindowService);
     *      var result = await
     *          windowService.openWindow(
     *              "Namespace.WindowName",
     *              new WindowNameViewModel());
     *
     * @export
     * @class AtomWindowViewModel
     * @extends {AtomViewModel}
     */
    class AtomWindowViewModel extends AtomViewModel {
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
        windowName: string;
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
        close(result?: any): void;
        /**
         * This will broadcast `atom-window-cancel:windowName`
         * WindowService will cancel the window on receipt of such message and
         * it will reject the promise with "cancelled" message.
         *
         *      this.cancel();
         *
         * @memberof AtomWindowViewModel
         */
        cancel(): void;
    }
}
declare namespace WebAtoms {
    class AtomErrors {
        private __target;
        constructor(target: AtomViewModel);
        hasErrors(): boolean;
        clear(): void;
    }
    class ObjectProperty {
        target: object;
        name: string;
        watcher: AtomDisposable;
        constructor(name: string);
    }
    class AtomWatcher<T> implements AtomDisposable {
        private forValidation;
        func: (t: T) => any;
        private _isExecuting;
        evaluate(force?: boolean): any;
        path: Array<Array<ObjectProperty>>;
        target: any;
        constructor(target: T, path: string[] | ((x: T) => any), forValidation?: boolean);
        dispose(): void;
    }
}
/**
 * Easy and Simple Dependency Injection
 */
declare namespace WebAtoms {
    class DI {
        private static factory;
        static instances: any;
        static register(key: any, factory: any): void;
        static resolve<T>(c: new () => T): T;
        static put(key: any, instance: any): void;
    }
    function DIGlobal(c: any): any;
    function DIAlwaysNew(c: any): any;
}
declare var DIGlobal: typeof WebAtoms.DIGlobal;
declare var DIAlwaysNew: typeof WebAtoms.DIAlwaysNew;
declare function methodBuilder(method: string): (url: string) => (target: WebAtoms.Rest.BaseService, propertyKey: string, descriptor: any) => void;
declare function Return(type: {
    new ();
}): (target: WebAtoms.Rest.BaseService, propertyKey: string, descriptor: any) => void;
declare function parameterBuilder(paramName: string): (key: string) => (target: WebAtoms.Rest.BaseService, propertyKey: string | symbol, parameterIndex: number) => void;
declare var Atom: any;
declare var Path: (key: string) => (target: WebAtoms.Rest.BaseService, propertyKey: string | symbol, parameterIndex: number) => void;
declare var Query: (key: string) => (target: WebAtoms.Rest.BaseService, propertyKey: string | symbol, parameterIndex: number) => void;
declare var Body: (target: WebAtoms.Rest.BaseService, propertyKey: string | symbol, parameterIndex: number) => void;
declare var Post: (url: string) => (target: WebAtoms.Rest.BaseService, propertyKey: string, descriptor: any) => void;
declare var Get: (url: string) => (target: WebAtoms.Rest.BaseService, propertyKey: string, descriptor: any) => void;
declare var Delete: (url: string) => (target: WebAtoms.Rest.BaseService, propertyKey: string, descriptor: any) => void;
declare var Put: (url: string) => (target: WebAtoms.Rest.BaseService, propertyKey: string, descriptor: any) => void;
declare var Cancel: (target: WebAtoms.Rest.BaseService, propertyKey: string | symbol, parameterIndex: number) => void;
declare namespace WebAtoms.Rest {
    class ServiceParameter {
        key: string;
        type: string;
        constructor(type: string, key: string);
    }
    class AjaxOptions {
        method: string;
        url: string;
        data: any;
        type: string;
        cancel: CancelToken;
    }
    class CancellablePromise<T> implements Promise<T> {
        [Symbol.toStringTag]: "Promise";
        onCancel: () => void;
        p: Promise<T>;
        constructor(p: Promise<T>, onCancel: () => void);
        abort(): void;
        then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): Promise<TResult1 | TResult2>;
        catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): Promise<T | TResult>;
    }
    /**
     *
     *
     * @export
     * @class BaseService
     */
    class BaseService {
        testMode: boolean;
        showProgress: boolean;
        showError: boolean;
        methods: any;
        methodReturns: any;
        encodeData(o: AjaxOptions): AjaxOptions;
        sendResult(result: any, error?: any): Promise<any>;
        invoke(url: string, method: string, bag: Array<ServiceParameter>, values: Array<any>, returns: {
            new ();
        }): Promise<any>;
    }
}
declare namespace WebAtoms {
    /**
     *
     *
     * @export
     * @class WindowService
     */
    class WindowService {
        private lastWindowID;
        /**
         *
         *
         * @param {string} msg
         * @param {string} [title]
         * @returns {Promise<any>}
         * @memberof WindowService
         */
        alert(msg: string, title?: string): Promise<any>;
        /**
         *
         *
         * @param {string} msg
         * @param {string} [title]
         * @returns {Promise<boolean>}
         * @memberof WindowService
         */
        confirm(msg: string, title?: string): Promise<boolean>;
        private showAlert(msg, title, confirm);
        /**
         *
         *
         * @template T
         * @param {(string | {new(e)})} windowType
         * @param {*} [viewModel]
         * @returns {Promise<T>}
         * @memberof WindowService
         */
        openWindow<T>(windowType: string | {
            new (e);
        }, viewModel?: any): Promise<T>;
    }
}
declare var WindowService: typeof WebAtoms.WindowService;
