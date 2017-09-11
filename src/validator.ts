var watch = function(name:string){
    return function(target:WebAtoms.AtomViewModel, propertyKey: string, i:number){

        //debugger;
        var vm = target as any;

        if(!vm._watchMethods){
            vm._watchMethods = {};
        }

        var a = vm._watchMethods[propertyKey] 
            || (vm._watchMethods[propertyKey] = []);
        a[i] = name;
    }
}

namespace WebAtoms{




}