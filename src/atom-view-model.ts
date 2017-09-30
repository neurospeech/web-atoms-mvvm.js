/// <reference path="atom-device.ts"/>
/// <reference path="atom-command.ts"/>


namespace WebAtoms {
    /**
     *
     *
     * @export
     * @class AtomViewModel
     * @extends {AtomModel}
     */
    export class AtomViewModel extends AtomModel {

        private disposables: Array<AtomDisposable>;

        private _isReady:boolean = false;

        public get isReady():boolean {
            return this._isReady;
        }

        constructor() {
            super();

            AtomDevice.instance.runAsync(() => this.privateInit());

        }

        private async privateInit():Promise<any> {
            await Atom.postAsync(async () => {
                this.registerWatchers();
                await Atom.postAsync(async ()=> {
                    await this.init();
                    this.onReady();
                    this._isReady = true;
                });
            });
        }

        // tslint:disable-next-line:no-empty
        protected onReady():void {}

        private registerWatchers():void {
            try {
                var v:any = this.constructor.prototype;
                if(v) {
                    if(v._$_autoWatchers) {
                        var aw:any = v._$_autoWatchers;
                        for(var key in aw) {
                            if(!aw.hasOwnProperty(key)) {
                                continue;
                            }
                            var vf:any = aw[key];
                            if(vf.validate) {
                                this.addValidation(vf.method);
                            }else {
                                this.watch(vf.method);
                            }
                        }
                    }

                    if(v._$_receivers) {
                        var ar:any = v._$_receivers;
                        for(var k in ar) {
                            if(!ar.hasOwnProperty(k)) {
                                continue;
                            }
                            var rf: Function = this[k] as Function;
                            var messages:string[] = ar[k];
                            for(var message of messages) {
                                var d:AtomDisposable = AtomDevice.instance.subscribe(message, (msg,data) => {
                                    rf.call(this, msg, data);
                                });
                                this.registerDisposable(d);
                            }
                        }
                    }
                }
            }catch(e) {
                console.error(`View Model watcher registration failed`);
                console.error(e);
            }
        }

        private validations:AtomWatcher<AtomViewModel>[] = [];

        /**
         * Internal method, do not use, instead use errors.hasErrors()
         *
         * @memberof AtomViewModel
         */
        validate():void {
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
        protected addValidation(...fts:(() => any)[]): AtomDisposable {

            var ds: Array<AtomDisposable> = [];

            for(var ft of fts){
                var d:AtomWatcher<any> = new AtomWatcher<any>(this,ft, true);
                this.validations.push(d);
                this.registerDisposable(d);
                ds.push(d);
            }
            return new DisposableAction(()=> {
                this.disposables = this.disposables.filter( f => !ds.find(fd => f === fd) );
                for(var dispsoable of ds){
                    dispsoable.dispose();
                }
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
        protected watch(...fts:(() => any)[]): AtomDisposable {

            var dfd:AtomDisposable[] = [];
            for(var ft of fts){
                var d:AtomWatcher<any> = new AtomWatcher<any>(this,ft);
                // debugger;
                this.registerDisposable(d);
                dfd.push(d);
            }
            return new DisposableAction(()=> {
                this.disposables = this.disposables.filter( f => ! dfd.find(fd => f === fd) );
                for(var disposable of dfd){
                    disposable.dispose();
                }
            });
        }


        /**
         * Register a disposable to be disposed when view model will be disposed.
         *
         * @protected
         * @param {AtomDisposable} d
         * @memberof AtomViewModel
         */
        protected registerDisposable(d:AtomDisposable):void {
            this.disposables = this.disposables || [];
            this.disposables.push(d);
        }

        // tslint:disable-next-line:no-empty
        protected onPropertyChanged(name:string): void {}

        /**
         * Register listener for given message.
         *
         * @protected
         * @template T
         * @param {string} msg
         * @param {(data: T) => void} a
         * @memberof AtomViewModel
         */
        protected onMessage<T>(msg: string, a: (data: T) => void):void {

            console.warn("Do not use onMessage, instead use @receive decorator...");

            var action: AtomAction = (m, d) => {
                a(d as T);
            };
            var sub:AtomDisposable = AtomDevice.instance.subscribe(msg, action);
            this.registerDisposable(sub);
        }

        /**
         * Broadcast given data to channel (msg)
         *
         * @param {string} msg
         * @param {*} data
         * @memberof AtomViewModel
         */
        public broadcast(msg: string, data: any):void {
            AtomDevice.instance.broadcast(msg, data);
        }

        /**
         * Put your asynchronous initializations here
         *
         * @returns {Promise<any>}
         * @memberof AtomViewModel
         */
        // tslint:disable-next-line:no-empty
        public async init(): Promise<any> {
        }

        /**
         * dispose method will becalled when attached view will be disposed or
         * when a new view model will be assigned to view, old view model will be disposed.
         *
         * @memberof AtomViewModel
         */
        public dispose():void {
            if(this.disposables) {
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
     * @example
     *
     *      var windowService = WebAtoms.DI.resolve(WindowService);
     *      var result = await
     *          windowService.openWindow(
     *              "Namespace.WindowName",
     *              new WindowNameViewModel());
     *
     *
     *
     *      class NewTaskWindowViewModel extends AtomWindowViewModel{
     *
     *          ....
     *          save(){
     *
     *              // close and send result
     *              this.close(task);
     *
     *          }
     *          ....
     *
     *      }
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
        close(result?:any):void {
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
        cancel():void {
            this.broadcast(`atom-window-cancel:${this.windowName}`,null);
        }

    }

}


function watch(target:WebAtoms.AtomViewModel, key: string | symbol, descriptor:any):void {
    var v:any = target as any;
    v._$_autoWatchers = v._$_autoWatchers || {};
    v._$_autoWatchers[key] = {
        method: descriptor.value
    };
}



function validate(target:WebAtoms.AtomViewModel, key: string | symbol, descriptor:any):void {
    var v:any = target as any;
    v._$_autoWatchers = v._$_autoWatchers || {};
    v._$_autoWatchers[key] = descriptor.value;
    v._$_autoWatchers[key] = {
        method: descriptor.value ,
        validate: true
    };
}