/**
 * Easy and Simple Dependency Injection
 */


 namespace WebAtoms{

    class DIFactory{

        factory: () => any;

        key: any;

        transient: boolean;

        constructor(
            key: any, 
            factory:()=>any,
            transient: boolean)
        {
            this.transient = transient;
            this.factory = factory;
            this.key = key;
        }

        instance: any;

        resolve(){
            if(this.transient){
                return this.factory();
            }
            return this.instance || (this.instance = this.factory());
        }

        stack:Array<{factory:()=>any, transient:boolean, instance:any}>;

        push(factory:()=>any, transient:boolean){
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

        pop(){
            if(!(this.stack && this.stack.length)){
                throw new Error("Stack in DIFactory is empty");
            }
            var obj = this.stack.pop();
            this.factory = obj.factory;
            this.transient = obj.transient;
            this.instance = obj.instance;
        }

    }

    export class DI{

        private static factory:any = {};

        static register<T>(
            key: new () => T, 
            factory: () => T,
            transient: boolean = false ){

            var k = key as any;

            var existing = DI.factory[k];
            if(existing){
                throw new Error(`Factory for ${key.name} is already registered`);
            }
            DI.factory[k] = new DIFactory(key,factory,transient);
        }

        static resolve<T>(c: new () => T ):T{

            var f:DIFactory = DI.factory[c as any];
            if(!f){
                throw new Error("No factory registered for " + c);
            }
            return f.resolve();
        }

        
        static push(key:any, instance:any){
            var f = DI.factory[key] as DIFactory;
            if(!f){
                DI.register(key, () => instance);
            }else{
                f.push(()=> instance, true);
            }
        }

        static pop(key:any){
            var f = DI.factory[key] as DIFactory;
            if(f){
                f.pop();
            }
        }
    }

    export function DIGlobal (c: new () => any){
        DI.register(c,()=> new c());
        return c;
    };
    
    export function DIAlwaysNew(c: new () => any){
        DI.register(c,()=> new c(), true);
        return c;
    };
        


}

var DIGlobal = WebAtoms.DIGlobal;
var DIAlwaysNew = WebAtoms.DIAlwaysNew;

