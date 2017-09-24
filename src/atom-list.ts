namespace WebAtoms {

    // tslint:disable-next-line
    var AtomBinder = window["AtomBinder"];
    // tslint:disable-next-line
    var AtomPromise = window["AtomPromise"];


    /**
     *
     *
     * @export
     * @class AtomList
     * @extends {Array<T>}
     * @template T
     */
    export class AtomList<T> extends Array<T> {

        constructor() {
            super();

            // tslint:disable-next-line
            this["__proto__"] = AtomList.prototype;

        }

        add(item: T): number {
            var i:number = this.length;
            var n:number = this.push(item);
            AtomBinder.invokeItemsEvent(this, "add", i, item);
            Atom.refresh(this, "length");
            return n;
        }

        addAll(items: Array<T>):void {
            for (let item of items) {
                var i:number = this.length;
                this.push(item);
                AtomBinder.invokeItemsEvent(this, "add", i, item);
                Atom.refresh(this, "length");
            }
        }

        insert(i: number, item: T):void {
            var n:any = this.splice(i, 0, item);
            AtomBinder.invokeItemsEvent(this, "add", i, item);
            Atom.refresh(this, "length");
        }

        removeAt(i: number):void {
            var item:T = this[i];
            this.splice(i, 1);
            AtomBinder.invokeItemsEvent(this, "remove", i, item);
            Atom.refresh(this, "length");
        }

        remove(item: T):boolean {
            var n:number = this.indexOf(item);
            if (n !== -1) {
                this.removeAt(n);
                return true;
            }
            return false;
        }

        clear():void {
            this.length = 0;
            this.refresh();
        }

        refresh():void {
            AtomBinder.invokeItemsEvent(this, "refresh", -1, null);
            Atom.refresh(this, "length");
        }

        watch(f:()=>void): AtomDisposable {
            AtomBinder.add_CollectionChanged(this,f);
            return new DisposableAction(()=> {
                AtomBinder.remove_CollectionChanged(this,f);
            });
        }

    }
}