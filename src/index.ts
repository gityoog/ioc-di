import "reflect-metadata"
import { Constructor } from "./util"
import Injection from './injection'
import DiContainer from './container'
import InstanceMeta from './instance-meta'

/** 注入属性
 * - `@Inject(token?) prop: Type`
 */
export function Inject(token?: any) {
  return function <T extends Object>(prototype: T, key: string) {
    Injection.Add(prototype, {
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
    Injection.Add(prototype, {
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
  return function <T>(target: T) {
    return class extends (target as any) {
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
    InstanceMeta.Get(this, true).onReady(() => {
      method.apply(this, args)
    })
  }
}

/**
 * 使目标类实例使用当前实例的容器
 * 
 * `Concat(this, new Class)`
 */
export function Concat<T extends Object>(target: Object, instance: T) {
  InstanceMeta.Get(target, true).addInstance(instance)
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
  return function <T extends new (...args: any[]) => any>(target: T) {
    return class extends target {
      constructor(...args: any[]) {
        super(...args)
        const container = new DiContainer(...options)
        container.register(this.constructor, () => this)
        InstanceMeta.Get(this, true).init(container)
      }
    }
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
  return function <T extends new (...args: any[]) => any>(target: T) {
    return class extends target {
      constructor(...args: any[]) {
        super(...args)
        InstanceMeta.Get(this, true).setContainer(new DiContainer(...options))
      }
    }
  }
}

export function GetContainer(instance: Object) {
  return InstanceMeta.Get(instance)?.container
}