namespace WebAtoms{

    var Atom = window["Atom"];
    var AtomBinder = window["AtomBinder"];
    var AtomPromise = window["AtomPromise"];

        
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
    
            public async runAsync<T>(task: Promise<T>): Promise<any> {
                try {
                    await task;
                } catch (error) {
                    console.error(error);
                    Atom.showError(error);
                }
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
    
            public subscribe(msg: string, action: AtomAction): AtomAction {
                var ary = this.bag[msg] as AtomHandler;
                if (!ary) {
                    ary = new AtomHandler(msg);
                    this.bag[msg] = ary;
                }
                ary.list.push(action);
                return action;
            }
    
            public unsubscribe(msg: string, action: AtomAction) {
                var ary = this.bag[msg] as AtomHandler;
                if (!ary) {
                    return;
                }
    
                ary.list = ary.list.filter((a) => a !== action);
            }
        }
}