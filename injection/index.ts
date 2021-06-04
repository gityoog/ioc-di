import "reflect-metadata"
import { Constructor, isClass } from "../util"
import Token from '../token'

type options = {
  key: string
} &
  ({
    token?: any
    type: Constructor
  } | {
    ref: () => any
  })

export default class Injection {
  private static key = Symbol('')
  static Add(target: Object, options: options) {
    Reflect.defineMetadata(
      this.key,
      this.Get(target).concat(
        new this(options)
      ),
      target
    )
  }
  static Get(target: Object): Injection[] {
    return Reflect.getMetadata(this.key, target) || []
  }

  private constructor(private options: options) { }

  get key() {
    return this.options.key
  }

  factory() {
    let constructor: Constructor
    if ('ref' in this.options) {
      constructor = this.options.ref()
    } else {
      if (isClass(this.options.token)) {
        constructor = this.options.token
      } else {
        constructor = this.options.type!
      }
    }
    if (isClass(constructor)) {
      return new constructor
    } else {
      console.log(this)
      throw new Error('Injection does not have constructor')
    }
  }

  getToken() {
    if ('ref' in this.options) {
      return Token.Create(this.options.ref())
    } else {
      return Token.Create(this.options.token ?? this.options.type)
    }
  }
}