import InstanceMeta from "../instance-meta"
import Token from "../token"

type options = {
  providers?: {
    token: any
    resolver: () => any
  }[]
}

export default class Container {
  private dataMap = new WeakMap<Token, any>()
  private resolverMap = new WeakMap<Token, () => any>()
  private dataSet = new Set<any>()
  private children = new Set<this>()
  private parent?: this

  constructor(options?: options) {
    options?.providers?.forEach(item => {
      this.register(item.token, item.resolver)
    })
  }

  link(parent: this) {
    parent.children.add(this)
    this.parent = parent
  }

  register<T>(key: any, resolver: () => T) {
    this.resolverMap.set(Token.Create(key), resolver)
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
    this.dataMap = null!
    this.resolverMap = null!
    this.parent = null!
    this.dataSet.clear()
    this.children.clear()
  }
}