// Test dummy
// Do not use in live

class AtomPromise{

    aborted: boolean = false;

    success:Array<()=>void> = [];

    fails:Array<(f:any)=>void> = [];

    failed(f:(x:any)=>void){
        this.fails.push(f);
    }
    
    then(f:()=>void){
        this.success.push(f);
    }

    _value:any;
    value():any{
        return this._value;
    }

    resolved: boolean;

    abort(throwIfResolved: boolean){
        this.aborted = true;
        if(this.resolved){
            if(throwIfResolved){
                throw new Error("Abort cannot be called after promise was resolved")
            }
        }
    }

    invoke(r:any, f:any):void{

        setTimeout(() => {

            this.resolved = true;
            if(this.aborted || f){
                for(var fx1 of this.fails){
                    fx1(f || "cancelled");
                }
            }
            else
            {
                this._value = r;
                for(var fx of this.success){
                    fx();
                }
            }
        },100);
    }
}


var Atom = window["Atom"];
Atom.json = function(url,options){
    var pr = new AtomPromise();

    return pr;
};

var AtomDate = window["AtomDate"];

class AtomEnumerator{
    a:any;
    i:number;
    constructor(a:any){
        this.a = a;
        this.i = -1;
    }

    next():boolean{
        this.i++;
        return this.i < this.a.length;
    }

    current():any{
        return this.a[this.i];
    }

    currentIndex():number{
        return this.i;
    }

}

Atom.refresh = function(item:any, property:string){
    var hs = item._$_handlers;
    if(!hs)
        return;
    var hl = hs[property];
    if(!hl)
        return;
    for(var f of hl){
        f();
    }    
};

Atom.watch = function(item:any, property:string,f:()=>void): ()=>void {
    var hs = item._$_handlers || (item._$_handlers = {});
    var hl = hs[property] || (hs[property] = []);
    hl.push(f);
    return f;
};

Atom.unwatch = function(item:any, property: string, f:()=>void){
    var hs = item._$_handlers;
    if(!hs)
        return;
    var hl = hs[property] as Array<()=>void>;
    if(!hl)
        return;
    var fi = hl.indexOf(f);
    if(fi==-1)
        return;
    hl.splice(fi,1);
};

window["Atom"] = Atom;

