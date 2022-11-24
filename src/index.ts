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
export function Already(target: Object, propertyKey: string, descriptor: PropertyDescriptor): void
export function Already(afterInit?: boolean): MethodDecorator
export function Already(...args: [afterInit?: boolean] | [target: Object, propertyKey: string, descriptor: PropertyDescriptor]): MethodDecorator | void {
  const generate = (afterReady: boolean) => {
    return function (target: Object, propertyKey: string, descriptor: PropertyDescriptor): void {
      const method = descriptor.value as Function
      descriptor.value = function (...args: any[]) {
        InstanceMeta.Get(this, true)[afterReady ? 'afterReady' : 'onReady'](() => {
          method.apply(this, args)
        })
      }
    }
  }
  if (args.length > 1) {
    return generate(false)(...args as [target: Object, propertyKey: string, descriptor: PropertyDescriptor])
  } else {
    return generate(args[0] === true)
  }
}

export function Concat<T extends Object>(target: Object, instance: T, token?: any, init = true) {
  const targetMeta = InstanceMeta.Get(target, true)
  targetMeta.beforeInit(container => {
    if (token) {
      container.setData(Token.Create(token), instance)
    } else {
      container.addData(instance)
    }
  })
  const meta = InstanceMeta.Get(instance)
  if (meta) {
    targetMeta.concat(meta)
  } else if (init) {
    throw new Error('Can\'t use target to initialize this')
  }
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
        InstanceMeta.Get(this, true).bindContainer(container).init(container, true)
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
  return InstanceMeta.GetContainer(instance)
}

export function Destroy<T extends object>(prototype: T, propertyKey: string, descriptor: PropertyDescriptor) {
  PrototypeMeta.AddDestroy(prototype, descriptor.value)
  descriptor.value = function () {
    InstanceMeta.Get(this)?.destroy()
  }
}

export type ToType<T> = T

export {
  DiContainer,
  InstanceMeta,
  PrototypeMeta
}