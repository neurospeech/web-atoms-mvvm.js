// tslint:disable

var AtomViewModel = WebAtoms.AtomViewModel;
var Category = WebAtoms.Unit.Category;
var Test = WebAtoms.Unit.Test;
var TestItem = WebAtoms.Unit.TestItem;
var Assert = WebAtoms.Unit.Assert;
var AtomList = WebAtoms.AtomList;
var AtomErrors = WebAtoms.AtomErrors;

var initCalled = false;

class SampleViewModelErrors{

    @bindableProperty
    name:string;

}

class SampleViewModel extends AtomViewModel{

    @bindableProperty
    data:any

    errors: SampleViewModelErrors;

    @bindableProperty
    public name:string;

    @bindableProperty
    public list:WebAtoms.AtomList<any> = new WebAtoms.AtomList();

    constructor(){
        super();
        this.data = {};


        this.errors = new SampleViewModelErrors();
    }

    @receive("message1","message2")
    receiveMessages(msg:string , data){
        this.name = msg;
        this.data = data;
    }

    @watch
    watchName(){
        this.errors.name = this.data.firstName ? "" : "Name cannot be empty";
    }

    @watch
    watchName2(){
        this.broadcast("name", this.data.firstName);
    }

    async init(){
        initCalled = true;

        this.broadcast("ui-alert","Model is ready");

        this.list.add({
            name: "Sample"
        });
    }

    watchFullName():WebAtoms.AtomDisposable{
        return this.watch(
            () => {
                this.data.fullName = `${ this.data.firstName } ${ this.data.lastName }`.trim();
                // console.log(this.data.fullName);
            }
        );
    }
}

@Category("AtomViewModel")
class AtomViewModelTest extends TestItem{



  
    @Test("validation")
    async validation (){
        var sm: SampleViewModel = new SampleViewModel();

        await sm.waitForReady();

        Atom.set(sm,"data.firstName","something");

        Assert.isTrue(sm.errors.name == "", `Error is not empty ${sm.errors.name}`);

        Atom.set(sm,"data.firstName","");
      
        Assert.isTrue(sm.errors.name != "", `Error is empty ${sm.errors.name}`);

        sm.dispose();

    }

    @Test("watch")
    async watch () {
        var sm: SampleViewModel = new SampleViewModel();

        await sm.waitForReady();

        var fullName = "";
        Atom.set(sm,"data.lastName","");

        var d = sm.watchFullName();

        Atom.set(sm,"data.firstName","Akash");

        Assert.equals("Akash",sm.data.fullName);

        Atom.set(sm,"data.lastName","Kava");

        Assert.equals("Akash Kava",sm.data.fullName);

        d.dispose();

        Atom.set(sm,"data.lastName","Kav");

        Assert.equals(sm.data.fullName,"Akash Kava");

        sm.dispose();

      
    }

    @Test("receive")
    public async receive(){

        var sm: SampleViewModel = new SampleViewModel();
        
        await sm.waitForReady();

        WebAtoms.AtomDevice.instance.broadcast("message1","message-1");

        Assert.equals("message1", sm.name);
        Assert.equals("message-1", sm.data);

        WebAtoms.AtomDevice.instance.broadcast("message2","message-2");
        
        Assert.equals("message2", sm.name);
        Assert.equals("message-2", sm.data);
                
    }


    @Test("bindableProperty")
    public async run(){

        var nameUpated:boolean;

        var vm: SampleViewModel = new SampleViewModel();

        var subscription = Atom.watch(vm,"name",()=>{
            nameUpated = true;
        });

        await vm.waitForReady();

        vm.name = "changed";

        Assert.isTrue(nameUpated);

        subscription.dispose();

        nameUpated = false;

        vm.name = "c";

        Assert.isFalse(nameUpated);
    }

    @Test("broadcast")
    public async broadcast(){

        var msg:any = {};

        var subscription = WebAtoms.AtomDevice.instance.subscribe("ui-alert",(a,g)=>{
            msg.message = a;
            msg.data = g;
        });

        var vm:SampleViewModel = new SampleViewModel();

        await vm.waitForReady();

        Assert.equals(msg.message, "ui-alert");
        Assert.equals(msg.data,"Model is ready");

        subscription.dispose();
      
    }

    @Test("Atom List")
    public async list(){
        var vm:SampleViewModel = new SampleViewModel();

        var eventCalled:boolean = false;

        var subscription = vm.list.watch(()=>{
            eventCalled = true;
        });

        await vm.waitForReady();

        Assert.isTrue(eventCalled);

        subscription.dispose();

        eventCalled = false;

        vm.list.add({});

        Assert.isFalse(eventCalled);

    }
}