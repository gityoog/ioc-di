"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var instance_meta_1 = require("../instance-meta");
var token_1 = require("../token");
var Container = /** @class */ (function () {
    function Container(options) {
        var _this = this;
        var _a;
        this.dataMap = new WeakMap();
        this.resolverMap = new WeakMap();
        this.dataSet = new Set();
        this.children = new Set();
        (_a = options === null || options === void 0 ? void 0 : options.providers) === null || _a === void 0 ? void 0 : _a.forEach(function (item) {
            _this.register(item.token, item.resolver);
        });
    }
    Container.prototype.link = function (parent) {
        parent.children.add(this);
        this.parent = parent;
    };
    Container.prototype.register = function (key, resolver) {
        this.resolverMap.set(token_1.default.Create(key), resolver);
    };
    Container.prototype.getData = function (token) {
        var _a;
        if (this.dataMap.has(token)) {
            return this.dataMap.get(token);
        }
        else {
            return (_a = this.parent) === null || _a === void 0 ? void 0 : _a.getData(token);
        }
    };
    Container.prototype.resolve = function (token) {
        var _a;
        if (this.resolverMap.has(token)) {
            return this.resolverMap.get(token)();
        }
        else {
            return (_a = this.parent) === null || _a === void 0 ? void 0 : _a.resolve(token);
        }
    };
    Container.prototype.factory = function (token, resolver) {
        var data = this.getData(token);
        if (data !== undefined) {
            return data;
        }
        var value = this.resolve(token) || resolver();
        if (value !== undefined) {
            this.setData(token, value);
            return value;
        }
    };
    Container.prototype.setData = function (token, data) {
        if (!this.dataMap.has(token)) {
            this.dataMap.set(token, data);
            this.addData(data);
        }
        else {
            if (this.dataMap.get(token) !== data) {
                throw new Error('Different values ​​in the container');
            }
        }
    };
    Container.prototype.addData = function (data) {
        this.dataSet.add(data);
        return data;
    };
    Container.prototype.destroy = function () {
        this.children.forEach(function (container) {
            container.destroy();
        });
        this.dataSet.forEach(function (data) {
            var _a;
            (_a = instance_meta_1.default.Get(data)) === null || _a === void 0 ? void 0 : _a.destroy();
        });
        this.parent = null;
        this.dataSet.clear();
        this.children.clear();
    };
    return Container;
}());
exports.default = Container;
