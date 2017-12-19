// tslint:disable-next-line
function methodBuilder(method:string) {
    // tslint:disable-next-line
    return function(url:string){
        // tslint:disable-next-line
        return function(target: WebAtoms.Rest.BaseService, propertyKey: string, descriptor: any){

            target.methods = target.methods || {};

            var a:any = target.methods[propertyKey] as Array<WebAtoms.Rest.ServiceParameter>;

            var oldFunction:any = descriptor.value;

            // tslint:disable-next-line:typedef
            descriptor.value = function(... args:any[]) {

                if(this.testMode || Atom.designMode ) {

                    console.log(`Test\Design Mode: ${url} .. ${args.join(",")}`);

                    var ro:any = oldFunction.apply(this, args);
                    if(ro) {
                        return ro;
                    }
                }

                var rn:any = null;
                if(target.methodReturns) {
                    rn = target.methodReturns[propertyKey];
                }
                var r:any = this.invoke(url, method ,a, args,rn);
                return r;
            };

            // console.log("methodBuilder called");
            // console.log({ url: url, propertyKey: propertyKey,descriptor: descriptor });
        };
    };
}

// tslint:disable-next-line
function Return(type: {new()}) {
    // tslint:disable-next-line
    return function(target: WebAtoms.Rest.BaseService, propertyKey: string, descriptor: any){
        if(!target.methodReturns) {
            target.methodReturns = {};
        }
        target.methodReturns[propertyKey] = type;
    };
}

// tslint:disable-next-line
function parameterBuilder(paramName:string){

    // tslint:disable-next-line
    return function(key:string){
        // console.log("Declaration");
        // console.log({ key:key});
        // tslint:disable-next-line
        return function(target:WebAtoms.Rest.BaseService, propertyKey: string | symbol, parameterIndex: number){
            // console.log("Instance");
            // console.log({ key:key, propertyKey: propertyKey,parameterIndex: parameterIndex });

            target.methods = target.methods || {};

            var a:any = target.methods[propertyKey];
            if(!a) {
                a = [];
                target.methods[propertyKey] = a;
            }
            a[parameterIndex] = new WebAtoms.Rest.ServiceParameter(paramName,key);
        };

    };
}


// declare var Atom:any;

type RestAttr =
    (target:WebAtoms.Rest.BaseService, propertyKey: string | Symbol, parameterIndex: number)
        => void;

type RestParamAttr = (key:string)
    => RestAttr;

type RestMethodAttr = (key: string)
    => (target:WebAtoms.Rest.BaseService, propertyKey: string | Symbol, descriptor: any)
        => void;


/**
 * This will register Url path fragment on parameter.
 *
 * @example
 *
 *      @Get("/api/products/{category}")
 *      async getProducts(
 *          @Path("category")  category: number
 *      ): Promise<Product[]> {
 *      }
 *
 * @export
 * @function Path
 * @param {name} - Name of the parameter
 */
var Path:RestParamAttr = parameterBuilder("Path");

/**
 * This will register header on parameter.
 *
 * @example
 *
 *      @Get("/api/products/{category}")
 *      async getProducts(
 *          @Header("x-http-auth")  category: number
 *      ): Promise<Product[]> {
 *      }
 *
 * @export
 * @function Path
 * @param {name} - Name of the parameter
 */
var Header:RestParamAttr = parameterBuilder("Header");

/**
 * This will register Url query fragment on parameter.
 *
 * @example
 *
 *      @Get("/api/products")
 *      async getProducts(
 *          @Query("category")  category: number
 *      ): Promise<Product[]> {
 *      }
 *
 * @export
 * @function Query
 * @param {name} - Name of the parameter
 */
var Query:RestParamAttr = parameterBuilder("Query");

/**
 * This will register data fragment on ajax.
 *
 * @example
 *
 *      @Post("/api/products")
 *      async getProducts(
 *          @Query("id")  id: number,
 *          @Body product: Product
 *      ): Promise<Product[]> {
 *      }
 *
 * @export
 * @function Body
 */
var Body:RestAttr = parameterBuilder("Body")("");

