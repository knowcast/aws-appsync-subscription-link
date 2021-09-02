"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var debug_1 = require("debug");
var debugLogger = (0, debug_1.default)('aws-appsync');
var extend = function (category) {
    if (category === void 0) { category = ''; }
    var newCategory = category ? __spreadArray(__spreadArray([], this.namespace.split(':'), true), [category], false).join(':') : this.namespace;
    var result = (0, debug_1.default)(newCategory);
    result.extend = extend.bind(result);
    return result;
};
debugLogger.extend = extend.bind(debugLogger);
exports.default = debugLogger;
