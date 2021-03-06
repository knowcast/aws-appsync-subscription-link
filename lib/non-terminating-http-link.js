"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.NonTerminatingHttpLink = void 0;
/*!
 * Copyright 2017-2018 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */
var http_1 = require("@apollo/client/link/http");
var non_terminating_link_1 = require("./non-terminating-link");
var NonTerminatingHttpLink = /** @class */ (function (_super) {
    __extends(NonTerminatingHttpLink, _super);
    function NonTerminatingHttpLink(contextKey, options) {
        var _this = this;
        var link = (0, http_1.createHttpLink)(options);
        _this = _super.call(this, contextKey, { link: link }) || this;
        return _this;
    }
    return NonTerminatingHttpLink;
}(non_terminating_link_1.NonTerminatingLink));
exports.NonTerminatingHttpLink = NonTerminatingHttpLink;
