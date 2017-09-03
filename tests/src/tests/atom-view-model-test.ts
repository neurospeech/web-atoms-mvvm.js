var AtomViewModel = WebAtoms.AtomViewModel;
var Category = WebAtoms.Unit.Category;
var Test = WebAtoms.Unit.Test;
var TestItem = WebAtoms.Unit.TestItem;
var Assert = WebAtoms.Unit.Assert;
var AtomList = WebAtoms.AtomList;

var initCalled = false;

class SampleViewModel extends AtomViewModel{

    @bindableProperty
    public name:string;

    @bindableProperty
    public list:WebAtoms.AtomList<any> = new WebAtoms.AtomList();

    async init(){
        initCalled = true;

        this.broadcast("ui-alert","Model is ready");

        await Atom.delay(100);

        this.list.add({
            name: "Sample"
        });
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

        Atom.unwatch(vm,"name",fx);

        nameUpated = false;

        vm.name = "c";

        Assert.isFalse(nameUpated);
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

    @Test("Atom List")
    public async list(){
        var vm:SampleViewModel = new SampleViewModel();

        var eventCalled:boolean = false;

        var f = vm.list.watch(()=>{
            eventCalled = true;
        });

        await this.delay(1000);

        Assert.isTrue(eventCalled);

        vm.list.unwatch(f);

        eventCalled = false;

        vm.list.add({});

        Assert.isFalse(eventCalled);

    }
}