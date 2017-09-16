namespace WebAtoms
{

    export class MockWindow<T>{

        windowName:string;

        static id:number = 1;
        

        /**
         * Creates an instance of MockWindow.
         * Window will cancel in given delay milliseconds and it will
         * reject the corresponding promise
         * @param {number} [delay=10000] 
         * @memberof MockWindow
         */
        constructor(delay: number = 10000){

            this.windowName = `window_${MockWindow.id++}`;

            // subscribe for all messages...

            this.register();
        }

        close(){

        }

        async register(): Promise<any> {
            
        }


    }

    export type __windowType = (string | (new () => any));

    export type __windowRegistration = { 
        windowType: __windowType, 
        action: (vm:AtomViewModel) => any 
    };

    export class MockConfirmViewModel extends AtomWindowViewModel{

        message: string;
        title: string;

    }

    /**
     * 
     * 
     * @export
     * @class MockWindowService
     * @extends {WebAtoms.WindowService}
     */
    export class MockWindowService extends WebAtoms.WindowService{


        
        static get instance(): MockWindowService{
            var d = WebAtoms.DI.resolve(WindowService);
            if(d instanceof MockWindowService)
                return d as MockWindowService;
            throw new Error("MockWindowService not yet setup");
        }

        static register(){
            WebAtoms.DI.push(WindowService, new MockWindowService());
        }

        

        alert(msg:string, title?:string):Promise<any>{
            var mvm = new MockConfirmViewModel();
            mvm.message = msg;
            mvm.title = title;
            return this.openWindow(`__AlertWindow_${msg}`, mvm );
        }


        confirm(msg:string, title?:string):Promise<boolean>{
            var mvm = new MockConfirmViewModel();
            mvm.message = msg;
            mvm.title = title;
            return this.openWindow(`__ConfirmWindow_${msg}`, mvm );
        }

        openWindow<T>(c: __windowType, vm: AtomViewModel ): Promise<T>
        {
            return new Promise((resolve,reject)=>{
                var w = this.windowStack.find(x => x.windowType == c);
                if(!w){
                    var ex = new Error(`No window registered for ${c}`);
                    reject(ex);
                    return;
                }
                setTimeout(()=>{
                    try{
                        resolve(w.action(vm));
                    }catch(e){
                        reject(e);
                    }
                },5);
            });
        }

        private windowStack:Array<__windowRegistration> = [];

        /**
         * 
         * 
         * @param {string} msg 
         * @returns {AtomDisposable} 
         * @memberof MockWindowService
         */
        expectAlert(msg:string):AtomDisposable{
            return this.expectWindow(`__AlertWindow_${msg}`, vm => true);
        }

        /**
         * 
         * 
         * @param {string} msg 
         * @param {(vm:MockConfirmViewModel) => boolean} action 
         * @returns {AtomDisposable} 
         * @memberof MockWindowService
         */
        expectConfirm(msg:string, action: (vm:MockConfirmViewModel) => boolean):AtomDisposable{
            return this.expectWindow(`__ConfirmWindow_${msg}`, action);
        }

        /**
         * 
         * 
         * @template TViewModel 
         * @param {__windowType} windowType 
         * @param {(vm:TViewModel) => any} windowAction 
         * @param {number} [maxDelay=10000] 
         * @returns {AtomDisposable} 
         * @memberof MockWindowService
         */
        expectWindow<TViewModel extends AtomViewModel>(
            windowType: __windowType ,
            windowAction: (vm:TViewModel) => any): AtomDisposable{

            var registration = { windowType: windowType, action: windowAction };

            registration.action = (vm:TViewModel) => {
                this.removeRegistration(registration);
                return windowAction(vm);
            };

            this.windowStack.push(registration);

            return new DisposableAction(()=>{
                this.removeRegistration(registration);
            });
        }

        removeRegistration(r:__windowRegistration){
            this.windowStack = this.windowStack.filter(x => x !== r);
        }

        public assert(){
            if(!this.windowStack.length)
                return;

            throw new Error(`Expected windows did not open ${this.windowStack.map(x=>x.windowType).join(",")}`);
        }

    }
}