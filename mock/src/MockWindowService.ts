namespace WebAtoms {

    export type __windowType = (string | (new () => any));

    export type __windowRegistration = {
        windowType: __windowType,
        action: (vm:AtomViewModel) => any
    };

    export class MockConfirmViewModel extends AtomWindowViewModel {

        message: string;
        title: string;

    }

    /**
     * Mock of WindowService for unit tests
     * @export
     * @class MockWindowService
     * @extends {WebAtoms.WindowService}
     */
    export class MockWindowService extends WebAtoms.WindowService {



        /**
         * DI resolved instance of MockWindowService (WindowService)
         * @readonly
         * @static
         * @type {MockWindowService}
         * @memberof MockWindowService
         */
        static get instance(): MockWindowService{
            var d:WindowService = WebAtoms.DI.resolve(WindowService);
            if(d instanceof MockWindowService) {
                return d as MockWindowService;
            }
            throw new Error("MockWindowService not yet setup");
        }

        /**
         * Registers new MockWindowService
         * @static
         * @memberof MockWindowService
         */
        static register():void {
            WebAtoms.DI.push(WindowService, new MockWindowService());
        }



        /**
         * Internal usage
         * @param {string} msg
         * @param {string} [title]
         * @returns {Promise<any>}
         * @memberof MockWindowService
         */
        alert(msg:string, title?:string):Promise<any> {
            var mvm:MockConfirmViewModel = new MockConfirmViewModel();
            mvm.message = msg;
            mvm.title = title;
            return this.openWindow(`__AlertWindow_${msg}`, mvm );
        }


        /**
         * Internal usage
         * @param {string} msg
         * @param {string} [title]
         * @returns {Promise<boolean>}
         * @memberof MockWindowService
         */
        confirm(msg:string, title?:string):Promise<boolean> {
            var mvm:MockConfirmViewModel = new MockConfirmViewModel();
            mvm.message = msg;
            mvm.title = title;
            return this.openWindow(`__ConfirmWindow_${msg}`, mvm );
        }


        /**
         * Internal usage
         * @template T
         * @param {__windowType} c
         * @param {AtomViewModel} vm
         * @returns {Promise<T>}
         * @memberof MockWindowService
         */
        openWindow<T>(c: __windowType, vm: AtomViewModel ): Promise<T> {
            return new Promise((resolve,reject)=> {
                var w:any = this.windowStack.find(x => x.windowType === c);
                if(!w) {
                    var ex:Error = new Error(`No window registered for ${c}`);
                    reject(ex);
                    return;
                }
                setTimeout(()=> {
                    try {
                        resolve(w.action(vm));
                    }catch(e) {
                        reject(e);
                    }
                },5);
            });
        }

        private windowStack:Array<__windowRegistration> = [];

        /**
         * Call this method before any method that should expect an alert.
         * You can add many alerts, but each expected alert will only be called
         * once.
         * @param {string} msg
         * @returns {AtomDisposable}
         * @memberof MockWindowService
         */
        expectAlert(msg:string):AtomDisposable {
            return this.expectWindow(`__AlertWindow_${msg}`, vm => true);
        }

        /**
         * Call this method before any method that should expect a confirm.
         * You can add many confirms, but each expected confirm will only be called
         * once.
         * @param {string} msg
         * @param {(vm:MockConfirmViewModel) => boolean} action
         * @returns {AtomDisposable}
         * @memberof MockWindowService
         */
        expectConfirm(msg:string, action: (vm:MockConfirmViewModel) => boolean):AtomDisposable {
            return this.expectWindow(`__ConfirmWindow_${msg}`, action);
        }

        /**
         * Call this method before any method that should expect a window of given type.
         * Each window will only be used once and return value in windowAction will be
         * resolved in promise created by openWindow call.
         * @template TViewModel
         * @param {__windowType} windowType
         * @param {(vm:TViewModel) => any} windowAction
         * @param {number} [maxDelay=10000]
         * @returns {AtomDisposable}
         * @memberof MockWindowService
         */
        expectWindow<TViewModel extends AtomViewModel>(
            windowType: __windowType ,
            windowAction: (vm:TViewModel) => any): AtomDisposable {

            var registration:any = { windowType: windowType, action: windowAction };

            registration.action = (vm:TViewModel) => {
                this.removeRegistration(registration);
                return windowAction(vm);
            };

            this.windowStack.push(registration);

            return new DisposableAction(()=> {
                this.removeRegistration(registration);
            });
        }

        removeRegistration(r:__windowRegistration):void {
            this.windowStack = this.windowStack.filter(x => x !== r);
        }

        public assert():void {
            if(!this.windowStack.length) {
                return;
            }

            throw new Error(`Expected windows did not open ${this.windowStack.map(x=>x.windowType).join(",")}`);
        }

    }
}