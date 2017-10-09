namespace WebAtoms {

    /**
     *
     *
     * @export
     * @class WindowService
     */
    @WebAtoms.DIGlobal
    export class WindowService {

        /**
         * Resolves current Window Service, you can use this method
         * to resolve service using DI, internally it calls
         * DI.resolve(WindowService).
         *
         * @readonly
         * @static
         * @type {WindowService}
         * @memberof WindowService
         */
        static get instance(): WindowService{
            return WebAtoms.DI.resolve(WindowService);
        }

        private lastWindowID:number = 1;

        /**
         * Display an alert, and method will continue after alert is closed.
         *
         * @param {string} msg
         * @param {string} [title]
         * @returns {Promise<any>}
         * @memberof WindowService
         */
        alert(msg:string,title?:string):Promise<any> {
            return this.showAlert(msg,title || "Message",false);
        }

        /**
         * Display a confirm window with promise that will resolve when yes or no
         * is clicked.
         *
         * @param {string} msg
         * @param {string} [title]
         * @returns {Promise<boolean>}
         * @memberof WindowService
         */
        confirm(msg:string,title?:string):Promise<boolean> {
            return this.showAlert(msg,title || "Confirm",true);
        }

        private showAlert(msg:string ,title:string,confirm:boolean):Promise<boolean> {
            return new Promise((resolve,reject)=> {

                // tslint:disable-next-line:no-string-literal
                var AtomUI:any = window["AtomUI"];

                // tslint:disable-next-line:no-string-literal
                var AtomWindow:any = window["WebAtoms"]["AtomWindow"];

                var d:any = { Message: msg, ConfirmValue: false, Confirm: confirm };

                    var e:any = document.createElement("DIV");
                    document.body.appendChild(e);
                    var w:any = AtomUI.createControl(e, AtomWindow, d);

                    w.set_windowWidth(380);
                    w.set_windowHeight(120);
                    w.set_windowTemplate(w.getTemplate("alertTemplate"));
                    w.set_title(title);

                    w.set_next(function ():void {

                        w.dispose();
                        // $(e).remove();
                        e.remove();

                        if (d.ConfirmValue) {
                            resolve(true);
                        }else {
                            resolve(false);
                        }
                    });

                    w.set_cancelNext(()=> {
                        w.dispose();
                        // $(e).remove();
                        e.remove();

                        resolve(false);
                    });

                    w.refresh();

            });
        }


        /**
         * This method will open a new window identified by name of the window or class of window.
         * Supplied view model has to be derived from AtomWindowViewModel.
         *
         * By default this window has a localScope, so it does not corrupt scope.
         *
         * @example
         *
         *     var result = await windowService.openWindow<Task>(NewTaskWindow, new NewTaskWindowViewModel() );
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
         * @template T
         * @param {(string | {new(e)})} windowType
         * @param {AtomWindowViewModel} [viewModel]
         * @returns {Promise<T>}
         * @memberof WindowService
         */
        async openWindow<T>(windowType: string | {new(e:any)}, viewModel?: AtomWindowViewModel):Promise<T> {

            return new  Promise<T>((resolve,reject)=> {

                var windowDiv:any = document.createElement("div");

                windowDiv.id = `atom_window_${this.lastWindowID++}`;


                // tslint:disable-next-line:no-string-literal
                var atomApplication:any = window["atomApplication"];
                // tslint:disable-next-line:no-string-literal
                var AtomUI:any = window["AtomUI"];

                atomApplication._element.appendChild(windowDiv);

                if(windowType instanceof String) {
                    windowType = window[windowType] as {new (e:any)};
                }

                var windowCtrl:any = AtomUI.createControl(windowDiv,windowType);

                var closeSubscription:AtomDisposable = AtomDevice.instance.subscribe(`atom-window-close:${windowDiv.id}`,
                    (g,i)=> {
                        if(i!==undefined) {
                            Atom.set(windowCtrl,"value",i);
                        }
                        windowCtrl.closeCommand();
                    });

                var cancelSubscription:AtomDisposable = AtomDevice.instance.subscribe(`atom-window-cancel:${windowDiv.id}`,
                    (g,i)=> {
                        windowCtrl.cancelCommand();
                    });

                windowDiv.setAttribute("atom-local-scope","true");

                windowCtrl.init();

                // tslint:disable-next-line:no-string-literal
                var dispatcher:any = WebAtoms["dispatcher"];

                if(viewModel !== undefined) {
                    Atom.set(windowCtrl,"viewModel",viewModel);
                    viewModel.windowName = windowDiv.id;
                    viewModel.channelPrefix = windowDiv.id;
                }

                windowCtrl.set_next(()=> {
                    cancelSubscription.dispose();
                    closeSubscription.dispose();
                    try {
                        resolve(windowCtrl.get_value());
                    }catch(e) {
                        console.error(e);
                    }
                    dispatcher.callLater(()=> {
                        windowCtrl.dispose();
                        windowDiv.remove();
                    });
                });

                windowCtrl.set_cancelNext(()=> {
                    cancelSubscription.dispose();
                    closeSubscription.dispose();
                    try {
                        reject("cancelled");
                    }catch(e) {
                        console.error(e);
                    }
                    dispatcher.callLater(()=> {
                        windowCtrl.dispose();
                        windowDiv.remove();
                    });
                });


                dispatcher.callLater(()=> {
                    var scope:any = windowCtrl.get_scope();
                    var vm:any = windowCtrl.get_viewModel();
                    if(vm && !vm.windowName) {
                        vm.windowName = windowDiv.id;
                    }
                    windowCtrl.openWindow(scope,null);
                });




            });
        }

    }

}

// tslint:disable-next-line:typedef
var WindowService = WebAtoms.WindowService;