"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var injection_1 = require("../injection");
var PrototypeMeta = /** @class */ (function () {
    function PrototypeMeta() {
    }
    PrototypeMeta.AddInjection = function (target, options) {
        Reflect.defineMetadata(this.key.injection, this.GetInjections(target).concat(new injection_1.default(options)), target);
    };
    PrototypeMeta.GetInjections = function (target) {
        return Reflect.getMetadata(this.key.injection, target) || [];
    };
    PrototypeMeta.AddDestroy = function (target, fn) {
        Reflect.defineMetadata(this.key.destroy, this.GetDestroys(target).concat(fn), target);
    };
    PrototypeMeta.GetDestroys = function (target) {
        return Reflect.getMetadata(this.key.destroy, target) || [];
    };
    PrototypeMeta.key = {
        injection: Symbol(''),
        destroy: Symbol('')
    };
    return PrototypeMeta;
}());
exports.default = PrototypeMeta;
