namespace WebAtoms{


    function parsePath(f:any):string[]{
        var str = f.toString().trim();
        
        // remove last }

        if(str.endsWith("}")){
            str = str.substr(0,str.length-1);
        }

        if(str.startsWith("function (")){
            str = str.substr("function (".length);
        }

        if(str.startsWith("function(")){
            str = str.substr("function(".length);
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
        //debugger;
        return path;
    }

    export class AtomErrors{

        private static isInternal = /^\_(\_target|\$\_)/;
        
        private __target: AtomViewModel;

        constructor(target:AtomViewModel){
            this.__target = target;
        }

        hasErrors():boolean{

            if(this.__target){
                this.__target.validate();
            }

            for(var k in this){
                if(AtomErrors.isInternal.test(k))
                    continue;
                if(this.hasOwnProperty(k)){
                    if(this[k])
                        return true;
                }
            }
            return false;
        }

        clear(){
            for(var k in this){
                if(AtomErrors.isInternal.test(k))
                    continue;
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

    export class AtomWatcher<T> implements AtomDisposable {
        private forValidation: boolean;

        func: (t:T) => any;

        private _isExecuting:boolean = false;

        evaluate(force?:boolean): any {

            if(this._isExecuting)
                return;

            this._isExecuting = true;

            try{

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

                if(force === true){
                    this.forValidation = false;
                }

                if(this.forValidation){
                    var x:boolean = true;
                    if(values.find( x=> x ? true : false)){
                        this.forValidation = false;
                    }else{
                        return;
                    }
                }

                try{
                    this.func.call(this.target,this.target);
                }catch(e){
                }
            }finally{
                this._isExecuting = false;
            }
        }

        path: Array<Array<ObjectProperty>>;

        target: any;

        constructor(target:T, path:string[] | ((x:T) => any) , forValidation?:boolean){
            this.target = target;
            var e:boolean = false;
            if(forValidation === true){
                this.forValidation = true;
            }
            if(path instanceof Function){
                var f = path;
                path = parsePath(path);
                e = true;
                this.func = f;
            }
            this.path = path.map( x => x.split(".").map( y => new ObjectProperty(y) ) );
            if(e){
                this.evaluate();
            }
        }



        dispose(){
            for(var p of this.path){
                for(var op of p){
                    if(op.watcher){
                        op.watcher.dispose();
                        op.watcher = null;
                    }
                }
            }
            this.func = null;
            this.path.length = 0;
            this.path = null;
        }

    }
}
