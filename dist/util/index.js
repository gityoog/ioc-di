export function isClass(value) {
    return typeof value === 'function' && value !== Object;
}
export function isObject(value) {
    return value instanceof Object;
}
