namespace WebAtoms {


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

            this.next = () => {
                this.start = this.start + this.size;
            };

            this.prev = () => {
                if(this.start >= this.size) {
                    this.start = this.start - this.size;
                }
            };
        }

        public next: Function;
        public prev: Function;

        private _start:number = 0;
        public get start():number {
            return this._start;
        }
        public set start(v:number) {
            this._start = v;
            Atom.refresh(this,"start");
        }

        private _total:number = 0;
        public get total():number {
            return this._total;
        }
        public set total(v:number) {
            this._total = v;
            Atom.refresh(this,"total");
        }

        private _size:number = 0;
        public get size():number {
            return this._size;
        }
        public set size(v:number) {
            this._size = v;
            Atom.refresh(this,"size");
        }



        /**
         * Adds the item in the list and refresh bindings
         * @param {T} item
         * @returns {number}
         * @memberof AtomList
         */
        add(item: T): number {
            var i:number = this.length;
            var n:number = this.push(item);
            AtomBinder.invokeItemsEvent(this, "add", i, item);
            Atom.refresh(this, "length");
            return n;
        }

        /**
         * Add given items in the list and refresh bindings
         * @param {Array<T>} items
         * @memberof AtomList
         */
        addAll(items: Array<T>):void {
            for (let item of items) {
                var i:number = this.length;
                this.push(item);
                AtomBinder.invokeItemsEvent(this, "add", i, item);
                Atom.refresh(this, "length");
            }
            // tslint:disable-next-line:no-string-literal
            var t:number = this["total"];
            if(t) {
                this.total = t;
            }
        }

        /**
         * Replaces list with given items, use this
         * to avoid flickering in screen
         * @param {T[]} items
         * @memberof AtomList
         */
        replace(items:T[]):void {
            this.length = 0;
            this.concat(items);
            this.refresh();
            // tslint:disable-next-line:no-string-literal
            var t:number = this["total"];
            if(t) {
                this.total = t;
            }
        }

        /**
         * Inserts given number in the list at position `i`
         * and refreshes the bindings.
         * @param {number} i
         * @param {T} item
         * @memberof AtomList
         */
        insert(i: number, item: T):void {
            var n:any = this.splice(i, 0, item);
            AtomBinder.invokeItemsEvent(this, "add", i, item);
            Atom.refresh(this, "length");
        }

        /**
         * Removes item at given index i and refresh the bindings
         * @param {number} i
         * @memberof AtomList
         */
        removeAt(i: number):void {
            var item:T = this[i];
            this.splice(i, 1);
            AtomBinder.invokeItemsEvent(this, "remove", i, item);
            Atom.refresh(this, "length");
        }

        /**
         * Removes given item or removes all items that match
         * given lambda as true and refresh the bindings
         * @param {(T | ((i:T) => boolean))} item
         * @returns {boolean} `true` if any item was removed
         * @memberof AtomList
         */
        remove(item: T | ((i:T) => boolean)):boolean {

            if(item instanceof Function) {
                var index: number = 0;
                var removed :boolean = false;
                for(var it of this) {
                    if(item(it)) {
                        this.removeAt(index);
                        removed = true;
                    }
                    index++;
                }
                return removed;
            }

            var n:number = this.indexOf(item);
            if (n !== -1) {
                this.removeAt(n);
                return true;
            }
            return false;
        }

        /**
         * Removes all items from the list and refreshes the bindings
         * @memberof AtomList
         */
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

    // tslint:disable
    Array.prototype["add"] = AtomList.prototype.add;
    Array.prototype["addAll"] = AtomList.prototype.addAll;
    Array.prototype["clear"] = AtomList.prototype.clear;
    Array.prototype["refresh"] = AtomList.prototype.refresh;
    Array.prototype["remove"] = AtomList.prototype.remove;
    Array.prototype["removeAt"] = AtomList.prototype.removeAt;
    Array.prototype["watch"] = AtomList.prototype.watch;
}