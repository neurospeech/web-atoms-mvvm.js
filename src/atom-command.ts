
/**
 * Atom helper class
 * @class Atom
 */
declare class Atom {

    /**
     * Set this true to return mock in RestServices
     * @static
     * @type {boolean}
     * @memberof Atom
     */
    static designMode: boolean;

    /**
     * Refreshes bindings for specified property of the target
     * @static
     * @param {*} target
     * @param {string} property
     * @memberof Atom
     */
    static refresh(target:any, property: string):void;

    /**
     * Display given error message to user, this must be set by
     * the app developer
     * @static
     * @param {string} msg
     * @memberof Atom
     */
    static showError(msg: string): void;

    /**
     * [Obsolete] do not use, this will retrieve value at given path for target
     * @static
     * @param {*} target
     * @param {string} path
     * @returns {*}
     * @memberof Atom
     */
    static get(target: any, path: string): any;

    /**
     * [Obsolete] do not use, this will set value at given path for target
     * @static
     * @param {*} target
     * @param {string} path
     * @param {*} value
     * @memberof Atom
     */
    static set(target: any, path: string, value: any): void;

    /**
     * Schedules given call in next available callLater slot
     * @static
     * @param {()=>void} f
     * @memberof Atom
     */
    static post (f:()=>void): void;

    /**
     * Schedules given call in next available callLater slot and also returns
     * promise that can be awaited, calling `Atom.postAsync` inside `Atom.postAsync`
     * will create deadlock
     * @static
     * @param {()=>Promise<any>} f
     * @returns {Promise<any>}
     * @memberof Atom
     */
    static postAsync(f:()=>Promise<any>): Promise<any>;

    /**
     * Invokes given function and disposes given object after execution
     * @static
     * @param {WebAtoms.AtomDisposable} d
     * @param {()=>void} f
     * @memberof Atom
     */
    static using(d:WebAtoms.AtomDisposable, f:()=>void): void;

    /**
     * Invokes given function and disposes given object after execution asynchronously
     * @static
     * @param {WebAtoms.AtomDisposable} d
     * @param {()=>Promise<any>} f
     * @returns {Promise<any>}
     * @memberof Atom
     */
    static usingAsync(d:WebAtoms.AtomDisposable, f:()=>Promise<any>): Promise<any>;

    /**
     * Sets up watch and returns disposable to destroy watch
     * @static
     * @param {*} item
     * @param {string} property
     * @param {()=>void} f
     * @returns {WebAtoms.AtomDisposable}
     * @memberof Atom
     */
    static watch(item:any, property:string, f:()=>void):WebAtoms.AtomDisposable;

    /**
     * await for delay for given number of milliseconds
     * @static
     * @param {number} n
     * @param {WebAtoms.CancelToken} [ct]
     * @returns {Promise<any>}
     * @memberof Atom
     */
    static delay(n:number, ct?:WebAtoms.CancelToken): Promise<any>;
}

// tslint:disable-next-line:no-string-literal
var AtomBinder:any = window["AtomBinder"];

if(location) {
    Atom.designMode = /file/i.test(location.protocol);
}

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
function bindableProperty(target: any, key: string):void {

        // property value
        var _val:any = this[key];

        var keyName:string = "_" + key;

        this[keyName] = _val;
        // debugger

        // property getter
        var getter:()=>any = function ():any {
            // console.log(`Get: ${key} => ${_val}`);
            return this[keyName];
        };

        // property setter
        var setter:(v:any) => void = function (newVal:any):void {
            // console.log(`Set: ${key} => ${newVal}`);
            // debugger;
            var oldValue:any = this[keyName];
            // tslint:disable-next-line:triple-equals
            if(oldValue == newVal) {
                return;
            }
            this[keyName] = newVal;
            Atom.refresh(this, key);

            if(this.onPropertyChanged) {
                this.onPropertyChanged(key);
            }
        };

        // delete property
        if (delete this[key]) {

            // create new property with getter and setter
            Object.defineProperty(target, key, {
                get: getter,
                set: setter,
                enumerable: true,
                configurable: true
            });
        }
    }

namespace WebAtoms {

    /**
     *
     *
     * @export
     * @class CancelToken
     */
    export class CancelToken {

        listeners:Array<()=>void> = [];

        private _cancelled:boolean;
        get cancelled():boolean {
            return this._cancelled;
        }

        cancel():void {
            this._cancelled = true;
            for(var fx of this.listeners) {
                fx();
            }
        }

        reset():void {
            this._cancelled = false;
            this.listeners.length = 0;
        }

        registerForCancel(f:()=>void):void {
            if(this._cancelled) {
                f();
                this.cancel();
                return;
            }
            this.listeners.push(f);
        }

    }

    export class AtomModel {
        public refresh(name: string): void {
            Atom.refresh(this, name);
        }
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
    export class AtomCommand<T> extends AtomModel {

        public readonly isMVVMAtomCommand: boolean = true;


        private _enabled: boolean = true;
        /**
         *
         *
         * @type {boolean}
         * @memberof AtomCommand
         */
        get enabled(): boolean {
            return this._enabled;
        }
        set enabled(v: boolean) {
            this._enabled = v;
            this.refresh("enabled");
        }

        private _busy: boolean = false;
        /**
         *
         *
         * @type {boolean}
         * @memberof AtomCommand
         */
        get busy(): boolean {
            return this._busy;
        }
        set busy(v:boolean) {
            this._busy = v;
            this.refresh("busy");
        }


        private action: (p: T) => any;

        public execute: (p:T) => any;

        private executeAction(p:T): any {

            if(this._busy) {
                return;
            }
            this.busy = true;
            var result:any = this.action(p);

            if (result) {
                if(result.catch) {
                    result.catch((error) => {
                        this.busy = false;
                        if(error !== "cancelled") {
                            console.error(error);
                            Atom.showError(error);
                        }
                    });
                    return;
                }

                if(result.then) {
                    result.then(()=> {
                        this.busy = false;
                    });
                    return;
                }

            }
            this.busy = false;
        }

        constructor(
            action: (p: T) => any) {
            super();
            this.action = action;

            this.execute = (p:T) => {
                if (this.enabled) {
                    this.executeAction(p);
                }
            };


        }

    }

}