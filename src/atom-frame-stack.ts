namespace WebAtoms {

    export class AtomPageView extends AtomControl {
        @bindableProperty
        url: string;

        private disposables: AtomDisposable[] = [];

        stack:AtomControl[] = [];

        @bindableProperty
        keepStack: boolean = true;

        @bindableProperty
        current:AtomControl = null;

        currentDisposable:AtomDisposable = null;

        backCommand: Function;

        constructor(e:HTMLElement) {
            super(e);
            e.style.position = "relative";
            this.backCommand = () => {
                this.onBackCommand();
            };
        }

        onBackCommand(): void {
            if(!this.stack.length) {
                console.warn(`FrameStack is empty !!`);
                return;
            }

            var ctrl:AtomControl = this.current;
            var e:HTMLElement = ctrl._element;

            ctrl.dispose();
            e.remove();

            this.current = this.stack.pop();
            this.current._element.style.display = "";
        }

        async canChange(): Promise<boolean> {
            if(!this.current) {
                return true;
            }
            var ctrl:AtomControl = this.current;
            var vm:AtomPageViewModel = ctrl.viewModel;
            if(vm.closeWarning) {
                if( await WindowService.instance.confirm(vm.closeWarning,"Are you sure?")) {
                    return true;
                }
                return false;
            }
            return true;
        }



        push(ctrl:AtomControl): void {

            if(this.current) {
                if(this.keepStack) {
                    this.current._element.style.display = "none";
                    this.stack.push(this.current);
                } else {
                    var c1:AtomControl = this.current;
                    var e:HTMLElement = c1._element;
                    c1.dispose();
                    e.remove();
                }
            }

            var element:HTMLElement = ctrl._element;
            element.style.position = "absolute";
            element.style.top =
            element.style.bottom =
            element.style.left =
            element.style.right = "0";

            this._element.appendChild(element);

            this.current = ctrl;
        }

        init(): void {
            super.init();

            this.disposables.push(Atom.watch(this,"url", () => {
                this.load(this.url);
            }));

        }

        dispose(e?:HTMLElement): void {
            super.dispose(e);
            if(!e) {
                for(var d of this.disposables) {
                    d.dispose();
                }
                this.disposables = [];
            }
        }

        createControl(c: {new(e:HTMLElement)}, vmt: {new()}): AtomControl {
            var div:HTMLElement = document.createElement("div");
            div.id = `${this._element.id}_${this.stack.length + 1}`;

            var ctrl:any = AtomUI.createControl(div,c);

            div.setAttribute("atom-local-scope","true");

            ctrl.init();

            var vm:any = null;
            if(vmt) {
                vm = new (vmt)();
                Atom.post(()=> {
                    ctrl.viewModel = vm;
                });
            }
            return ctrl;
        }

        async load(url: string): Promise<any> {

            if(! await this.canChange()) {
                return;
            }

            var uri:AtomUri = new AtomUri(url);

            var fragments:string[] =
                uri.path.split(".")
                .map(f => this.toUpperCase(f));

            var scope:any = window;
            var vm:any = null;
            for(var f of fragments) {
                vm = scope[f + "ViewModel"];
                if(!vm) {
                    vm = scope[f + "Model"];
                }
                scope = scope[f];
                if(!scope) {
                    throw new Error(`No ${f} in ${url} found.`);
                }
            }

            var ctrl:AtomControl = this.createControl(scope,vm);

            Atom.post(() => {
                var q:any = uri.query;
                vm = ctrl.viewModel;
                if(vm) {
                    if(q) {
                        for(var k in q) {
                            if(q.hasOwnProperty(k)) {
                                var v:any = q[k];
                                vm[k] = v;
                            }
                        }
                    }

                    if(vm instanceof AtomPageViewModel) {
                        var pvm:AtomPageViewModel = vm as AtomPageViewModel;
                        pvm.pageId = ctrl._element.id;
                    }
                }
            });

            this.push(ctrl);

        }

        toUpperCase(s:string):string {
            return s.split("-")
                .filter(t => t)
                .map(t => t.substr(0,1).toUpperCase() + t.substr(1))
                .join("");
        }

    }
}