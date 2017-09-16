var MockWindowService = WebAtoms.MockWindowService;

@Category("Window Service Tests")
class WindowTest extends TestItem{


    constructor(){
        super();

        WebAtoms.DI.push(WindowService, new WebAtoms.MockWindowService());
    }

    async dispose():Promise<any>{
        WebAtoms.DI.pop(WindowService);
    }

    @Test("Alert test")
    async alertTest(){

        var windowService = WebAtoms.DI.resolve(WindowService);

        var alertMsg = "Sample message";
        var alertTitle = "Sample title";

        MockWindowService.instance.expectAlert(alertMsg);

        await windowService.alert(alertMsg,alertTitle);

        var confirmMsg = "Are you sure?";

        MockWindowService.instance.expectConfirm(confirmMsg, () => true);

        var r = await windowService.confirm(confirmMsg,"Some title");

        Assert.isTrue(r);

        MockWindowService.instance.expectConfirm(confirmMsg, () => false);

        r = await windowService.confirm(confirmMsg,"Some title");
        
        Assert.isFalse(r);
                
        MockWindowService.instance.assert();

        await Assert.throwsAsync("No window registered for __ConfirmWindow_Are you sure?",async ()=>{
            r = await windowService.confirm(confirmMsg,"Some title");            
        });

        MockWindowService.instance.expectConfirm(confirmMsg, () => false);

         Assert.throws("Expected windows did not open __ConfirmWindow_Are you sure?",()=>{
             MockWindowService.instance.assert();
         });
        
    }

}