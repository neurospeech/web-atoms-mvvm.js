//import * as R from "./../web-atoms-rest";

/// <reference path="./../web-atoms-rest.ts"/>

class ServiceTest extends WebAtoms.Rest.BaseService {

    @Post("/post/data/{a}")
    async postData(
        @Body("") data:any,
        @Path("a") a:number): Promise<any>{
        return null;
    }

}

var test:ServiceTest = new ServiceTest();
test.postData({},2).then(v => {
    console.log("Done");
});
