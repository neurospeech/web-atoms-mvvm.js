var window = {};
//var Promise = require("es6-promise").Promise;
var con = require('manakin').global;


var Promise = require("ts-promise").Promise;


import { TestSet, TestRunner } from "alsatian";
import { TapBark } from "tap-bark";

// create test set
const testSet = TestSet.create();

// add your tests
//testSet.addTestsFromFiles("./mock/web-atoms.js");
//testSet.addTestsFromFiles("./dist/web-atoms-mvvm.js");

var vm = require("vm");

function file(name){
    return require('fs').readFileSync(name,'utf8');    
}


const mock = new vm.Script(file("./mock/web-atoms.js"));
mock.runInThisContext();

const mvvm = new vm.Script(file("./dist/web-atoms-mvvm.js"));
mvvm.runInThisContext();

testSet.addTestsFromFiles("./tests/build/**/*.js");

// create a test runner
const testRunner = new TestRunner();

// setup the output
testRunner.outputStream
          // this will use alsatian's default output if you remove this
          // you'll get TAP or you can add your favourite TAP reporter in it's place
          .pipe(TapBark.create().getPipeable()) 
          // pipe to the console
          .pipe(process.stdout);

// run the test set
testRunner.run(testSet)
          // this will be called after all tests have been run
          .then((results) => {
              console.log("Tests finished \r\n" + (results || ""));
              process.exit(0);
        } )
          // this will be called if there was a problem
          .catch((error) => {
            console.error("Tests failed \r\n" + (error || "no error !!"));
              process.exit(1);
        });