// Test dummy
// Do not use in live

class AtomPromise{

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

    invoke(r:any, f:any):void{

        setTimeout(() => {

            if(r){
                this._value = r;
                for(var fx of this.success){
                    fx();
                }
            }else{
                for(var fx1 of this.fails){
                    fx1(f);
                }
            }
        },10);
    }
}


var Atom = window["Atom"] || {};
Atom.json = function(url,options){
    var pr = new AtomPromise();

    return pr;
};
window["Atom"] = Atom;