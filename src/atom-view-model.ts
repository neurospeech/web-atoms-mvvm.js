/// <reference path="atom-device.ts"/>
/// <reference path="atom-command.ts"/>


namespace WebAtoms {

    type VMSubscription = {
        channel: string,
        action: AtomAction,
        disposable: AtomDisposable
    };

    /**
     *
     *
     * @export
     * @class AtomViewModel
     * @extends {AtomModel}
     */
    export class AtomViewModel extends AtomModel {

        private disposables: Array<AtomDisposable>;

        private subscriptions: VMSubscription[];

        private _channelPrefix: string = "";
        public get channelPrefix(): string {
            return this._channelPrefix;
        }
        public set channelPrefix(v: string) {
            this._channelPrefix = v;

            var temp: VMSubscription[] = this.subscriptions;
            if(temp) {
                this.subscriptions = [];
                for(var s of temp) {
                    s.disposable.dispose();
                }
                for(var s1 of temp) {
                    this.subscribe(s.channel,s.action);
                }
            }
            Atom.refresh(this,"channelPrefix");
        }

        private _isReady:boolean = false;

        public get isReady():boolean {
            return this._isReady;
        }

        constructor() {
            super();

            AtomDevice.instance.runAsync(() => this.privateInit());

        }

        private async privateInit():Promise<any> {
            try {
                await Atom.postAsync(async () => {
                    this.runDecoratorInits();
                    // this.registerWatchers();
                });
                await Atom.postAsync(async ()=> {
                    await this.init();
                    this.onReady();
                });

                if(this.postInit){
                    for(var i of this.postInit) {
                        i();
                    }
                    this.postInit = null;
                }
            }
            finally {
                this._isReady = true;
            }
        }

        public async waitForReady():Promise<any> {
            while(!this._isReady) {
                await Atom.delay(100);
            }
        }

        // tslint:disable-next-line:no-empty
        protected onReady():void {}

        postInit:Array<Function>;

        private runDecoratorInits():void {
            var v:any = this.constructor.prototype;
            if(!v) {
                return;
            }
            var ris: Function[] = v._$_inits;
            if(ris) {
                for(var ri of ris){
                    ri.call(this, this);
                }
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
                var d:AtomWatcher<any> = new AtomWatcher<any>(this,ft, false, true);
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
                var d:AtomWatcher<any> = new AtomWatcher<any>(this,ft, this._isReady );
                // debugger;
                this.registerDisposable(d);
                dfd.push(d);

                if(!this._isReady){
                    this.postInit = this.postInit || [];
                    this.postInit.push(() => {
                        d.runEvaluate();
                    });
                }
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
        public registerDisposable(d:AtomDisposable):void {
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
            var sub:AtomDisposable = AtomDevice.instance.subscribe( this.channelPrefix + msg, action);
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
            AtomDevice.instance.broadcast(this.channelPrefix + msg, data);
        }

        private subscribe(channel: string, c: (ch:string, data:any) => void): void {
            var sub:AtomDisposable = AtomDevice.instance.subscribe( this.channelPrefix + channel, c);
            this.subscriptions = this.subscriptions || [];
            this.subscriptions.push({
                channel: channel,
                action: c,
                disposable: sub
            });
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
                for(let d of this.disposables) {
                    d.dispose();
                }
            }
            if(this.subscriptions) {
                for(let d of this.subscriptions) {
                    d.disposable.dispose();
                }
                this.subscriptions = null;
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



        // init(): Promise<any> {
        //     if(!Atom.testMode) {
        //         if(this._windowName) {
        //             return;
        //         }
        //     }
        //     return super.init();
        // }

        // windowInit(): Promise<any> {
        //     return super.init();
        // }


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
        public get windowName(): string {
            return this._windowName;
        }
        public set windowName(v:string) {
            this._windowName = v;
            Atom.refresh(this, "windowName");
        }
        _windowName: string;

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
            // tslint:disable-next-line:no-string-literal
            this["_channelPrefix"] = "";
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
            // tslint:disable-next-line:no-string-literal
            this["_channelPrefix"] = "";
            this.broadcast(`atom-window-cancel:${this.windowName}`,null);
        }

    }

}




type viewModelInit = (vm:WebAtoms.AtomViewModel) => void;

function registerInit(target:WebAtoms.AtomViewModel, fx: viewModelInit ):void {
    var t:any = target as any;
    var inits:viewModelInit[] = t._$_inits = t._$_inits || [];
    inits.push(fx);
}

/**
 * Receive messages for given channel
 * @param {(string | RegExp)} channel
 * @returns {Function}
 */
function receive(...channel:string[]):Function {
    return function(target:WebAtoms.AtomViewModel, key: string | symbol):void {
        registerInit(target, vm => {
            var fx:Function = (vm as any)[key];
            var a: WebAtoms.AtomAction = (ch:string, d: any): void => {
                fx.call(vm, ch, d );
            };
            // tslint:disable-next-line:no-string-literal
            var s:Function = vm["subscribe"];
            for(var c of channel){
                s.call(vm,c, a);
            }
        });
    };
}

function bindableReceive(...channel: string[]): Function {
    return function(target:WebAtoms.AtomViewModel, key:string):void {
        var bp:any = bindableProperty(target, key);

        registerInit(target, vm => {
            var fx:WebAtoms.AtomAction = (cx:string, m:any) => {
                vm[key] = m;
            };
            // tslint:disable-next-line:no-string-literal
            var s:Function = vm["subscribe"];
            for(var c of channel) {
                s.call(vm, c, fx);
            }
        });

        return bp;
    };
}


function bindableBroadcast(...channel: string[]): Function {
    return function(target:WebAtoms.AtomViewModel, key:string):void {
        var bp:any = bindableProperty(target, key);

        registerInit(target, vm => {
            var fx:(t:any) => any = (t:any):any => {
                var v:any = vm[key];
                for(var c of channel) {
                    vm.broadcast(c, v);
                }
            };
            var d:WebAtoms.AtomWatcher<any> = new WebAtoms.AtomWatcher<any>(vm,[ key], false );
            d.func = fx;

            // tslint:disable-next-line:no-string-literal
            var f: Function = d["evaluatePath"];

            // tslint:disable-next-line:no-string-literal
            for(var p of d.path) {
                f.call(d, vm, p);
            }

            vm.registerDisposable(d);
        });

        return bp;
    };
}


function watch(target:WebAtoms.AtomViewModel, key: string | symbol, descriptor:any):void {
    registerInit(target, vm => {
        // tslint:disable-next-line:no-string-literal
        var vfx: Function = vm["watch"];
        vfx.call(vm,vm[key]);
    });
}



function validate(target:WebAtoms.AtomViewModel, key: string | symbol, descriptor:any):void {
    registerInit(target, vm => {
        // tslint:disable-next-line:no-string-literal
        var vfx: Function = vm["addValidation"];
        // tslint:disable-next-line:no-string-literal
        vfx.call(vm,vm["key"]);
    });

}