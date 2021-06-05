"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Container = exports.Root = exports.Concat = exports.Already = exports.Service = exports.InjectRef = exports.Inject = void 0;
require("reflect-metadata");
var injection_1 = require("./injection");
var container_1 = require("./container");
var instance_meta_1 = require("./instance-meta");
/** 注入属性
 * - `@Inject(token?) prop: Type`
 */
function Inject(token) {
    return function (prototype, key) {
        injection_1.default.Add(prototype, {
            key: key,
            token: token,
            type: Reflect.getMetadata('design:type', prototype, key)
        });
    };
}
exports.Inject = Inject;
/** 注入属性(循环引用)
 * - `@InjectRef(() => token) prop: Type`
 */
function InjectRef(ref) {
    return function (prototype, key) {
        injection_1.default.Add(prototype, {
            key: key,
            ref: ref
        });
    };
}
exports.InjectRef = InjectRef;
/**
 * 标记当前类需要容器初始化
 *
 * `@Service()`
 *
 * `class Target {}`
 */
function Service() {
    return function (target) {
        return /** @class */ (function (_super) {
            __extends(class_1, _super);
            function class_1() {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                var _this = _super.apply(this, args) || this;
                instance_meta_1.default.Init(_this, target.prototype);
                return _this;
            }
            return class_1;
        }(target));
    };
}
exports.Service = Service;
/**
 * 当容器初始化完成后才运行
 *
 * `@Already`
 *
 * `method(){
 * }`
 */
function Already(target, propertyKey, descriptor) {
    var method = descriptor.value;
    descriptor.value = function () {
        var _this = this;
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        instance_meta_1.default.Get(this, true).onReady(function () {
            method.apply(_this, args);
        });
    };
}
exports.Already = Already;
/**
 * 使目标类实例使用当前实例的容器
 *
 * `Concat(this, new Class)`
 */
function Concat(target, instance) {
    instance_meta_1.default.Get(target, true).addInstance(instance);
    return instance;
}
exports.Concat = Concat;
/**
 * 从当前类开始自动初始化容器
 *
 * `@Root(options?)`
 *
 * `class Target { }`
 *
 */
function Root() {
    var options = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        options[_i] = arguments[_i];
    }
    return function (target) {
        return /** @class */ (function (_super) {
            __extends(class_2, _super);
            function class_2() {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                var _this = _super.apply(this, args) || this;
                instance_meta_1.default.Get(_this, true).init(new (container_1.default.bind.apply(container_1.default, __spreadArrays([void 0], options)))());
                return _this;
            }
            return class_2;
        }(target));
    };
}
exports.Root = Root;
/**
 * 为当前类添加一个子容器
 *
 * `@Container(options?)`
 *
 * `class Target { }`
 *
 */
function Container() {
    var options = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        options[_i] = arguments[_i];
    }
    return function (target) {
        return /** @class */ (function (_super) {
            __extends(class_3, _super);
            function class_3() {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                var _this = _super.apply(this, args) || this;
                instance_meta_1.default.Get(_this, true).setContainer(new (container_1.default.bind.apply(container_1.default, __spreadArrays([void 0], options)))());
                return _this;
            }
            return class_3;
        }(target));
    };
}
exports.Container = Container;
