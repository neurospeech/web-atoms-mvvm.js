namespace WebAtoms{

    var Atom = window["Atom"];
    var AtomBinder = window["AtomBinder"];
    var AtomPromise = window["AtomPromise"];

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

    /**
     * 
     * 
     * @export
     * @interface AtomDisposable
     */
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
    
        /**
         * Device (usually browser), instance of which supports
         * singleton instance to provide broadcast/messaging
         * 
         * @export
         * @class AtomDevice
         */
        export class AtomDevice {
    
            /**
             * 
             * 
             * @static
             * @type {AtomDevice}
             * @memberof AtomDevice
             */
            static instance: AtomDevice = new AtomDevice();
    
            constructor() {
                this.bag = {};
            }
    
            /**
             * This method will run any asynchronous method
             * and it will display an error if it will fail 
             * asynchronously
             * 
             * @template T 
             * @param {() => Promise<T>} tf 
             * @memberof AtomDevice
             */
            public runAsync<T>(tf: () => Promise<T>) {

                var task = tf();
                task.catch(error=>{
                    console.error(error);
                    Atom.showError(error);
                });
                task.then(()=>{});
            }
    
            private bag: any;
    
            /**
             * Broadcast given data to channel, only within the current window.
             * 
             * @param {string} channel 
             * @param {*} data 
             * @returns 
             * @memberof AtomDevice
             */
            public broadcast(channel: string, data: any) {
                var ary = this.bag[channel] as AtomHandler;
                if (!ary)
                    return;
                for (let entry of ary.list) {
                    entry.call(this, channel, data);
                }
            }
    
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
            public subscribe(channel: string, action: AtomAction): AtomDisposable {
                var ary = this.bag[channel] as AtomHandler;
                if (!ary) {
                    ary = new AtomHandler(channel);
                    this.bag[channel] = ary;
                }
                ary.list.push(action);
                return new DisposableAction(()=>{
                    ary.list = ary.list.filter(a=> a !== action);
                    if(!ary.list.length){
                        this.bag[channel] = null;
                    }
                });
            }
        }
}