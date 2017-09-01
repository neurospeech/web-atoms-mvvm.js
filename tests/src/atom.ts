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


var Atom = window["Atom"] || {};
Atom.json = function(url,options){
    var pr = new AtomPromise();

    return pr;
};
window["Atom"] = Atom;