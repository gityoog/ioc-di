import Container from "../container";
export default class InstanceMeta {
    private instance;
    static map: WeakMap<Object, InstanceMeta>;
    static Init(instance: Object, prototype: Object): void;
    static Get(instance: Object): InstanceMeta | undefined;
    static Get(instance: Object, create: true): InstanceMeta;
    private constructor();
    private injections;
    addInjections(prototype: Object): void;
    private isInit;
    private readyCallback;
    onReady(callback: () => void, index?: 0 | 1): void;
    addInstance(instance: Object): void;
    container?: Container;
    setContainer(container: Container): void;
    init(targetContainer: Container): void;
}
