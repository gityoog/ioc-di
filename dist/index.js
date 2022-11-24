"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrototypeMeta = exports.InstanceMeta = exports.DiContainer = exports.Destroy = exports.GetContainer = exports.Container = exports.Root = exports.Concat = exports.Already = exports.Service = exports.InjectRef = exports.Inject = void 0;
require("reflect-metadata");
const container_1 = require("./container");
exports.DiContainer = container_1.default;
const instance_meta_1 = require("./instance-meta");
exports.InstanceMeta = instance_meta_1.default;
const token_1 = require("./token");
const prototype_meta_1 = require("./prototype-meta");
exports.PrototypeMeta = prototype_meta_1.default;
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
function Already(...args) {
    const generate = (afterReady) => {
        return function (target, propertyKey, descriptor) {
            const method = descriptor.value;
            descriptor.value = function (...args) {
                instance_meta_1.default.Get(this, true)[afterReady ? 'afterReady' : 'onReady'](() => {
                    method.apply(this, args);
                });
            };
        };
    };
    if (args.length > 1) {
        return generate(false)(...args);
    }
    else {
        return generate(args[0] === true);
    }
}
exports.Already = Already;
function Concat(target, instance, token, init = true) {
    const targetMeta = instance_meta_1.default.Get(target, true);
    targetMeta.beforeInit(container => {
        if (token) {
            container.setData(token_1.default.Create(token), instance);
        }
        else {
            container.addData(instance);
        }
    });
    const meta = instance_meta_1.default.Get(instance);
    if (init) {
        if (meta) {
            targetMeta.concat(meta);
        }
        else {
            throw new Error('Can\'t use target to initialize this');
        }
    }
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
                instance_meta_1.default.Get(this, true).bindContainer(container).init(container, true);
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
    return instance_meta_1.default.GetContainer(instance);
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
