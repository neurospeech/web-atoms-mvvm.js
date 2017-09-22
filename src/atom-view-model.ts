/// <reference path="atom-device.ts"/>
/// <reference path="atom-command.ts"/>


namespace WebAtoms{
    /**
     * 
     * 
     * @export
     * @class AtomViewModel
     * @extends {AtomModel}
     */
    export class AtomViewModel extends AtomModel {
        
        private disposables: Array<AtomDisposable>;

        constructor() {
            super();

            AtomDevice.instance.runAsync(() => this.privateInit());

        }

        private async privateInit(){
            // this is necessary for derived class initialization
            await Atom.delay(1);
            try{
            await this.init();
            }finally{
                this.registerWatchers();
            }
        }

        private registerWatchers(){
            var v = this.constructor.prototype;
            if(v && v._$_autoWatchers){
                var aw = v._$_autoWatchers;
                for(var key in aw){
                    if(!aw.hasOwnProperty(key)) 
                        continue;
                    var vf = aw[key];
                    if(vf.validate){
                        this.addValidation(vf.method);
                    }else{
                        this.watch(vf.method);
                    }
                }
            }
        }

        private validations:AtomWatcher<AtomViewModel>[] = [];

        /**
         * Internal method, do not use, instead use errors.hasErrors()
         * 
         * @memberof AtomViewModel
         */
        validate(){
            for(var v of this.validations){
                v.evaluate(true);
            }
        }

        /**
         * Adds validation expression to be executed when any bindable expression is updated.
         * 
         * `target` must always be set to `this`.
         * 
         *      this.addValidation(() => {
         *          this.errors.nameError = this.data.firstName ? "" : "Name cannot be empty";
         *      });
         * 
         * Only difference here is, validation will not kick in first time, where else watch will 
         * be invoked as soon as it is setup. 
         * 
         * Validation will be invoked when any bindable property in given expression is updated.
         * 
         * Validation can be invoked explicitly only by calling `errors.hasErrors()`.
         * 
         * @protected
         * @template T 
         * @param {() => any} ft 
         * @returns {AtomDisposable} 
         * @memberof AtomViewModel
         */
        protected addValidation(ft:() => any): AtomDisposable{

            var d = new AtomWatcher<any>(this,ft, true);
            this.validations.push(d);
            this.registerDisposable(d);
            return new DisposableAction(()=>{
                this.disposables = this.disposables.filter( f => f != d );
            });
        }

        /**
         * Execute given expression whenever any bindable expression changes
         * in the expression.
         * 
         * For correct generic type resolution, target must always be `this`.
         * 
         *      this.watch(() => {
         *          if(!this.data.fullName){
         *              this.data.fullName = `${this.data.firstName} ${this.data.lastName}`;
         *          }
         *      });
         * 
         * @protected
         * @template T 
         * @param {() => any} ft 
         * @returns {AtomDisposable} 
         * @memberof AtomViewModel
         */
        protected watch(ft:() => any): AtomDisposable{

            var d = new AtomWatcher<any>(this,ft);
            this.registerDisposable(d);
            return new DisposableAction(()=>{
                this.disposables = this.disposables.filter( f => f != d );
            });
        }


        /**
         * Register a disposable to be disposed when view model will be disposed.
         * 
         * @protected
         * @param {AtomDisposable} d 
         * @memberof AtomViewModel
         */
        protected registerDisposable(d:AtomDisposable){
            this.disposables = this.disposables || [];
            this.disposables.push(d);
        }

        protected onPropertyChanged(name:string){
            
        }

        /**
         * Register listener for given message.
         * 
         * @protected
         * @template T 
         * @param {string} msg 
         * @param {(data: T) => void} a 
         * @memberof AtomViewModel
         */
        protected onMessage<T>(msg: string, a: (data: T) => void) {

            var action: AtomAction = (m, d) => {
                a(d as T);
            };
            var sub = AtomDevice.instance.subscribe(msg, action);
            this.registerDisposable(sub);
        }

        /**
         * Broadcast given data to channel (msg)  
         * 
         * @param {string} msg 
         * @param {*} data 
         * @memberof AtomViewModel
         */
        public broadcast(msg: string, data: any) {
            AtomDevice.instance.broadcast(msg, data);
        }

        /**
         * Put your asynchronous initializations here
         * 
         * @returns {Promise<any>} 
         * @memberof AtomViewModel
         */
        public async init(): Promise<any> {
        }

        /**
         * dispose method will becalled when attached view will be disposed or 
         * when a new view model will be assigned to view, old view model will be disposed.
         * 
         * @memberof AtomViewModel
         */
        public dispose() {
            if(this.disposables){
                for(let d of this.disposables){
                    d.dispose();
                }
            }
        }

    }


    
    /**
     * This view model should be used with WindowService to create and open window.     
     * 
     * This view model has `close` and `cancel` methods. `close` method will
     * close the window and will resolve the given result in promise. `cancel` 
     * will reject the given promise.
     * 
     *      var windowService = WebAtoms.DI.resolve(WindowService);
     *      var result = await 
     *          windowService.openWindow(
     *              "Namespace.WindowName",
     *              new WindowNameViewModel());
     * 
     * @export
     * @class AtomWindowViewModel
     * @extends {AtomViewModel}
     */
    export class AtomWindowViewModel extends AtomViewModel {

        /**
         * windowName will be set to generated html tag id, you can use this
         * to mock AtomWindowViewModel in testing.
         * 
         * When window is closed or cancelled, view model only broadcasts
         * `atom-window-close:${this.windowName}`, you can listen for
         * such message.
         * 
         * @type {string}
         * @memberof AtomWindowViewModel
         */
        windowName: string;
        
        /**
         * This will broadcast `atom-window-close:windowName`.
         * WindowService will close the window on receipt of such message and
         * it will resolve the promise with given result.
         * 
         *      this.close(someResult);
         * 
         * @param {*} [result] 
         * @memberof AtomWindowViewModel
         */
        close(result?:any):void{
            this.broadcast(`atom-window-close:${this.windowName}`,result);
        }

        /**
         * This will broadcast `atom-window-cancel:windowName`
         * WindowService will cancel the window on receipt of such message and
         * it will reject the promise with "cancelled" message.
         * 
         *      this.cancel();
         * 
         * @memberof AtomWindowViewModel
         */
        cancel():void{
            this.broadcast(`atom-window-cancel:${this.windowName}`,null);
        }

    }

}


function watch(target:WebAtoms.AtomViewModel, key: string | symbol, descriptor:any){
    var v = target as any;
    v._$_autoWatchers = v._$_autoWatchers || {};
    v._$_autoWatchers[key] = { 
        method: descriptor.value 
    };
}

    

function validate(target:WebAtoms.AtomViewModel, key: string | symbol, descriptor:any){
    var v = target as any;
    v._$_autoWatchers = v._$_autoWatchers || {};
    v._$_autoWatchers[key] = descriptor.value;
    v._$_autoWatchers[key] = { 
        method: descriptor.value ,
        validate: true
    };
}

    