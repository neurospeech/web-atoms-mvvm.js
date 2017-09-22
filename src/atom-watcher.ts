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

        str = str.trim();

        var index = str.indexOf(")");

        var isThis = index == 0;
        
        var p = index == 0 ? "\_this|this" : str.substr(0,index);

        str = str.substr(index+1);

        var regExp = `(?:(${p})(?:\.[a-zA-Z_][a-zA-Z_0-9\.]*)+)`;

        var re = new RegExp(regExp, "gi");

        var path: string[] = [];

        var ms = str.replace(re, m => {
            //console.log(`m: ${m}`);
            var px = m;
            if(px.startsWith("this.")){
                px = px.substr(5);
            } else if(px.startsWith("_this.")){
                px = px.substr(6);
            } else {
                px = px.substr(p.length + 1);
            }
            //console.log(px);
            if(!path.find(y => y == px)){
                path.push(px);
            }
            return m;
        });
        //debugger;
        return path;
    }

    /**
     * AtomErrors class holds all validation errors registered in view model.
     * 
     * hasErrors() method will return true if there are any validation errors in this AtomErrors object.
     * 
     * @export
     * @class AtomErrors
     */
    export class AtomErrors{

        private static isInternal = /^\_(\_target|\$\_)/;
        
        private __target: AtomViewModel;

        /**
         * Creates an instance of AtomErrors.
         * @param {AtomViewModel} target 
         * @memberof AtomErrors
         */
        constructor(target:AtomViewModel){
            this.__target = target;
        }

        /**
         * 
         * 
         * @returns {boolean} 
         * @memberof AtomErrors
         */
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

        /**
         * 
         * 
         * @memberof AtomErrors
         */
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

        toString(){
            return this.name;
        }

    }

    /**
     * 
     * 
     * @export
     * @class AtomWatcher
     * @implements {AtomDisposable}
     * @template T 
     */
    export class AtomWatcher<T> implements AtomDisposable {
        private forValidation: boolean;

        /**
         * If path was given as an array of string property path, you can use this `func` that will be executed
         * when any of property is updated. 
         * 
         * You must manually invoke evaluate after setting this property.
         * 
         * @memberof AtomWatcher
         */
        func: (t:T) => any;

        private _isExecuting:boolean = false;

        /**
         * 
         * 
         * @param {boolean} [force] 
         * @returns {*} 
         * @memberof AtomWatcher
         */
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
                                if(typeof tx == "object"){
                                    op.watcher = Atom.watch(tx,op.name, ()=> {
                                        //console.log(`${op.name} modified`);
                                        this.evaluate();
                                    });
                                }
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
                    console.warn(e);
                }
            }finally{
                this._isExecuting = false;
            }
        }

        path: Array<Array<ObjectProperty>>;

        target: any;

        /**
         * Creates an instance of AtomWatcher.
         * 
         *      var w = new AtomWatcher(this, x => x.data.fullName = `${x.data.firstName} ${x.data.lastName}`);
         * 
         * You must dispose `w` in order to avoid memory leaks.
         * Above method will set fullName whenver, data or its firstName,lastName property is modified.
         * 
         * AtomWatcher will assign null if any expression results in null in single property path.
         * 
         * In order to avoid null, you can rewrite above expression as,
         * 
         *      var w = new AtomWatcher(this, 
         *                  x => { 
         *                      if(x.data.firstName && x.data.lastName){
         *                        x.data.fullName = `${x.data.firstName} ${x.data.lastName}`  
         *                      }
         *                  });
         * 
         * @param {T} target - Target on which watch will be set to observe given set of properties
         * @param {(string[] | ((x:T) => any))} path - Path is either lambda expression or array of property path to watch, if path was lambda, it will be executed when any of members will modify
         * @param {boolean} [forValidation] forValidtion - Ignore, used for internal purpose
         * @memberof AtomWatcher
         */
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



        /**
         * This will dispose and unregister all watchers
         * 
         * @memberof AtomWatcher
         */
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
