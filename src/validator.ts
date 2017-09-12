var validate = function(
        error:string, 
        func: (... a:any[])=> boolean, 
        ... args:any[]
    ){
    return function(target:WebAtoms.AtomViewModel, propertyKey: string){

        //debugger;
        var vm = target as any;

        if(!vm._watchMethods){
            vm._watchMethods = {};
        }

        var watcher = {
            error: error,
            func: func,
            args: args
        };

        vm._watchMethods[propertyKey] = watcher;

        var keyName = `_${propertyKey}`;

        var getter = function(){
            return this[keyName];
        };

        var setter = function(newVal){
            var oldValue = this[keyName];
            if(oldValue==newVal)
                return;
            this[keyName] = newVal;
            Atom.refresh(this,propertyKey);
            if(this.onPropertyChanged){
                this.onPropertyChanged(propertyKey);
            }
        }

        if(delete this[propertyKey]){
            Object.defineProperty(target, propertyKey,{
                get: getter,
                set: setter,
                enumerable: true,
                configurable: true
            });
        }
        
    }
}

namespace WebAtoms{




}