var window = {};
//var Promise = require("es6-promise").Promise;

var Promise = require("ts-promise").Promise;

//require("./dist/web-atoms-rest.js");
//require("./dist/sample.js");

function file(name){
    return require('fs').readFileSync(name,'utf8');    
}




eval(file('./tests/build/atom.js'));

eval(file('./dist/web-atoms-mvvm.js'));

eval(file('./tests/build/sample.js'));

setTimeout(function(){
    process.exit(0);
},1000);


