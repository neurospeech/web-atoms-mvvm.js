/**
 * Easy and Simple Dependency Injection
 */


 namespace WebAtoms {

    class DIFactory {

        factory: () => any;

        key: any;

        transient: boolean;

        constructor(
            key: any,
            factory:()=>any,
            transient: boolean) {
            this.transient = transient;
            this.factory = factory;
            this.key = key;
        }

        instance: any;

        resolve():any {
            if(this.transient) {
                return this.factory();
            }
            return this.instance || (this.instance = this.factory());
        }

        stack:Array<{factory:()=>any, transient:boolean, instance:any}>;

        push(factory:()=>any, transient:boolean):void {
            this.stack = this.stack || [];
            this.stack.push({
                factory: this.factory,
                instance: this.instance,
                transient: this.transient
            });
            this.transient = transient;
            this.instance = undefined;
            this.factory = factory;
        }

        pop():void {
            if(!(this.stack && this.stack.length)) {
                throw new Error("Stack in DIFactory is empty");
            }
            var obj:any = this.stack.pop();
            this.factory = obj.factory;
            this.transient = obj.transient;
            this.instance = obj.instance;
        }

    }

    /**
     * @export
     * @class DI
     */
    export class DI {

        private static factory:any = {};

        /**
         * @static
         * @template T
         * @param {new () => T} key
         * @param {() => T} factory
         * @param {boolean} [transient=false] - If true, always new instance will be created
         * @memberof DI
         */
        static register<T>(
            key: new () => T,
            factory: () => T,
            transient: boolean = false ):void {

            var k:any = key as any;

            var existing:any = DI.factory[k];
            if(existing) {
                throw new Error(`Factory for ${key.name} is already registered`);
            }
            DI.factory[k] = new DIFactory(key,factory,transient);
        }

        /**
         * @static
         * @template T
         * @param {new () => T} c
         * @returns {T}
         * @memberof DI
         */
        static resolve<T>(c: new () => T ):T {

            var f:DIFactory = DI.factory[c as any];
            if(!f) {
                throw new Error("No factory registered for " + c);
            }
            return f.resolve() as T;
        }


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
        static push(key:any, instance:any):void {
            var f:DIFactory = DI.factory[key] as DIFactory;
            if(!f) {
                DI.register(key, () => instance);
            }else {
                f.push(()=> instance, true);
            }
        }

        /**
         * @static
         * @param {*} key
         * @memberof DI
         */
        static pop(key:any):void {
            var f:any = DI.factory[key] as DIFactory;
            if(f) {
                f.pop();
            }
        }
    }

    /**
     * This decorator will register given class as singleton instance on DI.
     * @example
     *      @DIGlobal
     *      class BackendService{
     *      }
     * @export
     * @param {new () => any} c
     * @returns
     */
    export function DIGlobal(c: any): any {
        DI.register(c,()=> new c());
        return c;
    }

    /**
     * This decorator will register given class as transient instance on DI.
     * @example
     *      @DIAlwaysNew
     *      class StringHelper{
     *      }
     * @export
     * @param {new () => any} c
     * @returns
     */
    export function DIAlwaysNew(c: any): any {
        DI.register(c,()=> new c(), true);
        return c;
    }



}

var DIGlobal: any = WebAtoms.DIGlobal;
var DIAlwaysNew: any = WebAtoms.DIAlwaysNew;

