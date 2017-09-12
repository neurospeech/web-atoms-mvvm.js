namespace WebAtoms{

    var Atom = window["Atom"];
    var AtomBinder = window["AtomBinder"];
    var AtomPromise = window["AtomPromise"];

    export class DisposableAction implements AtomDisposable{

        f:()=>void;

        constructor(f:()=>void){
            this.f = f;
        }

        dispose(){
            this.f();
        }

    }

    var AtomUI = window["AtomUI"];

    var oldCreateControl = AtomUI.createControl;
    AtomUI.createControl = function(element,type,data,newScope){
        
        if(type){
            if(type.constructor === String || (typeof type) === 'string'){
                var t = WebAtoms[type] || Atom.get(window,type);
                if(t){
                    type = t;
                }
            }
        }

        return oldCreateControl.call(Atom,element,type,data,newScope);
    };

    Atom.using = function(d:AtomDisposable, f:()=>{}){
        try{
            f();
        }finally{
            d.dispose();
        }
    };

    Atom.usingAsync = async function(d:AtomDisposable, f:()=>Promise<any>){
        try{
            await f();
        }finally{
            d.dispose();
        }
    };

    // watch for changes...
    Atom.watch = function(item:any, property:string, f: ()=>void):AtomDisposable{
        AtomBinder.add_WatchHandler(item,property,f);
        return new DisposableAction(()=>{
            AtomBinder.remove_WatchHandler(item,property,f);
        });
    };

    Atom.delay = function(n:number, ct?:CancelToken):Promise<any>{
        return new Promise((resolve,reject)=>{
            var t = setTimeout(function() {
                resolve();
            }, (n));

            if(ct){
                ct.registerForCancel(()=>{
                    clearTimeout(t);
                    reject("cancelled");
                });
            }

        });
    };

    export interface AtomDisposable{

        dispose();


    }

        
    export type AtomAction = (msg: string, data: any) => void;
    
        class AtomHandler {
    
            constructor(message: string) {
                this.message = message;
                this.list = new Array<AtomAction>();
            }
    
            public message: string;
            public list: Array<AtomAction>;
        }
    
        export class AtomMessageAction {
            public message: string;
            public action: AtomAction;
    
            constructor(msg: string, a: AtomAction) {
                this.message = msg;
                this.action = a;
            }
        }
    
        export class AtomDevice {
    
            static instance: AtomDevice = new AtomDevice();
    
            constructor() {
                this.bag = {};
            }
    
            public runAsync<T>(tf: () => Promise<T>) {

                var task = tf();
                task.catch(error=>{
                    console.error(error);
                    Atom.showError(error);
                });
                task.then(()=>{});
            }
    
            private bag: any;
    
            public broadcast(msg: string, data: any) {
                var ary = this.bag[msg] as AtomHandler;
                if (!ary)
                    return;
                for (let entry of ary.list) {
                    entry.call(this, msg, data);
                }
            }
    
            public subscribe(msg: string, action: AtomAction): AtomDisposable {
                var ary = this.bag[msg] as AtomHandler;
                if (!ary) {
                    ary = new AtomHandler(msg);
                    this.bag[msg] = ary;
                }
                ary.list.push(action);
                return new DisposableAction(()=>{
                    ary.list = ary.list.filter(a=> a !== action);
                    if(!ary.list.length){
                        this.bag[msg] = null;
                    }
                });
            }
        }
}