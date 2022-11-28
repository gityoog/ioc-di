"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const prototype_meta_1 = require("../prototype-meta");
class InstanceMeta {
    constructor(instance) {
        this.instance = instance;
        this.injections = [];
        this.isInit = false;
        this.isBind = false;
        this.children = [];
        this.beforeCallback = [];
        this.readyCallback = [];
        this.afterReadyCallback = [];
        this.destroys = new Set();
        this.isDestroyed = false;
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
    static GetContainer(instance) {
        var _a;
        return (_a = this.Get(instance)) === null || _a === void 0 ? void 0 : _a.container;
    }
    addInjections(prototype) {
        const injections = prototype_meta_1.default.GetInjections(prototype);
        this.injections.push(...injections);
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
    concat(child) {
        if (child.isInit) {
            console.warn('InstanceMeta already init', child);
        }
        else {
            if (this.isInit) {
                child.init(this.container, true);
            }
            else {
                this.children.push(child);
            }
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
    init(targetContainer, start = false) {
        if (this.isInit) {
            return console.warn('InstanceMeta already init', this);
        }
        this.isInit = true;
        if (this.container && this.container !== targetContainer) {
            this.container.link(targetContainer);
        }
        else {
            this.container = targetContainer;
        }
        const container = this.container;
        this.beforeCallback.forEach(fn => fn(container));
        this.beforeCallback = [];
        const metas = this.injections.map(injection => {
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
            return InstanceMeta.Get(value);
        }).map(meta => {
            if (meta && !meta.isInit) {
                meta.init(container);
                return meta;
            }
        }).filter(meta => meta);
        this.children.forEach(child => {
            child.init(container);
        });
        this.children.unshift(...metas);
        this.readyCallback.forEach(fn => fn(container));
        this.readyCallback = [];
        if (start) {
            this.afterInit();
        }
    }
    onReady(callback) {
        if (this.isInit) {
            callback(this.container);
        }
        else {
            this.readyCallback.push(callback);
        }
    }
    afterInit() {
        this.afterReadyCallback.forEach(fn => fn());
        this.afterReadyCallback = [];
        this.children.forEach(child => {
            child.afterInit();
        });
        this.children = [];
    }
    afterReady(callback) {
        if (this.isInit) {
            callback();
        }
        else {
            this.afterReadyCallback.push(callback);
        }
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
}
exports.default = InstanceMeta;
InstanceMeta.map = new WeakMap();