var AtomBinder = {
    getClone: function (dupeObj) {
        var retObj:any = {};
        if (typeof (dupeObj) == 'object') {
            if (typeof (dupeObj.length) != 'undefined')
                retObj = new Array();
            for (var objInd in dupeObj) {
                var val = dupeObj[objInd];
                if (val === undefined)
                    continue;
                if (val === null) {
                    retObj[objInd] = null;
                    continue;
                }
                if (/^\_\$\_/gi.test(objInd))
                    continue;
                var type = typeof (val);
                if (type == 'object') {
                    if (val.constructor == Date) {
                        retObj[objInd] = "/DateISO(" + AtomDate.toLocalTime(val) + ")/";
                    } else {
                        retObj[objInd] = AtomBinder.getClone(val);
                    }
                } else if (type == 'string') {
                    retObj[objInd] = val;
                } else if (type == 'number') {
                    retObj[objInd] = val;
                } else if (type == 'boolean') {
                    ((val == true) ? retObj[objInd] = true : retObj[objInd] = false);
                } 
                // else if (type == 'date') {
                //     retObj[objInd] = val.getTime();
                // }
            }
        }
        return retObj;
    },
    setValue: function (target, key, value) {
        if (!target && value === undefined)
            return;
        var oldValue = AtomBinder.getValue(target, key);
        if (oldValue === value)
            return;
        var f = target["set_" + key];
        if (f) {
            f.apply(target, [value]);
        }
        else {
            target[key] = value;
        }
        AtomBinder.refreshValue(target, key, oldValue, value);
    },
    refreshValue: function (target, key,oldValue,value) {
        var handlers = AtomBinder.get_WatchHandler(target, key);
        if (handlers == undefined || handlers == null)
            return;
        var ae = new AtomEnumerator(handlers);
        while (ae.next()) {
            var item = ae.current();
            item(target, key,oldValue,value);
        }

        if (target._$_watcher) {
            target._$_watcher._onRefreshValue(target, key);
        }
    },
    getValue: function (target, key) {
        if (target == null)
            return null;
        var f = target["get_" + key];
        if (f) {
            return f.apply(target);
        }
        return target[key];
    },
    add_WatchHandler: function (target, key, handler) {
        if (target == null)
            return;
        var handlers = AtomBinder.get_WatchHandler(target, key);
        handlers.push(handler);
    },
    get_WatchHandler: function (target, key) {
        if (target == null)
            return null;
        var handlers = target._$_handlers;
        if (!handlers) {
            handlers = {};
            target._$_handlers = handlers;
        }
        var handlersForKey = handlers[key];
        if (handlersForKey == undefined || handlersForKey == null) {
            handlersForKey = [];
            handlers[key] = handlersForKey;
        }
        return handlersForKey;
    },
    remove_WatchHandler: function (target, key, handler) {
        if (target == null)
            return;
        if (target._$_handlers === undefined || target._$_handlers === null)
            return;
        var handlersForKey = target._$_handlers[key];
        if (handlersForKey == undefined || handlersForKey == null)
            return;
        var ae = new AtomEnumerator(handlersForKey);
        while (ae.next()) {
            if (ae.current() == handler) {
                handlersForKey.splice(ae.currentIndex(), 1);
                return;
            }
        }
    },

    invokeItemsEvent: function (target, mode, index, item) {
        var key = "_items";
        var handlers = AtomBinder.get_WatchHandler(target, key);
        if (!handlers)
            return;
        var ae = new AtomEnumerator(handlers);
        while (ae.next()) {
            var obj = ae.current();
            obj(mode, index, item);
        }
        if (target._$_watcher) {
            target._$_watcher._onRefreshItems(target, mode, index, item);
        }
        AtomBinder.refreshValue(target, "length",undefined,undefined);
    },
    clear: function (ary) {
        ary.length = 0;
        AtomBinder.invokeItemsEvent(ary, "refresh", 0, null);
    },
    addItem: function (ary, item) {
        var l = ary.length;
        ary.push(item);
        AtomBinder.invokeItemsEvent(ary, "add", l, item);
    },
    insertItem: function (ary, index, item) {
        ary.splice(index, 0, item);
        AtomBinder.invokeItemsEvent(ary, "add", index, item);
    },
    addItems: function (ary, items) {
        var ae = new AtomEnumerator(items);
        while (ae.next()) {
            AtomBinder.addItem(ary, ae.current());
        }
    },
    removeItem: function (ary, item) {
        var i = ary.indexOf(item);
        if (i == -1)
            return;
        ary.splice(i, 1);
        AtomBinder.invokeItemsEvent(ary, "remove", i, item);
    },
    removeAtIndex: function (ary, i) {
        if (i == -1)
            return;
        var item = ary[i];
        ary.splice(i, 1);
        AtomBinder.invokeItemsEvent(ary, "remove", i, item);
    },
    refreshItems: function (ary) {
        AtomBinder.invokeItemsEvent(ary, "refresh", -1, null);
    },
    add_CollectionChanged: function (target, handler) {
        if (target == null)
            return;
        var key = "_items";
        var handlers = AtomBinder.get_WatchHandler(target, key);
        handlers.push(handler);
    },
    remove_CollectionChanged: function (target, handler) {
        if (target == null)
            return;
        if (!target._$_handlers)
            return;
        var key = "_items";
        var handlersForKey = target._$_handlers[key];
        if (handlersForKey == undefined || handlersForKey == null)
            return;
        var ae = new AtomEnumerator(handlersForKey);
        while (ae.next()) {
            if (ae.current() == handler) {
                handlersForKey.splice(ae.currentIndex(), 1);
                return;
            }
        }
    },
    setError: function (target, key, message) {
        var errors = AtomBinder.getValue(target, "__errors");
        if (!errors) {
            AtomBinder.setValue(target, "__errors", {});
        }
        AtomBinder.setValue(errors, key, message);
    }

};

//window["AtomBinder"] = AtomBinder;
for(var item in AtomBinder){
    window["AtomBinder"][item] = AtomBinder[item];
}
