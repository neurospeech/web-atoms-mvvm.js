namespace WebAtoms {

    export class AtomFrameStackViewModel extends AtomViewModel {

        frameId: string;

        cancel(): void {
            this.broadcast(`pop-frame:${this.frameId}`,null);
        }

    }

    export class AtomFrameStack extends AtomControl {

        stack:AtomControl[] = [];

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

        push(ctrl:AtomControl): void {

            if(this.current) {
                this.current._element.style.display = "none";
                this.stack.push(this.current);
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