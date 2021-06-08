import Injection from '../injection'

export default class PrototypeMeta {
  private static key = {
    injection: Symbol(''),
    destroy: Symbol('')
  }
  static AddInjection(target: Object, options: ConstructorParameters<typeof Injection>[0]) {
    Reflect.defineMetadata(
      this.key.injection,
      this.GetInjections(target).concat(
        new Injection(options)
      ),
      target
    )
  }
  static GetInjections(target: Object): Injection[] {
    return Reflect.getMetadata(this.key.injection, target) || []
  }

  static AddDestroy(target: Object, fn: Function) {
    Reflect.defineMetadata(
      this.key.destroy,
      this.GetDestroys(target).concat(fn),
      target
    )
  }

  static GetDestroys(target: Object): Function[] {
    return Reflect.getMetadata(this.key.destroy, target) || []
  }
}