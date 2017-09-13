declare function bindableProperty(target: any, key: string): void;
declare namespace WebAtoms {
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
    class AtomCommand<T> extends AtomModel {
        readonly isMVVMAtomCommand: boolean;
        private _enabled;
        enabled: boolean;
        private _busy;
        busy: boolean;
        private action;
        execute: (p: T) => any;
        private executeAction(p);
        constructor(action: (p: T) => any);
    }
}
declare namespace WebAtoms {
    class DisposableAction implements AtomDisposable {
        f: () => void;
        constructor(f: () => void);
        dispose(): void;
    }
    interface AtomDisposable {
        dispose(): any;
    }
    type AtomAction = (msg: string, data: any) => void;
    class AtomMessageAction {
        message: string;
        action: AtomAction;
        constructor(msg: string, a: AtomAction);
    }
    class AtomDevice {
        static instance: AtomDevice;
        constructor();
        runAsync<T>(tf: () => Promise<T>): void;
        private bag;
        broadcast(msg: string, data: any): void;
        subscribe(msg: string, action: AtomAction): AtomDisposable;
    }
}
declare namespace WebAtoms {
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
    class AtomViewModel extends AtomModel {
        private disposables;
        constructor();
        private privateInit();
        private validations;
        private _errors;
        protected createErrors<T extends AtomErrors>(c: new () => T): T;
        readonly isValid: boolean;
        protected addValidation<T extends AtomViewModel>(target: T, ft: (x: T) => any): AtomDisposable;
        protected watch<T extends AtomViewModel>(target: T, ft: (x: T) => any): AtomDisposable;
        protected registerDisposable(d: AtomDisposable): void;
        protected onPropertyChanged(name: string): void;
        protected onMessage<T>(msg: string, a: (data: T) => void): void;
        broadcast(msg: string, data: any): void;
        init(): Promise<any>;
        dispose(): void;
    }
    class AtomWindowViewModel extends AtomViewModel {
        windowName: string;
        close(result?: any): void;
        cancel(): void;
    }
}
declare namespace WebAtoms {
    class AtomErrors {
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
    class WindowService {
        private lastWindowID;
        alert(msg: string, title?: string): Promise<any>;
        confirm(msg: string, title?: string): Promise<boolean>;
        private showAlert(msg, title, confirm);
        openWindow<T>(windowType: string | {
            new (e);
        }, viewModel?: any): Promise<T>;
    }
}
declare var WindowService: typeof WebAtoms.WindowService;
