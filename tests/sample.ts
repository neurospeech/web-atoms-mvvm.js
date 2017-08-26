import * as R from "./../web-atoms-rest";

if (!Promise) {
    var Promise;
}

var Post = R.Post;
var Body = R.Body;
var Path = R.Path;

class ServiceTest extends R.WebAtoms.Rest.BaseService {

    @Post("/post/data/{a}")
    async postData(
        @Body("") data:any,
        @Path("a") a:number): Promise<any>{
        return null;
    }

}

var test:ServiceTest = new ServiceTest();
test.postData(null);
