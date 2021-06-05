import Injection from "../injection";
var InstanceMeta = /** @class */ (function () {
    function InstanceMeta(instance) {
        var _this = this;
        this.instance = instance;
        this.injections = [];
        this.isInit = false;
        this.readyCallback = [[], []];
        setTimeout(function () {
            if (!_this.isInit) {
                console.warn('InstanceMeta Should init');
            }
        });
    }
    InstanceMeta.Init = function (instance, prototype) {
        var data = this.Get(instance, true);
        data.addInjections(prototype);
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
        (_a = this.injections).push.apply(_a, Injection.Get(prototype));
    };
    InstanceMeta.prototype.onReady = function (callback, index) {
        if (index === void 0) { index = 1; }
        if (this.isInit) {
            callback();
        }
        else {
            this.readyCallback[index].push(callback);
        }
    };
    InstanceMeta.prototype.addInstance = function (instance) {
        var _this = this;
        this.onReady(function () {
            var meta = InstanceMeta.Get(instance);
            if (!meta) {
                throw new Error('InstanceMeta does not exist');
            }
            if (!_this.container) {
                throw new Error('Container does not exis');
            }
            meta.init(_this.container);
        }, 0);
    };
    InstanceMeta.prototype.setContainer = function (container) {
        if (!this.container) {
            this.container = container;
        }
        else {
            throw new Error('Container already exists');
        }
    };
    InstanceMeta.prototype.init = function (targetContainer) {
        var _this = this;
        if (this.isInit) {
            return;
        }
        if (this.container) {
            this.container.link(targetContainer);
        }
        else {
            this.container = targetContainer;
        }
        var container = this.container;
        this.injections.map(function (injection) {
            var _a;
            var token = injection.getToken();
            var value = Reflect.get(_this.instance, injection.key);
            if (value === undefined) {
                value = (_a = container.factory(token)) !== null && _a !== void 0 ? _a : injection.factory();
                if (value === undefined) {
                    throw new Error('Injection failure');
                }
                Reflect.set(_this.instance, injection.key, value);
            }
            container.setData(token, value);
            return value;
        }).forEach(function (value) {
            var _a;
            (_a = InstanceMeta.Get(value)) === null || _a === void 0 ? void 0 : _a.init(container);
        });
        this.isInit = true;
        this.readyCallback.forEach(function (item) { return item.forEach(function (fn) { return fn(); }); });
        this.readyCallback.splice(0, this.readyCallback.length);
    };
    InstanceMeta.map = new WeakMap();
    return InstanceMeta;
}());
export default InstanceMeta;
