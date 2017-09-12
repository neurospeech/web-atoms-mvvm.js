/**
 * Easy and Simple Dependency Injection
 */


 namespace WebAtoms{

    class DIFactory{

        factory: () => any;

        key: any;

        constructor(key: any, factory:()=>any){
            this.factory = factory;
            this.key = key;
        }

    }

    export class DI{

        private static factory:Array<DIFactory> = [];

        static instances: any = {};

        static register(key:any, factory: any){

            for(var fx of DI.factory){
                if(fx.key === key)
                    return;
            }

            DI.factory.push(new DIFactory(key,factory));
        }        

        static resolve<T>(c: new () => T ):T{

            var f = DI.factory.find( v => v.key === c );
            if(!f){
                throw new Error("No factory registered for " + c);
            }
            return f.factory();
        }

        
        static put(key:any, instance:any){
            DI.instances[key] = instance;
        }
    }

    export function DIGlobal(){
        return function(c:any){

            debugger;

           DI.register(c,()=>{
               var dr = DI.instances = DI.instances || {};
               var r = dr[c as any];
               if(r)
                    return r;
               var cx = c as ({new ()});
               var r = new cx();
               dr[c as any] = r;
               return r;
           });
           return c;
        };
    }
        
    export function DIAlwaysNew(){
        return function(c:any){
           DI.register(c,()=>{
               
               var r = new (c as {new ()} )();
               return r;
           });
           return c;
        };
    }


}

var DIGlobal = WebAtoms.DIGlobal();
var DIAlwaysNew = WebAtoms.DIAlwaysNew();

