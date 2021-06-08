"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
var util_1 = require("../util");
var token_1 = require("../token");
var Injection = /** @class */ (function () {
    function Injection(options) {
        this.options = options;
    }
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
            if (util_1.isClass(this.options.token)) {
                constructor = this.options.token;
            }
            else {
                constructor = this.options.type;
            }
        }
        if (util_1.isClass(constructor)) {
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
            return token_1.default.Create(this.options.ref());
        }
        else {
            return token_1.default.Create((_a = this.options.token) !== null && _a !== void 0 ? _a : this.options.type);
        }
    };
    return Injection;
}());
exports.default = Injection;
