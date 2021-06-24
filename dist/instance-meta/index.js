"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var prototype_meta_1 = require("../prototype-meta");
var InstanceMeta = /** @class */ (function () {
    function InstanceMeta(instance) {
        var _this = this;
        this.instance = instance;
        this.injections = [];
        this.destroys = new Set();
        this.isDestroyed = false;
        this.isInit = false;
        this.readyCallback = [[], []];
        setTimeout(function () {
            if (!_this.isInit) {
                console.warn('InstanceMeta Should init', instance);
            }
        });
    }
    InstanceMeta.Init = function (instance, prototype) {
        var data = this.Get(instance, true);
        data.addInjections(prototype);
        data.addDestroyKeys(prototype);
    };
    InstanceMeta.Get = function (instance, create) {
        if (this.map.has(instance)) {
            return this.map.get(instance);
        }
        if (create) {
            var data = new this(instance);
            this.map.set(instance, data);
            return data;
        }
    };
    InstanceMeta.prototype.addInjections = function (prototype) {
        var _a;
        (_a = this.injections).push.apply(_a, prototype_meta_1.default.GetInjections(prototype));
    };
    InstanceMeta.prototype.addDestroyKeys = function (prototype) {
        var _this = this;
        prototype_meta_1.default.GetDestroys(prototype).forEach(function (fn) {
            _this.destroys.add(fn);
        });
    };
    InstanceMeta.prototype.destroy = function () {
        var _this = this;
        var _a;
        if (this.isDestroyed) {
            return;
        }
        this.isDestroyed = true;
        this.destroys.forEach(function (fn) {
            fn.apply(_this.instance, []);
        });
        this.destroys.clear();
        (_a = this.myContainer) === null || _a === void 0 ? void 0 : _a.destroy();
    };
    InstanceMeta.prototype.onReady = function (callback) {
        if (this.isInit) {
            callback(this.container);
        }
        else {
            this.readyCallback[0].push(callback);
        }
    };
    InstanceMeta.prototype.afterReady = function (callback) {
        if (this.isInit) {
            callback(this.container);
        }
        else {
            this.readyCallback[1].push(callback);
        }
    };
    InstanceMeta.prototype.bindContainer = function (container) {
        if (!this.container && !this.myContainer) {
            this.container = container;
            this.myContainer = container;
        }
        else {
            throw new Error('Container already exists');
        }
        return this;
    };
    InstanceMeta.prototype.init = function (targetContainer) {
        var _this = this;
        if (this.isInit) {
            return;
        }
        if (this.container && this.container !== targetContainer) {
            this.container.link(targetContainer);
        }
        else {
            this.container = targetContainer;
        }
        this.isInit = true;
        var container = this.container;
        this.injections.map(function (injection) {
            var token = injection.getToken();
            var value = Reflect.get(_this.instance, injection.key);
            if (value !== undefined) {
                container.setData(token, value);
            }
            else {
                value = container.factory(token, function () { return injection.factory(); });
                if (value === undefined) {
                    throw new Error('Injection failure');
                }
                Reflect.set(_this.instance, injection.key, value);
            }
            return value;
        }).forEach(function (value) {
            var _a;
            (_a = InstanceMeta.Get(value)) === null || _a === void 0 ? void 0 : _a.init(container);
        });
        this.readyCallback.forEach(function (item) { return item.forEach(function (fn) { return fn(container); }); });
        this.readyCallback = [[], []];
    };
    InstanceMeta.map = new WeakMap();
    return InstanceMeta;
}());
exports.default = InstanceMeta;
