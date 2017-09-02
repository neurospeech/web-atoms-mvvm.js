// Test dummy
// Do not use in live
var AtomPromise = /** @class */ (function () {
    function AtomPromise() {
        this.aborted = false;
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
    AtomPromise.prototype.abort = function (throwIfResolved) {
        this.aborted = true;
        if (this.resolved) {
            if (throwIfResolved) {
                throw new Error("Abort cannot be called after promise was resolved");
            }
        }
    };
    AtomPromise.prototype.invoke = function (r, f) {
        var _this = this;
        setTimeout(function () {
            _this.resolved = true;
            if (_this.aborted || f) {
                for (var _i = 0, _a = _this.fails; _i < _a.length; _i++) {
                    var fx1 = _a[_i];
                    fx1(f || "cancelled");
                }
            }
            else {
                _this._value = r;
                for (var _b = 0, _c = _this.success; _b < _c.length; _b++) {
                    var fx = _c[_b];
                    fx();
                }
            }
        }, 100);
    };
    return AtomPromise;
}());
var Atom = window["Atom"];
Atom.json = function (url, options) {
    var pr = new AtomPromise();
    return pr;
};
Atom.refresh = function (item, property) {
    var hs = item._$_handlers;
    if (!hs)
        return;
    var hl = hs[property];
    if (!hl)
        return;
    for (var _i = 0, hl_1 = hl; _i < hl_1.length; _i++) {
        var f = hl_1[_i];
        f();
    }
};
Atom.watch = function (item, property, f) {
    var hs = item._$_handlers || (item._$_handlers = {});
    var hl = hs[property] || (hs[property] = []);
    hl.push(f);
    return f;
};
Atom.unwatch = function (item, property, f) {
    var hs = item._$_handlers;
    if (!hs)
        return;
    var hl = hs[property];
    if (!hl)
        return;
    var fi = hl.indexOf(f);
    if (fi == -1)
        return;
    hl.splice(fi, 1);
};
Atom.delay = function (n) {
    return new Promise(function (resolve, reject) {
        setTimeout(function () {
            resolve();
        }, n);
    });
};
window["Atom"] = Atom;
//# sourceMappingURL=atom.js.map