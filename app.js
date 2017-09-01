var window = {};
//var Promise = require("es6-promise").Promise;
var con = require('manakin').global;


var Promise = require("ts-promise").Promise;

//require("./dist/web-atoms-rest.js");
//require("./dist/sample.js");

function file(name){
    return require('fs').readFileSync(name,'utf8');    
}




eval(file('./tests/build/atom.js'));

eval(file('./dist/web-atoms-mvvm.js'));

eval(file('./tests/build/async-tests.js'));

eval(file('./tests/build/sample.js'));

WebAtoms.Verify.Config.failed = function(){
    process.abort();
};

WebAtoms.Verify.Config.stop = function(){
    process.exit(0);
};

