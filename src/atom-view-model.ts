/// <reference path="atom-device.ts"/>
/// <reference path="atom-command.ts"/>

namespace WebAtoms{
    export class AtomViewModel extends AtomModel {
        
        private disposables: Array<AtomDisposable>;

        constructor() {
            super();

            AtomDevice.instance.runAsync(this.init());

            this.setupWatchers();
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
                var params = wm[k] as Array<string>;

                var op = new WebAtoms.AtomWatcher(this, params, this[k]);

                this.registerDisposable(op);
            }
        }

        protected watch(item:any, property:string, f:()=>void){
            this.registerDisposable(Atom.watch(item,property,f));
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