import Token from "../token";
var Container = /** @class */ (function () {
    function Container(options) {
        var _this = this;
        this.dataMap = new WeakMap();
        this.resolverMap = new WeakMap();
        options === null || options === void 0 ? void 0 : options.forEach(function (item) {
            _this.register(Token.Create(item.token), item.resolver);
        });
    }
    Container.prototype.link = function (parent) {
        this.parent = parent;
    };
    Container.prototype.register = function (token, resolver) {
        this.resolverMap.set(token, resolver);
    };
    Container.prototype.getData = function (token) {
        var _a;
        if (this.dataMap.has(token)) {
            return this.dataMap.get(token);
        }
        else {
            return (_a = this.parent) === null || _a === void 0 ? void 0 : _a.getData(token);
        }
    };
    Container.prototype.resolve = function (token) {
        var _a;
        if (this.resolverMap.has(token)) {
            return this.resolverMap.get(token)();
        }
        else {
            return (_a = this.parent) === null || _a === void 0 ? void 0 : _a.resolve(token);
        }
    };
    Container.prototype.factory = function (token) {
        var data = this.getData(token);
        if (data !== undefined) {
            return data;
        }
        var value = this.resolve(token);
        if (value !== undefined) {
            this.setData(token, value);
            return value;
        }
    };
    Container.prototype.setData = function (token, data) {
        if (!this.dataMap.has(token)) {
            this.dataMap.set(token, data);
        }
        else {
            if (this.dataMap.get(token) !== data) {
                throw new Error('Different values ​​in the container');
            }
        }
    };
    return Container;
}());
export default Container;
