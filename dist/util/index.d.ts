export declare type Constructor = new (...args: any[]) => any;
export declare type AbstractConstructor = abstract new (...args: any[]) => any;
export declare function isClass(value: unknown): value is Constructor;
export declare function isObject(value: unknown): value is Object;
