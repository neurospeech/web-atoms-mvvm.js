/// <reference path="./../../dist/web-atoms-mvvm.d.ts"/>

class Task extends WebAtoms.AtomModel{

    @bindableProperty
    label:String;

}


@DIGlobal
class ServiceTest extends WebAtoms.Rest.BaseService {

    @Post("/post/data/{a}")
    @Return(Task)
    async postData(
        @Body("") data:any,
        @Path("a") a:number): Promise<any>{
        return null;
    }

}

var test:ServiceTest = WebAtoms.DI.resolve(ServiceTest);
test.postData({},2).then(v => {
    console.log("Done");
});