/**
 * This will register data fragment on ajax in old formModel way.
 *
 * @example
 *
 *      @Post("/api/products")
 *      async getProducts(
 *          @Query("id")  id: number,
 *          @BodyFormModel product: Product
 *      ): Promise<Product[]> {
 *      }
 *
 * @export
 * @function BodyFormModel
 */
var BodyFormModel: RestAttr = parameterBuilder("BodyFormModel")("");

/**
 * Http Post method
 * @example
 *
 *      @Post("/api/products")
 *      async saveProduct(
 *          @Body product: Product
 *      ): Promise<Product> {
 *      }
 *
 * @export
 * @function Post
 * @param {url} - Url for the operation
 */
var Post:RestMethodAttr = methodBuilder("Post");


/**
 * Http Get Method
 *
 * @example
 *
 *      @Get("/api/products/{category}")
 *      async getProducts(
 *          @Path("category") category?:string
 *      ): Promise<Product[]> {
 *      }
 *
 * @export
 * @function Body
 */
var Get:RestMethodAttr = methodBuilder("Get");

/**
 * Http Delete method
 * @example
 *
 *      @Delete("/api/products")
 *      async deleteProduct(
 *          @Body product: Product
 *      ): Promise<Product> {
 *      }
 *
 * @export
 * @function Delete
 * @param {url} - Url for the operation
 */
var Delete:RestMethodAttr = methodBuilder("Delete");

/**
 * Http Put method
 * @example
 *
 *      @Put("/api/products")
 *      async saveProduct(
 *          @Body product: Product
 *      ): Promise<Product> {
 *      }
 *
 * @export
 * @function Put
 * @param {url} - Url for the operation
 */
var Put:RestMethodAttr = methodBuilder("Put");


/**
 * Http Patch method
 * @example
 *
 *      @Patch("/api/products")
 *      async saveProduct(
 *          @Body product: any
 *      ): Promise<Product> {
 *      }
 *
 * @export
 * @function Patch
 * @param {url} - Url for the operation
 */
var Patch:RestMethodAttr = methodBuilder("Patch");

/**
 * Cancellation token
 * @example
 *
 *      @Put("/api/products")
 *      async saveProduct(
 *          @Body product: Product
 *          @Cancel cancel: CancelToken
 *      ): Promise<Product> {
 *      }
 *
 * @export
 * @function Put
 * @param {url} - Url for the operation
 */
function Cancel(target:WebAtoms.Rest.BaseService, propertyKey: string | symbol, parameterIndex: number):void {
    if(!target.methods) {
        target.methods = {};
    }

    var a:WebAtoms.Rest.ServiceParameter[] = target.methods[propertyKey];
    if(!a) {
        a = [];
        target.methods[propertyKey] = a;
    }
    a[parameterIndex] = new WebAtoms.Rest.ServiceParameter("cancel","");
}



// tslint:disable-next-line:no-string-literal
if(!window["__atomSetLocalValue"]) {

    // tslint:disable-next-line:no-string-literal
    window["__atomSetLocalValue"] = function(bt:any):Function {
        return function(k:any,v:any,e:any,r:any):void {
            var self:any = this;
            if(v) {
                if(v.then && v.catch) {

                    e._promisesQueue = e._promisesQueue || {};
                    var c:any = e._promisesQueue[k];
                    if(c) {
                        c.abort();
                    }

                    v.then( pr => {
                        if(c && c.cancelled) {
                            return;
                        }
                        e._promisesQueue[k] = null;
                        bt.setLocalValue.call(self,k,pr,e,r);
                    });

                    v.catch( er => {
                        e._promisesQueue[k] = null;
                    });

                    return;
                }
            }
            bt.setLocalValue.call(this,k,v,e,r);
        };
    };
}

namespace WebAtoms.Rest {


    export class ServiceParameter {

        public key:string;
        public type:string;

        constructor(type:string,key:string) {
            this.type = type.toLowerCase();
            this.key = key;
        }
    }

    export class AjaxOptions {
        public dataType: string;
        public contentType: string;
        public method:string;
        public url:string;
        public data: any;
        public type: string;
        public cancel: CancelToken;
        public headers: any;
        public inputProcessed: boolean;
    }

