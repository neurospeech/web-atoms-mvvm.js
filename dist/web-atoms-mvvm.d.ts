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
        runAsync<T>(task: Promise<T>): Promise<any>;
        private bag;
        broadcast(msg: string, data: any): void;
        subscribe(msg: string, action: AtomAction): AtomAction;
        unsubscribe(msg: string, action: AtomAction): void;
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
        watch(f: () => void): () => void;
        unwatch(f: () => void): void;
    }
}
declare namespace WebAtoms {
    class AtomViewModel extends AtomModel {
        private subscriptions;
        private disposables;
        constructor();
        protected registerDisposable(d: AtomDisposable): void;
        protected onMessage<T>(msg: string, a: (data: T) => void): void;
        broadcast(msg: string, data: any): void;
        init(): Promise<any>;
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
        static resolve(c: any): any;
    }
    function DIGlobal(): (c: any) => any;
    function DIAlwaysNew(): (c: any) => any;
}
declare var DIGlobal: (c: any) => any;
declare var DIAlwaysNew: (c: any) => any;
declare function methodBuilder(method: string): (url: string) => (target: WebAtoms.Rest.BaseService, propertyKey: string, descriptor: any) => void;
declare function Return(type: {
    new ();
}): (target: WebAtoms.Rest.BaseService, propertyKey: string, descriptor: any) => void;
declare function parameterBuilder(paramName: string): (key: string) => (target: WebAtoms.Rest.BaseService, propertyKey: string | symbol, parameterIndex: number) => void;
declare var Atom: any;
declare var Path: (key: string) => (target: WebAtoms.Rest.BaseService, propertyKey: string | symbol, parameterIndex: number) => void;
declare var Query: (key: string) => (target: WebAtoms.Rest.BaseService, propertyKey: string | symbol, parameterIndex: number) => void;
declare var Body: (key: string) => (target: WebAtoms.Rest.BaseService, propertyKey: string | symbol, parameterIndex: number) => void;
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
    class BaseService {
        methods: any;
        methodReturns: any;
        encodeData(o: AjaxOptions): AjaxOptions;
        invoke(url: string, method: string, bag: Array<ServiceParameter>, values: Array<any>, returns: {
            new ();
        }): Promise<any>;
    }
}
