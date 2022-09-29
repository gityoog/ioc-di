"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const prototype_meta_1 = require("../prototype-meta");
class InstanceMeta {
    constructor(instance) {
        this.instance = instance;
        this.injections = [];
        this.destroys = new Set();
        this.isDestroyed = false;
        this.isInit = false;
        this.readyCallback = [[], []];
        this.beforeCallback = [];
        this.isBind = false;
        setTimeout(() => {
            if (!this.isInit) {
                console.warn('InstanceMeta Should init', instance);
            }
        });
    }
    static Init(instance, prototype) {
        const data = this.Get(instance, true);
        data.addInjections(prototype);
        data.addDestroyKeys(prototype);
    }
    static Get(instance, create) {
        if (this.map.has(instance)) {
            return this.map.get(instance);
        }
        if (create) {
            const data = new this(instance);
            this.map.set(instance, data);
            return data;
        }
    }
    addInjections(prototype) {
        this.injections.push(...prototype_meta_1.default.GetInjections(prototype));
    }
    addDestroyKeys(prototype) {
        prototype_meta_1.default.GetDestroys(prototype).forEach(fn => {
            this.destroys.add(fn);
        });
    }
    destroy() {
        var _a;
        if (this.isDestroyed) {
            return;
        }
        this.isDestroyed = true;
        this.destroys.forEach(fn => {
            fn.apply(this.instance, []);
        });
        this.destroys.clear();
        if (this.isBind) {
            (_a = this.container) === null || _a === void 0 ? void 0 : _a.destroy();
        }
    }
    beforeInit(callback) {
        if (this.isInit) {
            callback(this.container);
        }
        else {
            this.beforeCallback.push(callback);
        }
    }
    onReady(callback) {
        if (this.isInit) {
            callback(this.container);
        }
        else {
            this.readyCallback[0].push(callback);
        }
    }
    afterReady(callback) {
        if (this.isInit) {
            callback(this.container);
        }
        else {
            this.readyCallback[1].push(callback);
        }
    }
    bindContainer(container) {
        if (!this.container && !this.isBind) {
            this.container = container;
            this.isBind = true;
        }
        else {
            throw new Error('Container already exists');
        }
        return this;
    }
    init(targetContainer) {
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
        const container = this.container;
        this.beforeCallback.forEach(fn => fn(container));
        this.beforeCallback = [];
        this.injections.map(injection => {
            const token = injection.getToken();
            let value = Reflect.get(this.instance, injection.key);
            if (value !== undefined) {
                container.setData(token, value);
            }
            else {
                value = container.factory(token, () => injection.factory());
                if (value === undefined) {
                    throw new Error('Injection failure');
                }
                Reflect.set(this.instance, injection.key, value);
            }
            return value;
        }).forEach(value => {
            var _a;
            (_a = InstanceMeta.Get(value)) === null || _a === void 0 ? void 0 : _a.init(container);
        });
        this.readyCallback.forEach(item => item.forEach(fn => fn(container)));
        this.readyCallback = [[], []];
    }
}
exports.default = InstanceMeta;
InstanceMeta.map = new WeakMap();
