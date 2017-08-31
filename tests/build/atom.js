// Test dummy
// Do not use in live
var AtomPromise = /** @class */ (function () {
    function AtomPromise() {
        this.success = [];
        this.fails = [];
    }
    AtomPromise.prototype.failed = function (f) {
        this.fails.push(f);
    };
    AtomPromise.prototype.then = function (f) {
        this.success.push(f);
    };
    AtomPromise.prototype.value = function () {
        return this._value;
    };
    AtomPromise.prototype.invoke = function (r, f) {
        var _this = this;
        setTimeout(function () {
            if (r) {
                _this._value = r;
                for (var _i = 0, _a = _this.success; _i < _a.length; _i++) {
                    var fx = _a[_i];
                    fx();
                }
            }
            else {
                for (var _b = 0, _c = _this.fails; _b < _c.length; _b++) {
                    var fx1 = _c[_b];
                    fx1(f);
                }
            }
        }, 10);
    };
    return AtomPromise;
}());
var Atom = window["Atom"] || {};
Atom.json = function (url, options) {
    var pr = new AtomPromise();
    return pr;
};
window["Atom"] = Atom;
//# sourceMappingURL=atom.js.map