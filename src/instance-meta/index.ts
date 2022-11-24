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
  static GetContainer(instance: Object) {
    return this.Get(instance)?.container
  }

  private constructor(private instance: Object) {
    setTimeout(() => {
      if (!this.isInit) {
        console.warn('InstanceMeta Should init', instance)
      }
    })
  }

  private injections: Injection[] = []
  private addInjections(prototype: Object) {
    const injections = PrototypeMeta.GetInjections(prototype)
    this.injections.push(
      ...injections
    )
  }

  private isInit = false
  private isBind = false
  private container?: Container
  bindContainer(container: Container) {
    if (!this.container && !this.isBind) {
      this.container = container
      this.isBind = true
    } else {
      throw new Error('Container already exists')
    }
    return this
  }

  private children: InstanceMeta[] = []
  concat(child: InstanceMeta) {
    if (this.isInit) {
      child.init(this.container!, true)
    } else if (!child.isInit) {
      this.children.push(child)
    } else {
      console.warn('InstanceMeta already init', child)
    }
  }

  private beforeCallback: Array<(container: DiContainer) => void> = []
  beforeInit(callback: (container: DiContainer) => void) {
    if (this.isInit) {
      callback(this.container!)
    } else {
      this.beforeCallback.push(callback)
    }
  }

  init(targetContainer: Container, start = false) {
    if (this.isInit) {
      return console.warn('InstanceMeta already init', this)
    }
    this.isInit = true
    if (this.container && this.container !== targetContainer) {
      this.container.link(targetContainer)
    } else {
      this.container = targetContainer
    }
    const container = this.container
    this.beforeCallback.forEach(fn => fn(container))
    this.beforeCallback = []
    const metas = this.injections.map(injection => {
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
      return InstanceMeta.Get(value)
    }).filter(meta => meta?.isInit === false) as InstanceMeta[]

    this.children.unshift(...metas)
    this.children.forEach(meta => {
      meta.init(container)
    })
    this.readyCallback.forEach(fn => fn(container))
    this.readyCallback = []
    if (start) {
      this.afterInit()
    }
  }

  private readyCallback: Array<(container: DiContainer) => void> = []
  onReady(callback: (container: DiContainer) => void): void {
    if (this.isInit) {
      callback(this.container!)
    } else {
      this.readyCallback.push(callback)
    }
  }

  private afterInit() {
    this.afterReadyCallback.forEach(fn => fn())
    this.afterReadyCallback = []
    this.children.forEach(child => {
      child.afterInit()
    })
    this.children = []
  }

  private afterReadyCallback: Array<() => void> = []
  afterReady(callback: () => void) {
    if (this.isInit) {
      callback()
    } else {
      this.afterReadyCallback.push(callback)
    }
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
    if (this.isBind) {
      this.container?.destroy()
    }
  }
}