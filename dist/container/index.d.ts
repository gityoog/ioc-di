import Token from "../token";
declare type options = {
    providers?: {
        token: any;
        resolver: () => any;
    }[];
};
export default class Container {
    private dataMap;
    private resolverMap;
    private dataSet;
    private children;
    private parent?;
    constructor(options?: options);
    link(parent: this): void;
    register<T>(key: any, resolver: () => T): void;
    getData(token: Token): any;
    resolve(token: Token): any;
    factory(token: Token, resolver: () => any): any;
    setData<T>(token: Token, data: T): void;
    addData<T>(data: T): T;
    destroy(): void;
}
export {};
