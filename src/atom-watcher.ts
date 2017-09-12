namespace WebAtoms{

    export class AtomErrors{

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

        constructor(target, path:Array<string>, f : () => void){
            this.target = target;
            this.path = path.map( x => x.split(".").map( y => new ObjectProperty(y) ) );
            this.func = f;
            this.evaluate();

        }

        dispose(){
            for(var p of this.path){
                for(var op of p){
                    if(op.watcher){
                        op.watcher.dispose();
                    }
                }
            }
        }

    }
}