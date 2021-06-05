import Container from "../container"
import Injection from "../injection"


export default class InstanceMeta {
  static map = new WeakMap<Object, InstanceMeta>()
  static Init(instance: Object, prototype: Object) {
    const data = this.Get(instance, true)
    data.addInjections(prototype)
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
        console.warn('InstanceMeta Should init')
      }
    })
  }

  private injections: Injection[] = []
  addInjections(prototype: Object) {
    this.injections.push(
      ...Injection.Get(prototype)
    )
  }

  private isInit = false
  private readyCallback: [Array<() => void>, Array<() => void>] = [[], []]
  onReady(callback: () => void, index: 0 | 1 = 1): void {
    if (this.isInit) {
      callback()
    } else {
      this.readyCallback[index].push(callback)
    }
  }

  addInstance(instance: Object) {
    this.onReady(() => {
      const meta = InstanceMeta.Get(instance)
      if (!meta) {
        throw new Error('InstanceMeta does not exist')
      }
      if (!this.container) {
        throw new Error('Container does not exis')
      }
      meta.init(this.container)
    }, 0)
  }

  container?: Container
  setContainer(container: Container) {
    if (!this.container) {
      this.container = container
    } else {
      throw new Error('Container already exists')
    }
  }

  init(targetContainer: Container) {
    if (this.isInit) {
      return
    }
    if (this.container) {
      this.container.link(targetContainer)
    } else {
      this.container = targetContainer
    }
    this.isInit = true
    const container = this.container
    this.injections.map(injection => {
      const token = injection.getToken()
      let value = Reflect.get(this.instance, injection.key)
      if (value === undefined) {
        value = container.factory(token) ?? injection.factory()
        if (value === undefined) {
          throw new Error('Injection failure')
        }
        Reflect.set(this.instance, injection.key, value)
      }
      container.setData(token, value)
      return value
    }).forEach(value => {
      InstanceMeta.Get(value)?.init(container)
    })
    this.readyCallback.forEach(item => item.forEach(fn => fn()))
    this.readyCallback.splice(0, this.readyCallback.length)
  }
}