if(!window["Promise"]){
    var Promise;
}



function parameterBuilder(name:string){
    return function(){

    };
}

namespace WebAtoms.Rest{


    class ServiceParameter{
        body: any;
        path: any;
        query: any;
        header: any;
    }

    export class BaseService{


        invoke():Promise<any>{
            return null;
        }

    }

}