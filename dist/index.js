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
import "reflect-metadata";
import Injection from './injection';
import DiContainer from './container';
import InstanceMeta from './instance-meta';
/** 注入属性
 * - `@Inject(token?) prop: Type`
 */
export function Inject(token) {
    return function (prototype, key) {
        Injection.Add(prototype, {
            key: key,
            token: token,
            type: Reflect.getMetadata('design:type', prototype, key)
        });
    };
}
/** 注入属性(循环引用)
 * - `@InjectRef(() => token) prop: Type`
 */
export function InjectRef(ref) {
    return function (prototype, key) {
        Injection.Add(prototype, {
            key: key,
            ref: ref
        });
    };
}
/**
 * 标记当前类需要容器初始化
 *
 * `@Service()`
 *
 * `class Target {}`
 */
export function Service() {
    return function (target) {
        return /** @class */ (function (_super) {
            __extends(class_1, _super);
            function class_1() {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                var _this = _super.apply(this, args) || this;
                InstanceMeta.Init(_this, target.prototype);
                return _this;
            }
            return class_1;
        }(target));
    };
}
/**
 * 当容器初始化完成后才运行
 *
 * `@Already`
 *
 * `method(){
 * }`
 */
export function Already(target, propertyKey, descriptor) {
    var method = descriptor.value;
    descriptor.value = function () {
        var _this = this;
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        InstanceMeta.Get(this, true).onReady(function () {
            method.apply(_this, args);
        });
    };
}
/**
 * 使目标类实例使用当前实例的容器
 *
 * `Concat(this, new Class)`
 */
export function Concat(target, instance) {
    InstanceMeta.Get(target, true).addInstance(instance);
    return instance;
}
/**
 * 从当前类开始自动初始化容器
 *
 * `@Root(options?)`
 *
 * `class Target { }`
 *
 */
export function Root() {
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
                InstanceMeta.Get(_this, true).init(new (DiContainer.bind.apply(DiContainer, __spreadArrays([void 0], options)))());
                return _this;
            }
            return class_2;
        }(target));
    };
}
/**
 * 为当前类添加一个子容器
 *
 * `@Container(options?)`
 *
 * `class Target { }`
 *
 */
export function Container() {
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
                InstanceMeta.Get(_this, true).setContainer(new (DiContainer.bind.apply(DiContainer, __spreadArrays([void 0], options)))());
                return _this;
            }
            return class_3;
        }(target));
    };
}
