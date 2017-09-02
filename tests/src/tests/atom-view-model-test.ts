import { Expect, AsyncTest } from "alsatian";

var initCalled = false;

class SampleViewModel extends WebAtoms.AtomViewModel{

    @bindableProperty
    public name:string;

    async init(){
        initCalled = true;
    }
}

export class AtomViewModelTest{
     
    @AsyncTest("Atom-View-Model")
    public async run(){

        var nameUpated:boolean;

        var vm: SampleViewModel = new SampleViewModel();

        var fx = Atom.watch(vm,"name",()=>{
            nameUpated = true;
        });

        await Atom.delay(100);

        //vm.name = "changed";
        if(nameUpated){
            console.log("name updated");
        }else{
            console.error("failed");
        }
    }
}