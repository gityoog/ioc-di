"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Destroy = exports.GetContainer = exports.Container = exports.Root = exports.Concat = exports.Already = exports.Service = exports.InjectRef = exports.Inject = void 0;
require("reflect-metadata");
const container_1 = require("./container");
const instance_meta_1 = require("./instance-meta");
const token_1 = require("./token");
const prototype_meta_1 = require("./prototype-meta");
/** 注入属性
 * - `@Inject(token?) prop: Type`
 */
function Inject(token) {
    return function (prototype, key) {
        prototype_meta_1.default.AddInjection(prototype, {
            key,
            token,
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
            key,
            ref
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
        return class extends target {
            constructor(...args) {
                super(...args);
                instance_meta_1.default.Init(this, target.prototype);
            }
        };
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
    const method = descriptor.value;
    descriptor.value = function (...args) {
        instance_meta_1.default.Get(this, true).afterReady(() => {
            method.apply(this, args);
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
    instance_meta_1.default.Get(target, true).onReady(container => {
        const meta = instance_meta_1.default.Get(instance);
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
function Root(...options) {
    return function (target) {
        return class extends target {
            constructor(...args) {
                super(...args);
                const container = new container_1.default(...options);
                container.setData(token_1.default.Create(this.constructor), this);
                instance_meta_1.default.Get(this, true).bindContainer(container).init(container);
            }
        };
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
function Container(...options) {
    return function (target) {
        return class extends target {
            constructor(...args) {
                super(...args);
                const container = new container_1.default(...options);
                container.setData(token_1.default.Create(this.constructor), this);
                instance_meta_1.default.Get(this, true).bindContainer(container);
            }
        };
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
