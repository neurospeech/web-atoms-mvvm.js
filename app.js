var window = {};
//var Promise = require("es6-promise").Promise;

var Promise = require("ts-promise").Promise;

//require("./dist/web-atoms-rest.js");
//require("./dist/sample.js");

var Atom = {
    json: function(){
        return { 
            toNativePromise: function(){
                console.log('toNativePromise executed');
                return new Promise(function(resolver,reject){
                    setTimeout(function(){
                        resolver('ok');
                    },100);
                });
            }
        }
    }
};

function file(name){
    return require('fs').readFileSync(name,'utf8');    
}

eval(file('./dist/web-atoms-rest.js'));
eval(file('./dist/tests/sample.js'));

process.exit(0);

