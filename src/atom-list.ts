namespace WebAtoms{

    var AtomBinder = window["AtomBinder"];
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
        
        constructor(){
            super();
            this["__proto__"] = AtomList.prototype;
            
        }

        add(item: T): number {
            var i = this.length;
            var n = this.push(item);
            AtomBinder.invokeItemsEvent(this, "add", i, item);
            Atom.refresh(this, "length");
            return n;
        }

        addAll(items: Array<T>) {
            for (let item of items) {
                var i = this.length;
                this.push(item);
                AtomBinder.invokeItemsEvent(this, "add", i, item);
                Atom.refresh(this, "length");
            }
        }

        insert(i: number, item: T) {
            var n = this.splice(i, 0, item);
            AtomBinder.invokeItemsEvent(this, "add", i, item);
            Atom.refresh(this, "length");
        }

        removeAt(i: number) {
            var item = this[i];
            this.splice(i, 1);
            AtomBinder.invokeItemsEvent(this, "remove", i, item);
            Atom.refresh(this, "length");
        }

        remove(item: T) {
            var n = this.indexOf(item);
            if (n != -1) {
                this.removeAt(n);
            }
        }

        clear() {
            this.length = 0;
            this.refresh();
        }

        refresh() {
            AtomBinder.invokeItemsEvent(this, "refresh", -1, null);
            Atom.refresh(this, "length");
        }

        watch(f:()=>void): AtomDisposable {
            AtomBinder.add_CollectionChanged(this,f);
            return new DisposableAction(()=>{
                AtomBinder.remove_CollectionChanged(this,f);    
            });
        }

    }
}