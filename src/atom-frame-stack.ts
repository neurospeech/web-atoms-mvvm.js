namespace WebAtoms {

    export class AtomPageView extends AtomControl {

        stack:AtomControl[] = [];

        @bindableProperty
        keepStack: boolean = true;

        @bindableProperty
        current:AtomControl = null;

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
            // tslint:disable-next-line:no-string-literal
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
                    var ctrl:AtomControl = this.current;
                    var e:HTMLElement = ctrl._element;
                    ctrl.dispose();
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

    }
}