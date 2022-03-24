import "reflect-metadata";
import { AbstractConstructor } from "./util";
import DiContainer from './container';
/** 注入属性
 * - `@Inject(token?) prop: Type`
 */
export declare function Inject(token?: any): <T extends Object>(prototype: T, key: string) => void;
/** 注入属性(循环引用)
 * - `@InjectRef(() => token) prop: Type`
 */
export declare function InjectRef(ref: () => any): <T extends Object>(prototype: T, key: string) => void;
/**
 * 标记当前类需要容器初始化
 *
 * `@Service()`
 *
 * `class Target {}`
 */
export declare function Service(): <T extends AbstractConstructor>(target: T) => T;
/**
 * 当容器初始化完成后才运行
 *
 * `@Already`
 *
 * `method(){
 * }`
 */
export declare function Already<T extends object>(target: T, propertyKey: string, descriptor: PropertyDescriptor): void;
/**
 * 使目标类实例使用当前实例的容器
 *
 * `Concat(this, new Class)`
 */
export declare function Concat<T extends Object>(target: Object, instance: T, token?: any): T;
/**
 * 从当前类开始自动初始化容器
 *
 * `@Root(options?)`
 *
 * `class Target { }`
 *
 */
export declare function Root(...options: ConstructorParameters<typeof DiContainer>): <T extends AbstractConstructor>(target: T) => T;
/**
 * 为当前类添加一个子容器
 *
 * `@Container(options?)`
 *
 * `class Target { }`
 *
 */
export declare function Container(...options: ConstructorParameters<typeof DiContainer>): <T extends AbstractConstructor>(target: T) => T;
export declare function GetContainer(instance: Object): DiContainer | undefined;
export declare function Destroy<T extends object>(prototype: T, propertyKey: string, descriptor: PropertyDescriptor): void;
