"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Token = /** @class */ (function () {
    function Token(value) {
        this.value = value;
    }
    Token.Create = function (value) {
        if (this.map.has(value)) {
            return this.map.get(value);
        }
        else {
            var token = new this(value);
            this.map.set(value, token);
            return token;
        }
    };
    Token.map = new Map();
    return Token;
}());
exports.default = Token;
