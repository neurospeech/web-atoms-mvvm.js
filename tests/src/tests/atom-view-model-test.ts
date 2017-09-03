var AtomViewModel = WebAtoms.AtomViewModel;
var Category = WebAtoms.Unit.Category;
var Test = WebAtoms.Unit.Test;
var TestItem = WebAtoms.Unit.TestItem;
var Assert = WebAtoms.Unit.Assert;

var initCalled = false;

class SampleViewModel extends AtomViewModel{

    @bindableProperty
    public name:string;

    async init(){
        initCalled = true;

        this.broadcast("ui-alert","Model is ready");
    }
}

@Category("AtomViewModel")
class AtomViewModelTest extends TestItem{
     
    @Test("bindableProperty")
    public async run(){

        var nameUpated:boolean;

        var vm: SampleViewModel = new SampleViewModel();

        var fx = Atom.watch(vm,"name",()=>{
            nameUpated = true;
        });

        await this.delay(100);

        vm.name = "changed";

        Assert.isTrue(nameUpated);
    }

    @Test("broadcast")
    public async broadcast(){

        var msg:any = {};

        WebAtoms.AtomDevice.instance.subscribe("ui-alert",(a,g)=>{
            msg.message = a;
            msg.data = g;
        });

        var vm:SampleViewModel = new SampleViewModel();

        await this.delay(1000);

        Assert.equals(msg.message, "ui-alert");
        Assert.equals(msg.data,"Model is ready");
        
    }
}