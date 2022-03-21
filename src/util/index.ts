export type Constructor = new (...args: any[]) => any
export type AbstractConstructor = abstract new (...args: any[]) => any

export function isClass(value: unknown): value is Constructor {
  return typeof value === 'function' && value !== Object
}

export function isObject(value: unknown): value is Object {
  return value instanceof Object
}