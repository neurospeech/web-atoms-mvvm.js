namespace WebAtoms.Verify {

    export var Config = {
        stop: null,
        failed: null
    };

    var isRunning = false;

     var _testsToRun: Array<Test> = [];

     class Test{
         name:string;
         test: ()=> Promise<any>

         constructor(name:string, test: ()=>Promise<any>){
             this.name = name;
             this.test = test;
         }
     }

     function runTests(){
        if(!_testsToRun.length)
        {
            Config.stop();
            return;
        }
        var first = _testsToRun.shift();
        var pr = first.test();
        pr.then(()=>{
            console.log(`${first.name} run successfully.`);
            setTimeout(()=>{
                runTests();
            },1);
        });

        pr.catch((e)=>{
            console.error(`${first.name} run failed.`);
            console.error(`\t${e}`);
            Config.failed();
        });
     }

     export function run(name:string, f: ()=>Promise<any>){
         _testsToRun.push(new Test(name,f));

         if(!isRunning){
            isRunning = true;
            setTimeout(()=> {
               runTests();
            },100);
        }
     }
}

