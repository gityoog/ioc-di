"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const injection_1 = require("../injection");
class PrototypeMeta {
    static AddInjection(target, options) {
        Reflect.defineMetadata(this.key.injection, this.GetInjections(target).concat(new injection_1.default(options)), target);
    }
    static GetInjections(target) {
        return Reflect.getMetadata(this.key.injection, target) || [];
    }
    static AddDestroy(target, fn) {
        Reflect.defineMetadata(this.key.destroy, this.GetDestroys(target).concat(fn), target);
    }
    static GetDestroys(target) {
        return Reflect.getMetadata(this.key.destroy, target) || [];
    }
}
exports.default = PrototypeMeta;
PrototypeMeta.key = {
    injection: Symbol(''),
    destroy: Symbol('')
};
