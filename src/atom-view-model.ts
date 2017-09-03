/// <reference path="atom-device.ts"/>
/// <reference path="atom-command.ts"/>

namespace WebAtoms{
    export class AtomViewModel extends AtomModel {
        
        private subscriptions: Array<AtomMessageAction>;
        private disposables: Array<AtomDisposable>;

        constructor() {
            super();

            AtomDevice.instance.runAsync(this.init());
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
            AtomDevice.instance.subscribe(msg, action);
            this.subscriptions = this.subscriptions || new Array<AtomMessageAction>();
            this.subscriptions.push(new AtomMessageAction(msg, action));
        }

        public broadcast(msg: string, data: any) {
            AtomDevice.instance.broadcast(msg, data);
        }

        public async init(): Promise<any> {
        }

        public dispose() {
            if (this.subscriptions) {
                for (let entry of this.subscriptions) {
                    AtomDevice.instance.unsubscribe(entry.message, entry.action);
                }
            }
            if(this.disposables){
                for(let d of this.disposables){
                    d.dispose();
                }
            }
        }

    }
}