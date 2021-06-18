import Container from "../container";
import DiContainer from '../container';
export default class InstanceMeta {
    private instance;
    static map: WeakMap<Object, InstanceMeta>;
    static Init(instance: Object, prototype: Object): void;
    static Get(instance: Object): InstanceMeta | undefined;
    static Get(instance: Object, create: true): InstanceMeta;
    private constructor();
    private injections;
    addInjections(prototype: Object): void;
    private destroys;
    addDestroyKeys(prototype: Object): void;
    private isDestroyed;
    destroy(): void;
    private isInit;
    private readyCallback;
    onReady(callback: (container: DiContainer) => void): void;
    afterReady(callback: (container: DiContainer) => void): void;
    private myContainer?;
    container?: Container;
    bindContainer(container: Container): this;
    init(targetContainer: Container): void;
}
