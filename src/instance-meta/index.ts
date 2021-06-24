import Container from "../container"
import Injection from "../injection"
import PrototypeMeta from "../prototype-meta"
import DiContainer from '../container'

export default class InstanceMeta {
  static map = new WeakMap<Object, InstanceMeta>()
  static Init(instance: Object, prototype: Object) {
    const data = this.Get(instance, true)
    data.addInjections(prototype)
    data.addDestroyKeys(prototype)
  }
  static Get(instance: Object): InstanceMeta | undefined
  static Get(instance: Object, create: true): InstanceMeta
  static Get(instance: Object, create?: boolean) {
    if (this.map.has(instance)) {
      return this.map.get(instance)!
    }
    if (create) {
      const data = new this(instance)
      this.map.set(instance, data)
      return data
    }
  }

  private constructor(private instance: Object) {
    setTimeout(() => {
      if (!this.isInit) {
        console.warn('InstanceMeta Should init', instance)
      }
    })
  }

  private injections: Injection[] = []
  addInjections(prototype: Object) {
    this.injections.push(
      ...PrototypeMeta.GetInjections(prototype)
    )
  }

  private destroys = new Set<Function>()
  addDestroyKeys(prototype: Object) {
    PrototypeMeta.GetDestroys(prototype).forEach(fn => {
      this.destroys.add(fn)
    })
  }
  private isDestroyed = false
  destroy() {
    if (this.isDestroyed) {
      return
    }
    this.isDestroyed = true
    this.destroys.forEach(fn => {
      fn.apply(this.instance, [])
    })
    this.destroys.clear()
    this.myContainer?.destroy()
  }

  private isInit = false
  private readyCallback: [Array<(container: DiContainer) => void>, Array<(container: DiContainer) => void>] = [[], []]
  onReady(callback: (container: DiContainer) => void): void {
    if (this.isInit) {
      callback(this.container!)
    } else {
      this.readyCallback[0].push(callback)
    }
  }
  afterReady(callback: (container: DiContainer) => void) {
    if (this.isInit) {
      callback(this.container!)
    } else {
      this.readyCallback[1].push(callback)
    }
  }

  private myContainer?: Container
  container?: Container
  bindContainer(container: Container) {
    if (!this.container && !this.myContainer) {
      this.container = container
      this.myContainer = container
    } else {
      throw new Error('Container already exists')
    }
    return this
  }

  init(targetContainer: Container) {
    if (this.isInit) {
      return
    }
    if (this.container && this.container !== targetContainer) {
      this.container.link(targetContainer)
    } else {
      this.container = targetContainer
    }
    this.isInit = true
    const container = this.container
    this.injections.map(injection => {
      const token = injection.getToken()
      let value = Reflect.get(this.instance, injection.key)
      if (value !== undefined) {
        container.setData(token, value)
      } else {
        value = container.factory(token, () => injection.factory())
        if (value === undefined) {
          throw new Error('Injection failure')
        }
        Reflect.set(this.instance, injection.key, value)
      }
      return value
    }).forEach(value => {
      InstanceMeta.Get(value)?.init(container)
    })
    this.readyCallback.forEach(item => item.forEach(fn => fn(container)))
    this.readyCallback = [[], []]
  }
}