    /**
     *
     *
     * @export
     * @class CancellablePromise
     * @implements {Promise<T>}
     * @template T
     */
    export class CancellablePromise<T> implements Promise<T> {

        [Symbol.toStringTag]: "Promise";

        onCancel: () => void;
        p: Promise<T>;
        constructor(p: Promise<T>, onCancel: () => void) {
            this.p = p;
            this.onCancel = onCancel;
        }

        abort():void {
            this.onCancel();
        }

        then<TResult1 = T, TResult2 = never>(
            onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null,
            onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): Promise<TResult1 | TResult2> {
            return this.p.then(onfulfilled,onrejected);
        }

        catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): Promise<T | TResult> {
            return this.p.catch(onrejected);
        }
    }

    declare var AtomConfig:any;

    AtomConfig.ajax.jsonPostEncode = function(o:AjaxOptions): AjaxOptions {
        if(!o.inputProcessed) {
            if(o.type) {
                delete o.type;
            }
            if(o.data) {
                o.data = { formModel: JSON.stringify(o.data) };
            }
            return o;
        }
        if(o.data) {
            o.contentType = "application/json";
            o.data = JSON.stringify(o.data);
        }
        return o;
    };

    /**
     *
     *
     * @export
     * @class BaseService
     */
    export class BaseService {


        public testMode: boolean  = false;

        public showProgress: boolean = true;

        public showError: boolean = true;

        // bs

        public methods: any = {};

        public methodReturns: any = {};

        public encodeData(o:AjaxOptions):AjaxOptions {
            o.inputProcessed = true;
            o.dataType = "json";
            return o;
        }

        async sendResult(result:any,error?:any):Promise<any> {
            return new Promise((resolve,reject)=> {
                if(error) {
                    setTimeout(()=> {
                        reject(error);
                    },1);
                    return;
                }
                setTimeout(()=> {
                    resolve(result);
                },1);
            });
        }

        async invoke(
            url:string,
            method:string,
            bag:Array<ServiceParameter>,
            values:Array<any>, returns: {new ()}):Promise<any> {

            var options:AjaxOptions = new AjaxOptions();
            options.method = method;
            options.type = method;
            if(bag) {
                for(var i:number=0;i<bag.length;i++) {
                    var p:ServiceParameter = bag[i];
                    var v:any = values[i];
                    switch(p.type) {
                        case "path":
                            url = url.replace(`{${p.key}}`,encodeURIComponent(v));
                        break;
                        case "query":
                            if(url.indexOf("?")===-1) {
                                url += "?";
                            }
                            url += `&${p.key}=${encodeURIComponent(v)}`;
                        break;
                        case "body":
                            options.data = v;
                            options = this.encodeData(options);
                        break;
                        case "bodyformmodel":
                            options.inputProcessed = false;
                            options.data = v;
                        break;
                        case "cancel":
                            options.cancel = v as CancelToken;
                        break;
                        case "header":
                            options.headers = options.headers = {};
                            options.headers[p.key] = p;
                            break;
                    }
                }
            }
            options.url = url;

            var pr:AtomPromise = AtomPromise.json(url,null,options);


            if(options.cancel) {
                options.cancel.registerForCancel(()=> {
                    pr.abort();
                });
            }

            var rp:Promise<any> = new Promise((resolve: (v?: any | PromiseLike<any>) => void, reject: (reason?:any) => void)=> {

                pr.then(()=> {
                    var v:any = pr.value();

                    // deep clone...
                    // var rv = new returns();
                    // reject("Clone pending");

                    if(options.cancel) {
                        if(options.cancel.cancelled) {
                            reject("cancelled");
                            return;
                        }
                    }

                    resolve(v);
                });
                pr.failed( () => {
                    reject(pr.error.msg);
                });


                pr.showError(this.showError);
                pr.showProgress(this.showProgress);
                pr.invoke("Ok");
            });

            return new CancellablePromise(rp, ()=> {
                pr.abort();
            });
        }

    }

}