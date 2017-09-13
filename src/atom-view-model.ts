/// <reference path="atom-device.ts"/>
/// <reference path="atom-command.ts"/>

namespace WebAtoms{
    export class AtomViewModel extends AtomModel {
        
        private disposables: Array<AtomDisposable>;

        constructor() {
            super();

            AtomDevice.instance.runAsync(() => this.privateInit());

        }

        protected createErrors<T extends AtomErrors>(f:new (a:any)=>T):T{
            var ae = new f(this);
            this.registerDisposable(ae);
            return ae;
        }

        private async privateInit(){
            await Atom.delay(1);
            this.setupWatchers();
            await this.init();
        }

        private setupWatchers(){
            //debugger;
            var vm = this.constructor.prototype as any;
            if(!vm._watchMethods)
                return;

            var wm = vm._watchMethods;

            for(var k in wm){
                if(!vm.hasOwnProperty(k))
                    continue;
                var params = wm[k];

                var pl = params.args;
                var error = params.error;
                var func = params.func as (...args:any[])=>boolean;

                var op = new WebAtoms.AtomWatcher(this, pl, (...x:any[]) => {
                    this[k] = func.apply(this,x) ? error : "";
                });

                this.registerDisposable(op);
            }
        }

        protected watch(item:any, property:string, f:()=>void): AtomDisposable{
            var d = Atom.watch(item,property,f);
            this.registerDisposable(d);
            return new DisposableAction(()=>{
                this.disposables = this.disposables.filter( f => f != d );
            });
        }

        protected registerDisposable(d:AtomDisposable){
            this.disposables = this.disposables || [];
            this.disposables.push(d);
        }

        protected onPropertyChanged(name:string){
            
        }

        protected onMessage<T>(msg: string, a: (data: T) => void) {

            var action: AtomAction = (m, d) => {
                a(d as T);
            };
            var sub = AtomDevice.instance.subscribe(msg, action);
            this.registerDisposable(sub);
        }

        public broadcast(msg: string, data: any) {
            AtomDevice.instance.broadcast(msg, data);
        }

        public async init(): Promise<any> {
        }

        public dispose() {
            if(this.disposables){
                for(let d of this.disposables){
                    d.dispose();
                }
            }
        }

    }


    
    export class AtomWindowViewModel extends AtomViewModel {

        windowName: string;
        
        close(result?:any):void{
            this.broadcast(`atom-window-close:${this.windowName}`,result);
        }

        cancel():void{
            this.broadcast(`atom-window-cancel:${this.windowName}`,null);
        }

    }

}