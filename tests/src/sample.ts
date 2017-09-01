/// <reference path="./../../dist/web-atoms-mvvm.d.ts"/>
/// <reference path="./../../tests/src/async-tests.ts"/>

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
        @Path("a") a:number,
        @Cancel cancel:WebAtoms.CancelToken): Promise<any>{
        return null;
    }

}

var run = WebAtoms.Verify.run;

var ct: WebAtoms.CancelToken = new WebAtoms.CancelToken();

var test:ServiceTest = WebAtoms.DI.resolve(ServiceTest);


run("Success test",async ()=>{
    await test.postData({},2, ct);
    ct.reset();
});

run("Cancel test", async ()=>{
    var p = test.postData({},2, ct);
    //ct.cancel();
    try{
        await p;
    }catch(e){
        if(e === "cancelled")
            return;
    }
    throw new Error("Cancel was not called");
});
