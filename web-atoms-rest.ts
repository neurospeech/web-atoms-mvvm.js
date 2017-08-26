
var Promise = Promise || function(){};


function methodBuilder(method:string){
    return function(url:string){
        return function(target: WebAtoms.Rest.BaseService, propertyKey: string, descriptor: any){

            var a = target.methods[propertyKey] as Array<WebAtoms.Rest.ServiceParameter>;

            descriptor.value = function(... args:any[]){
                return target.invoke(url, method ,a, args);
            };

            //console.log("Instance");
            //console.log({ url: url, propertyKey: propertyKey,descriptor: descriptor });
        }
    }
}

function parameterBuilder(paramName:string){
    return function(key:string){
        //console.log("Declaration");
        //console.log({ key:key});
        return function(target:WebAtoms.Rest.BaseService, propertyKey: string | symbol, parameterIndex: number){
            //console.log("Instance");
            //console.log({ key:key, propertyKey: propertyKey,parameterIndex: parameterIndex });
            var a = target.methods[propertyKey];
            if(!a){
                a = [];
                target.methods[propertyKey] = a;
            }
            a[parameterIndex] = new WebAtoms.Rest.ServiceParameter(paramName,key);
        }

    };
}


export var Path = parameterBuilder("Path");
export var Query = parameterBuilder("Query");
export var Body = parameterBuilder("Body");

export var Post = methodBuilder("Post");

export module WebAtoms.Rest{


    export class ServiceParameter{

        public key:string;
        public type:string;

        constructor(type:string,key:string){
            this.type = type.toLowerCase();
            this.key = key;
        }
    }

    export class BaseService{

        //bs

        public methods: any;

        invoke(url:string,method:string, bag:Array<ServiceParameter>,values:Array<any>):Promise<any>{

            var options:any = {
                method: method
            };

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
                    break;
                }
            }

            return null;
        }

    }

}