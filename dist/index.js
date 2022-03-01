"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Destroy = exports.GetContainer = exports.Container = exports.Root = exports.Concat = exports.Already = exports.Service = exports.InjectRef = exports.Inject = void 0;
require("reflect-metadata");
var container_1 = require("./container");
var instance_meta_1 = require("./instance-meta");
var token_1 = require("./token");
var prototype_meta_1 = require("./prototype-meta");
/** 注入属性
 * - `@Inject(token?) prop: Type`
 */
function Inject(token) {
    return function (prototype, key) {
        prototype_meta_1.default.AddInjection(prototype, {
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
        prototype_meta_1.default.AddInjection(prototype, {
            key: key,
            ref: ref
        });
    };
}
exports.InjectRef = InjectRef;
// export function Optional(token?: any) {
//   return function <T extends Object>(prototype: T, key: string) {
//     PrototypeMeta.AddInjection(prototype, {
//       key,
//       token,
//       type: Reflect.getMetadata('design:type', prototype, key)
//     })
//   }
// }
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
        instance_meta_1.default.Get(this, true).afterReady(function () {
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
function Concat(target, instance, token) {
    instance_meta_1.default.Get(target, true).onReady(function (container) {
        var meta = instance_meta_1.default.Get(instance);
        if (!meta) {
            throw new Error('Can\'t use target to initialize this');
        }
        if (token) {
            container.setData(token_1.default.Create(token), instance);
        }
        else {
            container.addData(instance);
        }
        meta.init(container);
    });
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
                var container = new (container_1.default.bind.apply(container_1.default, __spreadArray([void 0], options)))();
                container.setData(token_1.default.Create(_this.constructor), _this);
                instance_meta_1.default.Get(_this, true).bindContainer(container).init(container);
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
                var container = new (container_1.default.bind.apply(container_1.default, __spreadArray([void 0], options)))();
                container.setData(token_1.default.Create(_this.constructor), _this);
                instance_meta_1.default.Get(_this, true).bindContainer(container);
                return _this;
            }
            return class_3;
        }(target));
    };
}
exports.Container = Container;
function GetContainer(instance) {
    var _a;
    return (_a = instance_meta_1.default.Get(instance)) === null || _a === void 0 ? void 0 : _a.container;
}
exports.GetContainer = GetContainer;
function Destroy(prototype, propertyKey, descriptor) {
    prototype_meta_1.default.AddDestroy(prototype, descriptor.value);
    descriptor.value = function () {
        var _a;
        (_a = instance_meta_1.default.Get(this)) === null || _a === void 0 ? void 0 : _a.destroy();
    };
}
exports.Destroy = Destroy;
