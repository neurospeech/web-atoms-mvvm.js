var fs = require("fs");
var vm = require("vm");

function loadScript(file){
    var s = fs.readFileSync(file,'utf-8');
    var script = new vm.Script(s, { 
        filename: file,
        displayErrors: true,
        lineOffset: 0,
        columnOffset: 0
    });
    script.runInThisContext();
}

global.window = {
    Atom: {

    },
    AtomBinder:{
        
    },
    AtomUI:{
        createControl: function(){

        }
    },
    WebAtoms:{

    }
};

global.WebAtoms = global.window.WebAtoms;

loadScript("./bin/component-generator.js");

