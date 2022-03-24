"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Token {
    constructor(value) {
        this.value = value;
    }
    static Create(value) {
        if (this.map.has(value)) {
            return this.map.get(value);
        }
        else {
            const token = new this(value);
            this.map.set(value, token);
            return token;
        }
    }
}
exports.default = Token;
Token.map = new Map();
