import Token from "../token";
export default class Container {
    dataMap: WeakMap<Token, any>;
    resolverMap: WeakMap<Token, () => any>;
    dataSet: Set<any>;
    parent?: this;
    link(parent: this): void;
    children: Set<this>;
    register<T>(key: any, resolver: () => T): void;
    constructor(options?: {
        token: any;
        resolver: () => any;
    }[]);
    getData(token: Token): any;
    resolve(token: Token): any;
    factory(token: Token): any;
    setData<T>(token: Token, data: T): void;
    addData<T>(data: T): T;
    destroy(): void;
}
