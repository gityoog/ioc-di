import Token from "../token"

export default class Container {
  dataMap = new WeakMap<Token, any>()
  resolverMap = new WeakMap<Token, () => any>()

  parent?: this
  link(parent: this) {
    this.parent = parent
  }

  register<T>(token: Token, resolver: () => T) {
    this.resolverMap.set(token, resolver)
  }

  constructor(options?: {
    token: any
    resolver: () => any
  }[]) {
    options?.forEach(item => {
      this.register(Token.Create(item.token), item.resolver)
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

  factory(token: Token) {
    const data = this.getData(token)
    if (data !== undefined) {
      return data
    }
    const value = this.resolve(token)
    if (value !== undefined) {
      this.setData(token, value)
      return value
    }
  }

  setData<T>(token: Token, data: T) {
    if (!this.dataMap.has(token)) {
      this.dataMap.set(token, data)
    } else {
      if (this.dataMap.get(token) !== data) {
        throw new Error('Different values ​​in the container')
      }
    }
  }
}