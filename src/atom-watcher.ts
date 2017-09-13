namespace WebAtoms{

    export function errorIf<T>(fx:( fi:(t:T) => any)=>boolean){
        return function(f:(t:T)=>any, msg:string){
            return function(target: AtomErrors<T>, propertyKey:string | symbol){
                var vm = target as any;
                if(!vm._validators){
                    vm._validators = {};
                }

                vm._validators[propertyKey] = {
                    name: propertyKey,
                    msg: msg,
                    func: f,
                    funcTrue: fx(f)
                };

                var keyName = `_${propertyKey}`;

                var getter = function(){
                    return this[keyName];
                };

                var setter = function(newVal){
                    var oldValue = this[keyName];
                    if(oldValue==newVal)
                        return;
                    this[keyName] = newVal;
                    Atom.refresh(this,propertyKey);
                    if(this.onPropertyChanged){
                        this.onPropertyChanged(propertyKey);
                    }
                }            

                if(delete this[propertyKey]){
                    Object.defineProperty(target, propertyKey,{
                        get: getter,
                        set: setter,
                        enumerable: true,
                        configurable: true
                    });
                }            
            }
        }
    }

    export class AtomErrors<T> implements AtomDisposable {

        dispose(){
            for(var w of this.watchers){
                w.dispose();
            }
            this.watchers.length = 0;
            this.watchers = null;
            this.target = null;
        }

        watchers:AtomErrorExpression<T>[];
        
        target: any;

        constructor(target:T){
            this.watchers = [];
            this.target = target;

            var x = this.constructor.prototype as any;

            if(x._validators){
                for(var k in x._validators){
                    var v = x._validators[k];

                    this.ifTrue(v.func).setError(v.name,v.msg);
                }
            }
        }

        ifEmpty(f:(x:T) => any): AtomErrorExpression<T>{
            return this.ifExpressionTrue( f, t => !(f.call(this.target)) );
        }

        ifTrue(f:(x:T) => boolean):AtomErrorExpression<T>{
            return this.ifExpressionTrue(f,f);
        }

        private ifExpressionTrue(f:(x:T) => any, fx:(x:T) => boolean): AtomErrorExpression<T>{
            var str = f.toString().trim();

            // remove last }

            if(str.endsWith("}")){
                str = str.substr(0,str.length-1);
            }

            if(str.startsWith("function (")){
                str = str.substr("function (".length);
            }

            var index = str.indexOf(")");
            var p = str.substr(0,index);

            str = str.substr(index+1);

            var regExp = `(?:(${p})(?:\.[a-zA-Z_][a-zA-Z_0-9\.]*)+)`;

            var re = new RegExp(regExp, "gi");

            var path: string[] = [];

            var ms = str.replace(re, m => {
                //console.log(`m: ${m}`);
                var px = m.substr(p.length + 1);
                path.push(px);
                return m;
            });

            var ae = this.ifExpression(...path);
            ae.func = () => {
                var r = fx.call(this,this.target);
                Atom.set(this,ae.errorField, r ? ae.errorMessage : "");
            };
            return ae;
        }


        ifExpression(...path:string[]): AtomErrorExpression<T>{
            var watcher = new AtomWatcher(this.target,path);
            var exp = new AtomErrorExpression(this,watcher);
            this.watchers.push(exp);
            return exp;
        }

        clear(){
            for(var k in this){
                if(this.hasOwnProperty(k)){
                    this[k] = null;
                    Atom.refresh(this,k);
                }
            }
        }

    }

    export class ObjectProperty{

        target: object;
        name: string;
        watcher: AtomDisposable;

        constructor(name:string){
            this.name = name;
        }

    }

    export class AtomErrorExpression<T> implements AtomDisposable{
        private setErrorMessage(a: any): any {
            Atom.set(this.errors,this.errorField, a ? this.errorMessage.replace("{errorField}",this.errorField) : false);
        }

        errors: any;

        watcher: AtomWatcher;

        errorMessage:string;
        errorField:string;

        func: (...args:any[]) => void;

        constructor(errors:AtomErrors<T>, watcher:AtomWatcher){
            this.errors = errors;
            this.watcher = watcher;
        }

        isEmpty():AtomErrorExpression<T>{
            this.func = (...args:any[])=>{
                if(args.length !== 1)
                    throw new Error("isEmpty can only be applied on single parameter");
                this.errorMessage = "{errorField} cannot be empty";
                this.setErrorMessage(!args[0]);
            };
            return this;
        }

        isTrue(f:(...args:any[])=>boolean):AtomErrorExpression<T>{
            this.func = (...args:any[])=>{
                if(args.length !== f.arguments.length)
                    throw new Error("Parameters must match");
                this.errorMessage = "{errorField} should be true";
                this.setErrorMessage( f.apply(this.errors.target, args) );
            };
            return this;
        }

        isFalse(f:(...args:any[])=>boolean):AtomErrorExpression<T>{
            this.func = (...args:any[])=>{
                if(args.length !== f.arguments.length)
                    throw new Error("Parameters must match");
                this.errorMessage = "{errorField} should be true";
                this.setErrorMessage(!f.apply(this.errors.target, args) );
            };
            return this;
        }

        setError(name:string, msg?:string){
            this.errorField = name;
            if(msg !== undefined){
                this.errorMessage = msg;
            }
            this.watcher.func = () => true;
            this.watcher.evaluate();
            this.watcher.func = this.func;
        }

        dispose(){
            this.watcher.dispose();
            this.watcher = null;
            this.func = null;
        }
    }

    export class AtomWatcher implements AtomDisposable {
        
        func: () => void;

        evaluate(): any {


            var values = this.path.map( p => {

                var t = this.target;

                return  p.map( op => {

                    var tx = t;

                    t = Atom.get(t, op.name);
                    if(t !== op.target){
                        if(op.watcher){
                            op.watcher.dispose();
                            op.watcher = null;
                        }
                        op.target = t;
                    }
                    if(tx){
                        if(!op.watcher){
                            op.watcher = Atom.watch(tx,op.name, ()=> {
                                this.evaluate();
                            });
                        }
                    }
                return t;
                }) 
            });

            values = values.map( op => op[op.length-1] );

            try{
                this.func.apply(this.target,values);
            }catch(e){
            }
        }

        path: Array<Array<ObjectProperty>>;

        target: any;

        constructor(target, path:Array<string>){
            this.target = target;
            this.path = path.map( x => x.split(".").map( y => new ObjectProperty(y) ) );
        }



        dispose(){
            for(var p of this.path){
                for(var op of p){
                    if(op.watcher){
                        op.watcher.dispose();
                    }
                }
            }
            this.func = null;
            this.path.length = 0;
            this.path = null;
        }

    }
}

var errorIf = WebAtoms.errorIf(f => f);