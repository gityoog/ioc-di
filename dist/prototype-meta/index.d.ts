import Injection from '../injection';
export default class PrototypeMeta {
    private static key;
    static AddInjection(target: Object, options: ConstructorParameters<typeof Injection>[0]): void;
    static GetInjections(target: Object): Injection[];
    static AddDestroy(target: Object, fn: Function): void;
    static GetDestroys(target: Object): Function[];
}
