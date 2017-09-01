var WebAtoms;
(function (WebAtoms) {
    var Verify;
    (function (Verify) {
        Verify.Config = {
            stop: null,
            failed: null
        };
        var isRunning = false;
        var _testsToRun = [];
        var Test = /** @class */ (function () {
            function Test(name, test) {
                this.name = name;
                this.test = test;
            }
            return Test;
        }());
        function runTests() {
            if (!_testsToRun.length) {
                Verify.Config.stop();
                return;
            }
            var first = _testsToRun.shift();
            var pr = first.test();
            pr.then(function () {
                console.log(first.name + " run successfully.");
                setTimeout(function () {
                    runTests();
                }, 1);
            });
            pr.catch(function (e) {
                console.error(first.name + " run failed.");
                console.error("\t" + e);
                Verify.Config.failed();
            });
        }
        function run(name, f) {
            _testsToRun.push(new Test(name, f));
            if (!isRunning) {
                isRunning = true;
                setTimeout(function () {
                    runTests();
                }, 100);
            }
        }
        Verify.run = run;
    })(Verify = WebAtoms.Verify || (WebAtoms.Verify = {}));
})(WebAtoms || (WebAtoms = {}));
//# sourceMappingURL=async-tests.js.map