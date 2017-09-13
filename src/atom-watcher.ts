namespace WebAtoms{

    export class AtomErrors implements AtomDisposable {

        dispose(){
            for(var w of this.watchers){
                w.dispose();
            }
            this.watchers.length = 0;
            this.watchers = null;
            this.target = null;
        }

        watchers:AtomErrorExpression[];
        
        target: any;

        constructor(target){
            this.watchers = [];
            this.target = target;
        }

        ifExpression(...path:string[]): AtomErrorExpression{
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

    export class AtomErrorExpression implements AtomDisposable{
        private setErrorMessage(a: any): any {
            Atom.set(this.errors,this.errorField, a ? this.errorMessage.replace("{errorField}",this.errorField) : false);

            this.watcher.evaluate();
        }

        errors: any;

        watcher: AtomWatcher;

        errorMessage:string;
        errorField:string;

        func: (...args:any[]) => void;

        constructor(errors:AtomErrors, watcher:AtomWatcher){
            this.errors = errors;
            this.watcher = watcher;
        }

        isEmpty():AtomErrorExpression{
            this.func = (...args:any[])=>{
                if(args.length !== 1)
                    throw new Error("isEmpty can only be applied on single parameter");
                this.errorMessage = "{errorField} cannot be empty";
                this.setErrorMessage(!args[0]);
            };
            return this;
        }

        isTrue(f:(...args:any[])=>boolean):AtomErrorExpression{
            this.func = (...args:any[])=>{
                if(args.length !== f.arguments.length)
                    throw new Error("Parameters must match");
                this.errorMessage = "{errorField} should be true";
                this.setErrorMessage( f.apply(this.errors.target, args) );
            };
            return this;
        }

        isFalse(f:(...args:any[])=>boolean):AtomErrorExpression{
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