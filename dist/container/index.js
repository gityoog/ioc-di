"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const instance_meta_1 = require("../instance-meta");
const token_1 = require("../token");
class Container {
    constructor(options) {
        var _a;
        this.dataMap = new WeakMap();
        this.resolverMap = new WeakMap();
        this.dataSet = new Set();
        this.children = new Set();
        (_a = options === null || options === void 0 ? void 0 : options.providers) === null || _a === void 0 ? void 0 : _a.forEach(item => {
            this.register(item.token, item.resolver);
        });
    }
    link(parent) {
        parent.children.add(this);
        this.parent = parent;
    }
    register(key, resolver) {
        this.resolverMap.set(token_1.default.Create(key), resolver);
    }
    getData(token) {
        var _a;
        if (this.dataMap.has(token)) {
            return this.dataMap.get(token);
        }
        else {
            return (_a = this.parent) === null || _a === void 0 ? void 0 : _a.getData(token);
        }
    }
    resolve(token) {
        var _a;
        if (this.resolverMap.has(token)) {
            return this.resolverMap.get(token)();
        }
        else {
            return (_a = this.parent) === null || _a === void 0 ? void 0 : _a.resolve(token);
        }
    }
    factory(token, resolver) {
        const data = this.getData(token);
        if (data !== undefined) {
            return data;
        }
        const value = this.resolve(token) || resolver();
        if (value !== undefined) {
            this.setData(token, value);
            return value;
        }
    }
    setData(token, data) {
        if (!this.dataMap.has(token)) {
            this.dataMap.set(token, data);
            this.addData(data);
        }
        else {
            if (this.dataMap.get(token) !== data) {
                throw new Error('Different values ​​in the container');
            }
        }
    }
    addData(data) {
        this.dataSet.add(data);
        return data;
    }
    destroy() {
        this.children.forEach(container => {
            container.destroy();
        });
        this.dataSet.forEach(data => {
            var _a;
            (_a = instance_meta_1.default.Get(data)) === null || _a === void 0 ? void 0 : _a.destroy();
        });
        this.parent = null;
        this.dataSet.clear();
        this.children.clear();
    }
}
exports.default = Container;
