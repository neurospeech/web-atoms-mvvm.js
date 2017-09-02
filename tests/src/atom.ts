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

Atom.delay = function(n:number):Promise<any>{
    return new Promise((resolve,reject)=>{
        setTimeout(()=>{
            resolve();
        },n);
    });
};

window["Atom"] = Atom;