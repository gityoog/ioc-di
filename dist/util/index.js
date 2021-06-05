"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isObject = exports.isClass = void 0;
function isClass(value) {
    return typeof value === 'function' && value !== Object;
}
exports.isClass = isClass;
function isObject(value) {
    return value instanceof Object;
}
exports.isObject = isObject;
