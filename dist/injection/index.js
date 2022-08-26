"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const util_1 = require("../util");
const token_1 = require("../token");
class Injection {
    constructor(options) {
        this.options = options;
    }
    get key() {
        return this.options.key;
    }
    factory() {
        let constructor;
        if ('ref' in this.options) {
            constructor = this.options.ref();
        }
        else {
            if ((0, util_1.isClass)(this.options.token)) {
                constructor = this.options.token;
            }
            else {
                constructor = this.options.type;
            }
        }
        if ((0, util_1.isClass)(constructor)) {
            return new constructor;
        }
        else {
            console.log(this);
            throw new Error('Injection does not have constructor');
        }
    }
    getToken() {
        var _a, _b;
        if ('ref' in this.options) {
            return token_1.default.Create(this.options.ref());
        }
        else {
            return token_1.default.Create((_b = (_a = this.options.token) !== null && _a !== void 0 ? _a : this.options.type) !== null && _b !== void 0 ? _b : {});
        }
    }
}
exports.default = Injection;
