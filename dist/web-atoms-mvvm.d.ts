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
     * Device (usually browser), instance of which supports
     * singleton instance to provide broadcast/messaging
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
        /**
         * This method will run any asynchronous method
         * and it will display an error if it will fail
         * asynchronously
         *
         * @template T
         * @param {() => Promise<T>} tf
         * @memberof AtomDevice
         */
        runAsync<T>(tf: () => Promise<T>): void;
        private bag;
        /**
         * Broadcast given data to channel, only within the current window.
         *
         * @param {string} channel
         * @param {*} data
         * @returns
         * @memberof AtomDevice
         */
        broadcast(channel: string, data: any): void;
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
        subscribe(channel: string, action: AtomAction): AtomDisposable;
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
    /**
     * AtomErrors class holds all validation errors registered in view model.
     *
     * hasErrors() method will return true if there are any validation errors in this AtomErrors object.
     *
     * @export
     * @class AtomErrors
     */
    class AtomErrors {
        private static isInternal;
        private __target;
        /**
         * Creates an instance of AtomErrors.
         * @param {AtomViewModel} target
         * @memberof AtomErrors
         */
        constructor(target: AtomViewModel);
        /**
         *
         *
         * @returns {boolean}
         * @memberof AtomErrors
         */
        hasErrors(): boolean;
        /**
         *
         *
         * @memberof AtomErrors
         */
        clear(): void;
    }
    class ObjectProperty {
        target: object;
        name: string;
        watcher: AtomDisposable;
        constructor(name: string);
    }
    /**
     *
     *
     * @export
     * @class AtomWatcher
     * @implements {AtomDisposable}
     * @template T
     */
    class AtomWatcher<T> implements AtomDisposable {
        private forValidation;
        /**
         * If path was given as an array of string property path, you can use this `func` that will be executed
         * when any of property is updated.
         *
         * You must manually invoke evaluate after setting this property.
         *
         * @memberof AtomWatcher
         */
        func: (t: T) => any;
        private _isExecuting;
        /**
         *
         *
         * @param {boolean} [force]
         * @returns {*}
         * @memberof AtomWatcher
         */
        evaluate(force?: boolean): any;
        path: Array<Array<ObjectProperty>>;
        target: any;
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
         * @param {(string[] | ((x:T) => any))} path - Path is either lambda expression or array of property path to watch, if path was lambda, it will be executed when any of members will modify
         * @param {boolean} [forValidation] forValidtion - Ignore, used for internal purpose
         * @memberof AtomWatcher
         */
        constructor(target: T, path: string[] | ((x: T) => any), forValidation?: boolean);
        /**
         * This will dispose and unregister all watchers
         *
         * @memberof AtomWatcher
         */
        dispose(): void;
    }
}
/**
 * Easy and Simple Dependency Injection
 */
declare namespace WebAtoms {
    /**
     *
     *
     * @export
     * @class DI
     */
    class DI {
        private static factory;
        /**
         *
         *
         * @static
         * @template T
         * @param {new () => T} key
         * @param {() => T} factory
         * @param {boolean} [transient=false] - If true, always new instance will be created
         * @memberof DI
         */
        static register<T>(key: new () => T, factory: () => T, transient?: boolean): void;
        /**
         *
         *
         * @static
         * @template T
         * @param {new () => T} c
         * @returns {T}
         * @memberof DI
         */
        static resolve<T>(c: new () => T): T;
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
        static push(key: any, instance: any): void;
        /**
         *
         *
         * @static
         * @param {*} key
         * @memberof DI
         */
        static pop(key: any): void;
    }
    /**
     * This decorator will register given class as singleton instance on DI.
     *
     *      @DIGlobal
     *      class BackendService{
     *      }
     *
     *
     * @export
     * @param {new () => any} c
     * @returns
     */
    function DIGlobal(c: new () => any): new () => any;
    /**
     * This decorator will register given class as transient instance on DI.
     *
     *      @DIAlwaysNew
     *      class StringHelper{
     *      }
     *
     * @export
     * @param {new () => any} c
     * @returns
     */
    function DIAlwaysNew(c: new () => any): new () => any;
}
declare var DIGlobal: typeof WebAtoms.DIGlobal;
declare var DIAlwaysNew: typeof WebAtoms.DIAlwaysNew;
declare function methodBuilder(method: string): (url: string) => (target: WebAtoms.Rest.BaseService, propertyKey: string, descriptor: any) => void;
declare function Return(type: {
    new ();
}): (target: WebAtoms.Rest.BaseService, propertyKey: string, descriptor: any) => void;
declare function parameterBuilder(paramName: string): (key: string) => (target: WebAtoms.Rest.BaseService, propertyKey: string | symbol, parameterIndex: number) => void;
declare var Atom: any;
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
declare var Path: (key: string) => (target: WebAtoms.Rest.BaseService, propertyKey: string | symbol, parameterIndex: number) => void;
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
declare var Query: (key: string) => (target: WebAtoms.Rest.BaseService, propertyKey: string | symbol, parameterIndex: number) => void;
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
declare var Body: (target: WebAtoms.Rest.BaseService, propertyKey: string | symbol, parameterIndex: number) => void;
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
declare var Post: (url: string) => (target: WebAtoms.Rest.BaseService, propertyKey: string, descriptor: any) => void;
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
declare var Get: (url: string) => (target: WebAtoms.Rest.BaseService, propertyKey: string, descriptor: any) => void;
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
declare var Delete: (url: string) => (target: WebAtoms.Rest.BaseService, propertyKey: string, descriptor: any) => void;
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
declare var Put: (url: string) => (target: WebAtoms.Rest.BaseService, propertyKey: string, descriptor: any) => void;
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
    /**
     *
     *
     * @export
     * @class CancellablePromise
     * @implements {Promise<T>}
     * @template T
     */
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
