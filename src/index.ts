import "reflect-metadata"
import { Constructor, AbstractConstructor } from "./util"
import DiContainer from './container'
import InstanceMeta from './instance-meta'
import Token from "./token"
import PrototypeMeta from './prototype-meta'

/** 注入属性
 * - `@Inject(token?) prop: Type`
 */
export function Inject(token?: any) {
  return function <T extends Object>(prototype: T, key: string) {
    PrototypeMeta.AddInjection(prototype, {
      key,
      token,
      type: Reflect.getMetadata('design:type', prototype, key)
    })
  }
}

/** 注入属性(循环引用)
 * - `@InjectRef(() => token) prop: Type`
 */
export function InjectRef(ref: () => any) {
  return function <T extends Object>(prototype: T, key: string) {
    PrototypeMeta.AddInjection(prototype, {
      key,
      ref
    })
  }
}

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
export function Service() {
  return function <T extends AbstractConstructor>(target: T) {
    return class extends (target as unknown as Constructor) {
      constructor(...args: any[]) {
        super(...args)
        InstanceMeta.Init(this, (target as unknown as Constructor).prototype)
      }
    } as unknown as T
  }
}

/**
 * 当容器初始化完成后才运行
 * 
 * `@Already`
 * 
 * `method(){
 * }`
 */
export function Already<T extends object>(target: T, propertyKey: string, descriptor: PropertyDescriptor) {
  const method = descriptor.value as Function
  descriptor.value = function (...args: any[]) {
    InstanceMeta.Get(this, true).afterReady(() => {
      method.apply(this, args)
    })
  }
}

/**
 * 使目标类实例使用当前实例的容器
 * 
 * `Concat(this, new Class)`
 */
export function Concat<T extends Object>(target: Object, instance: T, token?: any) {
  InstanceMeta.Get(target, true).onReady(container => {
    const meta = InstanceMeta.Get(instance)
    if (!meta) {
      throw new Error('Can\'t use target to initialize this')
    }
    if (token) {
      container.setData(Token.Create(token), instance)
    } else {
      container.addData(instance)
    }
    meta.init(container)
  })
  return instance
}

/**
 * 从当前类开始自动初始化容器
 * 
 * `@Root(options?)`
 * 
 * `class Target { }`
 * 
 */
export function Root(...options: ConstructorParameters<typeof DiContainer>) {
  return function <T extends AbstractConstructor>(target: T) {
    return class extends (target as unknown as Constructor) {
      constructor(...args: any[]) {
        super(...args)
        const container = new DiContainer(...options)
        container.setData(Token.Create(this.constructor), this)
        InstanceMeta.Get(this, true).bindContainer(container).init(container)
      }
    } as unknown as T
  }
}

/**
 * 为当前类添加一个子容器
 * 
 * `@Container(options?)`
 * 
 * `class Target { }`
 * 
 */
export function Container(...options: ConstructorParameters<typeof DiContainer>) {
  return function <T extends AbstractConstructor>(target: T) {
    return class extends (target as unknown as Constructor) {
      constructor(...args: any[]) {
        super(...args)
        const container = new DiContainer(...options)
        container.setData(Token.Create(this.constructor), this)
        InstanceMeta.Get(this, true).bindContainer(container)
      }
    } as unknown as T
  }
}

export function GetContainer(instance: Object) {
  return InstanceMeta.Get(instance)?.container
}

export function Destroy<T extends object>(prototype: T, propertyKey: string, descriptor: PropertyDescriptor) {
  PrototypeMeta.AddDestroy(prototype, descriptor.value)
  descriptor.value = function () {
    InstanceMeta.Get(this)?.destroy()
  }
}