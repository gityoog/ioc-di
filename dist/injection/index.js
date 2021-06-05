import "reflect-metadata";
import { isClass } from "../util";
import Token from '../token';
var Injection = /** @class */ (function () {
    function Injection(options) {
        this.options = options;
    }
    Injection.Add = function (target, options) {
        Reflect.defineMetadata(this.key, this.Get(target).concat(new this(options)), target);
    };
    Injection.Get = function (target) {
        return Reflect.getMetadata(this.key, target) || [];
    };
    Object.defineProperty(Injection.prototype, "key", {
        get: function () {
            return this.options.key;
        },
        enumerable: false,
        configurable: true
    });
    Injection.prototype.factory = function () {
        var constructor;
        if ('ref' in this.options) {
            constructor = this.options.ref();
        }
        else {
            if (isClass(this.options.token)) {
                constructor = this.options.token;
            }
            else {
                constructor = this.options.type;
            }
        }
        if (isClass(constructor)) {
            return new constructor;
        }
        else {
            console.log(this);
            throw new Error('Injection does not have constructor');
        }
    };
    Injection.prototype.getToken = function () {
        var _a;
        if ('ref' in this.options) {
            return Token.Create(this.options.ref());
        }
        else {
            return Token.Create((_a = this.options.token) !== null && _a !== void 0 ? _a : this.options.type);
        }
    };
    Injection.key = Symbol('');
    return Injection;
}());
export default Injection;
