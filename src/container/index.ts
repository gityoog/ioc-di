import InstanceMeta from "../instance-meta"
import Token from "../token"

type options = {
  providers?: {
    token: any
    resolver: () => any
  }[]
}

export default class Container {
  dataMap = new WeakMap<Token, any>()
  resolverMap = new WeakMap<Token, () => any>()
  dataSet = new Set<any>()
  parent?: this
  link(parent: this) {
    parent.children.add(this)
    this.parent = parent
  }

  children = new Set<this>()

  register<T>(key: any, resolver: () => T) {
    this.resolverMap.set(Token.Create(key), resolver)
  }

  constructor(options?: options) {
    options?.providers?.forEach(item => {
      this.register(item.token, item.resolver)
    })
  }

  getData(token: Token): any {
    if (this.dataMap.has(token)) {
      return this.dataMap.get(token)!
    } else {
      return this.parent?.getData(token)
    }
  }

  resolve(token: Token): any {
    if (this.resolverMap.has(token)) {
      return this.resolverMap.get(token)!()
    } else {
      return this.parent?.resolve(token)
    }
  }

  factory(token: Token, resolver: () => any) {
    const data = this.getData(token)
    if (data !== undefined) {
      return data
    }
    const value = this.resolve(token) || resolver()
    if (value !== undefined) {
      this.setData(token, value)
      return value
    }
  }

  setData<T>(token: Token, data: T) {
    if (!this.dataMap.has(token)) {
      this.dataMap.set(token, data)
      this.addData(data)
    } else {
      if (this.dataMap.get(token) !== data) {
        throw new Error('Different values ​​in the container')
      }
    }
  }

  addData<T>(data: T) {
    this.dataSet.add(data)
    return data
  }

  destroy() {
    this.children.forEach(container => {
      container.destroy()
    })
    this.dataSet.forEach(data => {
      InstanceMeta.Get(data)?.destroy()
    })
    this.parent = null!
    this.dataSet.clear()
    this.children.clear()
  }
}