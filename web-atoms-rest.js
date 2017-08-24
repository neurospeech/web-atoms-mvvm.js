var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
if (!window["Promise"]) {
    var Promise;
}
function parameterBuilder(name) {
    return function () {
    };
}
var WebAtoms;
(function (WebAtoms) {
    var Rest;
    (function (Rest) {
        var ServiceParameter = (function () {
            function ServiceParameter() {
            }
            return ServiceParameter;
        }());
        var BaseService = (function () {
            function BaseService() {
            }
            BaseService.prototype.invoke = function () {
                return null;
            };
            return BaseService;
        }());
        Rest.BaseService = BaseService;
    })(Rest = WebAtoms.Rest || (WebAtoms.Rest = {}));
})(WebAtoms || (WebAtoms = {}));
/// <reference path="../web-atoms-rest.ts"/>
var ServiceTest = (function (_super) {
    __extends(ServiceTest, _super);
    function ServiceTest() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return ServiceTest;
}(WebAtoms.Rest.BaseService));
