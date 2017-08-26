"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Promise = Promise || function () { };
function methodBuilder(method) {
    return function (url) {
        return function (target, propertyKey, descriptor) {
            var a = target.methods[propertyKey];
            descriptor.value = function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                return target.invoke(url, method, a, args);
            };
            //console.log("Instance");
            //console.log({ url: url, propertyKey: propertyKey,descriptor: descriptor });
        };
    };
}
function parameterBuilder(paramName) {
    return function (key) {
        //console.log("Declaration");
        //console.log({ key:key});
        return function (target, propertyKey, parameterIndex) {
            //console.log("Instance");
            //console.log({ key:key, propertyKey: propertyKey,parameterIndex: parameterIndex });
            var a = target.methods[propertyKey];
            if (!a) {
                a = [];
                target.methods[propertyKey] = a;
            }
            a[parameterIndex] = new WebAtoms.Rest.ServiceParameter(paramName, key);
        };
    };
}
exports.Path = parameterBuilder("Path");
exports.Query = parameterBuilder("Query");
exports.Body = parameterBuilder("Body");
exports.Post = methodBuilder("Post");
var WebAtoms;
(function (WebAtoms) {
    var Rest;
    (function (Rest) {
        var ServiceParameter = (function () {
            function ServiceParameter(type, key) {
                this.type = type.toLowerCase();
                this.key = key;
            }
            return ServiceParameter;
        }());
        Rest.ServiceParameter = ServiceParameter;
        var BaseService = (function () {
            function BaseService() {
            }
            BaseService.prototype.invoke = function (url, method, bag, values) {
                var options = {
                    method: method
                };
                for (var i = 0; i < bag.length; i++) {
                    var p = bag[i];
                    var v = values[i];
                    switch (p.type) {
                        case 'path':
                            url = url.replace("{" + p.key + "}", encodeURIComponent(v));
                            break;
                        case 'query':
                            if (url.indexOf('?') === -1) {
                                url += "?";
                            }
                            url += "&" + p.key + "=" + encodeURIComponent(v);
                            break;
                        case 'body':
                            options.data = v;
                            break;
                    }
                }
                return null;
            };
            return BaseService;
        }());
        Rest.BaseService = BaseService;
    })(Rest = WebAtoms.Rest || (WebAtoms.Rest = {}));
})(WebAtoms = exports.WebAtoms || (exports.WebAtoms = {}));
