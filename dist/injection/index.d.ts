import "reflect-metadata";
import { Constructor } from "../util";
import Token from '../token';
declare type options = {
    key: string;
} & ({
    token?: any;
    type: Constructor;
} | {
    ref: () => any;
});
export default class Injection {
    private options;
    private static key;
    static Add(target: Object, options: options): void;
    static Get(target: Object): Injection[];
    private constructor();
    get key(): string;
    factory(): any;
    getToken(): Token;
}
export {};
