function methodBuilder(method:string){
    return function(url:string){
        return function(target: WebAtoms.Rest.BaseService, propertyKey: string, descriptor: any){

            target.methods = target.methods || {};
            
            var a = target.methods[propertyKey] as Array<WebAtoms.Rest.ServiceParameter>;

            var oldFunction = descriptor.value;

            descriptor.value = function(... args:any[]){

                if(this.testMode || Atom.designMode ){

                    console.log(`Test\Design Mode: ${url} .. ${args.join(",")}`);

                    var ro = oldFunction.apply(this, args);
                    if(ro){
                        return ro;
                    }
                }

                var rn = null;
                if(target.methodReturns){
                    rn = target.methodReturns[propertyKey];
                }                
                var r = this.invoke(url, method ,a, args,rn);
                return r;
            };

            //console.log("methodBuilder called");
            //console.log({ url: url, propertyKey: propertyKey,descriptor: descriptor });
        }
    }
}

function Return(type: {new()}){
    return function(target: WebAtoms.Rest.BaseService, propertyKey: string, descriptor: any){
        if(!target.methodReturns){
            target.methodReturns = {};
        }
        target.methodReturns[propertyKey] = type;
    }
}

function parameterBuilder(paramName:string){
    return function(key:string){
        //console.log("Declaration");
        //console.log({ key:key});
        return function(target:WebAtoms.Rest.BaseService, propertyKey: string | symbol, parameterIndex: number){
            //console.log("Instance");
            //console.log({ key:key, propertyKey: propertyKey,parameterIndex: parameterIndex });

            target.methods = target.methods || {};

            var a = target.methods[propertyKey];
            if(!a){
                a = [];
                target.methods[propertyKey] = a;
            }
            a[parameterIndex] = new WebAtoms.Rest.ServiceParameter(paramName,key);
        }

    };
}


declare var Atom:any;

var Path = parameterBuilder("Path");
var Query = parameterBuilder("Query");
var Body = parameterBuilder("Body")("");

var Post = methodBuilder("Post");
var Get = methodBuilder("Get");
var Delete = methodBuilder("Delete");
var Put = methodBuilder("Put");

var Cancel = function(target:WebAtoms.Rest.BaseService, propertyKey: string | symbol, parameterIndex: number){
    if(!target.methods){
        target.methods = {};
    }

    var a = target.methods[propertyKey];
    if(!a){
        a = [];
        target.methods[propertyKey] = a;
    }
    a[parameterIndex] = new WebAtoms.Rest.ServiceParameter("cancel","");
};



if(!window["__atomSetLocalValue"]){
    window["__atomSetLocalValue"] = function(bt){
        return function(k,v,e,r){
            var self = this;
            if(v){
                if(v.then && v.catch){

                    e._promisesQueue = e._promisesQueue || {};
                    var c = e._promisesQueue[k];
                    if(c){
                        c.abort();
                    }

                    v.then(function(pr){
                        if(c && c.cancelled)
                            return;
                        e._promisesQueue[k] = null;
                        bt.setLocalValue.call(self,k,pr,e,r);
                    });

                    v.catch(function(er){
                        e._promisesQueue[k] = null;
                    });
                }
            }
            bt.setLocalValue.call(this,k,v,e,r);
        }
    };
}

namespace WebAtoms.Rest{


    export class ServiceParameter{

        public key:string;
        public type:string;

        constructor(type:string,key:string){
            this.type = type.toLowerCase();
            this.key = key;
        }
    }

    export class AjaxOptions{
        public method:string;
        public url:string;
        public data: any;
        public type: string;
        public cancel: CancelToken;
    }

    var AtomPromise = window["AtomPromise"];

    export class CancellablePromise<T> implements Promise<T>{

        [Symbol.toStringTag]: "Promise"

        onCancel: () => void;
        p: Promise<T>;
        constructor(p: Promise<T>, onCancel: () => void) {
            this.p = p;
            this.onCancel = onCancel;
        }

        abort(){
            this.onCancel();
        }

        then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): Promise<TResult1 | TResult2>
        {
            return this.p.then(onfulfilled,onrejected);
        }

        catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): Promise<T | TResult>{
            return this.p.catch(onrejected);
        }
    }

    export class BaseService{


        public testMode: boolean  = false;

        public showProgress: boolean = true;
        
        public showError: boolean = true;

        //bs

        public methods: any = {};

        public methodReturns: any = {};

        public encodeData(o:AjaxOptions):AjaxOptions{
            o.type = "JSON";
            return o;
        }

        async sendResult(result:any,error?:any):Promise<any>{
            return new Promise((resolve,reject)=>{
                if(error){
                    setTimeout(()=>{
                        reject(error);
                    },1);
                    return;
                }
                setTimeout(()=>{
                    resolve(result);
                },1);
            });
        }

        async invoke(
            url:string,
            method:string, 
            bag:Array<ServiceParameter>,
            values:Array<any>, returns: {new ()}):Promise<any>{

            var options:AjaxOptions = new AjaxOptions();
            options.method = method;
            if(bag){
                for(var i=0;i<bag.length;i++){
                    var p:ServiceParameter = bag[i];
                    var v = values[i];
                    switch(p.type){
                        case 'path':
                            url = url.replace(`{${p.key}}`,encodeURIComponent(v));
                        break;
                        case 'query': 
                            if(url.indexOf('?')===-1){
                                url += "?";
                            }
                            url += `&${p.key}=${encodeURIComponent(v)}`;
                        break;
                        case 'body':
                            options.data = v;
                            options = this.encodeData(options);
                        break;
                        case 'cancel':
                            options.cancel = v as CancelToken;
                        break;
                    }
                }
            }
            options.url = url;            

            var pr = AtomPromise.json(url,null,options);


            if(options.cancel){
                options.cancel.registerForCancel(()=>{
                    pr.abort();
                });
            }

            var rp = new Promise((resolve: (v?: any | PromiseLike<any>) => void, reject: (reason?:any) => void)=>{

                pr.then(()=>{
                    var v = pr.value();

                    // deep clone...
                    //var rv = new returns();
                    //reject("Clone pending");

                    if(options.cancel){
                        if(options.cancel.cancelled){
                            reject("cancelled");
                            return;
                        }
                    }

                    resolve(v);
                });
                pr.failed( () =>{
                    reject(pr.error.msg);
                });

                
                pr.showError(this.showError);
                pr.showProgress(this.showProgress);
                pr.invoke("Ok");                 
            });

            return new CancellablePromise(rp, ()=>{
                pr.abort();
            });
        }

    }

}