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
    constructor(options: options);
    get key(): string;
    factory(): any;
    getToken(): Token;
}
export {};
