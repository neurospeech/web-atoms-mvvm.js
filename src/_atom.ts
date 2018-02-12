// tslint:disable

declare function mapLibrary(...a:any[]):any;
declare function createProperty(...a:any[]):any;

function classCreator(name, basePrototype, classConstructor, classPrototype, classProperties, thisPrototype, thisProperties) {
    var baseClass = basePrototype ? basePrototype.constructor : null;
    var old = classConstructor || (function () { });
    var cp = classProperties;
    var f = null;
    if (baseClass) {
        if (classProperties) {
            f = function () {
                for (var k in cp) {
                    this["_" + k] = cp[k];
                }
                baseClass.apply(this, arguments);
                this.__typeName = name;
                //var cp = Atom.clone(classProperties);
                old.apply(this, arguments);
            };
        } else {
            f = function () {
                baseClass.apply(this, arguments);
                this.__typeName = name;
                old.apply(this, arguments);
            };
        }

        var bpt = baseClass.prototype;

        // extend
        for (var k in bpt) {
            if (classPrototype[k])
                continue;
            if (bpt.hasOwnProperty(k)) {
                var pd = Object.getOwnPropertyDescriptor(bpt, k);
                if (!pd) {
                    classPrototype[k] = bpt[k];
                } else {
                    Object.defineProperty(classPrototype, k, pd);
                }
            }
        }

    } else {
        if (classProperties) {
            f = function () {
                this.__typeName = name;
                //var cp = Atom.clone(classProperties);
                for (var k in cp) {
                    this["_" + k] = cp[k];
                }
                old.apply(this, arguments);
            };
        } else {
            f = function () {
                this.__typeName = name;
                old.apply(this, arguments);
            };
        }
    }

    if (classProperties) {
        for (var k in classProperties) {
            if (!classPrototype["get_" + k]) {
                classPrototype["get_" + k] = createProperty("_"+ k,true);
            }
            if (!classPrototype["set_" + k]) {
                classPrototype["set_" + k] = createProperty("_" + k); 
            }
        }

    }

    for (var k in classPrototype) {

        if (/^get\_/.test(k)) {

            var gx = classPrototype[k];
            var nx = k.substr(4);
            var sx = classPrototype["set_" + nx];

            Object.defineProperty(classPrototype, nx, {
                get: gx,
                set: sx ? createProperty("_" + nx, false, nx) : undefined,
                enumerable: true,
                configurable: true
            });
        }
    }

    f.__typeName = name;

    if (baseClass) {
        f.__baseType = baseClass;
        var fx:Function = f;
        function __(... args:any[]){
            fx.call(this,args);
            this.constructor = classPrototype;
        }

        __.prototype = basePrototype;
        f = new __();
    }
    else {
        f.prototype = classPrototype;
        f.prototype.constructor = f;
    }
    //f.constructor = classPrototype;
    if (!classPrototype.hasOwnProperty("toString")) {
        f.prototype.toString = function () {
            return name;
        };
    }

    mapLibrary( /\./.test(name) ? name : 'WebAtoms.' + name, window, f);

    return f;
};
