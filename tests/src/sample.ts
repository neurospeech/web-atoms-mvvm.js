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