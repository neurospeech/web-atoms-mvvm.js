"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var window = {};
//var Promise = require("es6-promise").Promise;
var con = require('manakin').global;
var Promise = require("ts-promise").Promise;
var alsatian_1 = require("alsatian");
var tap_bark_1 = require("tap-bark");
// create test set
var testSet = alsatian_1.TestSet.create();
// add your tests
//testSet.addTestsFromFiles("./mock/web-atoms.js");
//testSet.addTestsFromFiles("./dist/web-atoms-mvvm.js");
var vm = require("vm");
function file(name) {
    return require('fs').readFileSync(name, 'utf8');
}
var mock = new vm.Script(file("./mock/web-atoms.js"));
mock.runInThisContext();
var mvvm = new vm.Script(file("./dist/web-atoms-mvvm.js"));
mvvm.runInThisContext();
testSet.addTestsFromFiles("./tests/build/**/*.js");
// create a test runner
var testRunner = new alsatian_1.TestRunner();
// setup the output
testRunner.outputStream
    .pipe(tap_bark_1.TapBark.create().getPipeable())
    .pipe(process.stdout);
// run the test set
testRunner.run(testSet)
    .then(function (results) {
    console.log("Tests finished \r\n" + (results || ""));
    process.exit(0);
})
    .catch(function (error) {
    console.error("Tests failed \r\n" + (error || "no error !!"));
    process.exit(1);
});
//# sourceMappingURL=app.js.map