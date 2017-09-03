import { Expect, AsyncTest, TestFixture } from "alsatian";

var initCalled = false;

class SampleViewModel extends WebAtoms.AtomViewModel{

    @bindableProperty
    public name:string;

    async init(){
        initCalled = true;
    }
}

@TestFixture("Async Test")
export class AtomViewModelTest{
     
    @AsyncTest("Atom-View-Model")
    public async run(){

        var nameUpated:boolean;

        var vm: SampleViewModel = new SampleViewModel();

        var fx = Atom.watch(vm,"name",()=>{
            nameUpated = true;
        });

        await Atom.delay(100);

        vm.name = "changed";

        Expect(nameUpated)
            .toBe(false);
    }
}