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
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppSyncRealTimeSubscriptionHandshakeLink = exports.CONTROL_EVENTS_KEY = void 0;
/*!
 * Copyright 2017-2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */
var core_1 = require("@apollo/client/core");
var utils_1 = require("./utils");
var aws_appsync_auth_link_1 = require("aws-appsync-auth-link");
var graphql_1 = require("graphql");
var url = require("url");
var uuid_1 = require("uuid");
var types_1 = require("./types");
var retry_1 = require("./utils/retry");
var logger = utils_1.rootLogger.extend("subscriptions");
exports.CONTROL_EVENTS_KEY = "@@controlEvents";
var NON_RETRYABLE_CODES = [400, 401, 403];
var SERVICE = "appsync";
var APPSYNC_REALTIME_HEADERS = {
    accept: 'application/json, text/javascript',
    'content-encoding': 'amz-1.0',
    'content-type': 'application/json; charset=UTF-8'
};
/**
 * Time in milliseconds to wait for GQL_CONNECTION_INIT message
 */
var CONNECTION_INIT_TIMEOUT = 15000;
/**
 * Time in milliseconds to wait for GQL_START_ACK message
 */
var START_ACK_TIMEOUT = 15000;
/**
 * Default Time in milliseconds to wait for GQL_CONNECTION_KEEP_ALIVE message
 */
var DEFAULT_KEEP_ALIVE_TIMEOUT = 5 * 60 * 1000;
var AppSyncRealTimeSubscriptionHandshakeLink = /** @class */ (function (_super) {
    __extends(AppSyncRealTimeSubscriptionHandshakeLink, _super);
    function AppSyncRealTimeSubscriptionHandshakeLink(_a) {
        var theUrl = _a.url, theRegion = _a.region, theAuth = _a.auth;
        var _this = _super.call(this) || this;
        _this.socketStatus = types_1.SOCKET_STATUS.CLOSED;
        _this.keepAliveTimeout = DEFAULT_KEEP_ALIVE_TIMEOUT;
        _this.subscriptionObserverMap = new Map();
        _this.promiseArray = [];
        _this.url = theUrl;
        _this.region = theRegion;
        _this.auth = theAuth;
        return _this;
    }
    AppSyncRealTimeSubscriptionHandshakeLink.prototype.request = function (operation) {
        var _a;
        var _this = this;
        var query = operation.query, variables = operation.variables;
        var _b = operation.getContext(), _c = _b.controlMessages, _d = _c === void 0 ? (_a = {},
            _a[exports.CONTROL_EVENTS_KEY] = undefined,
            _a) : _c, _e = exports.CONTROL_EVENTS_KEY, controlEvents = _d[_e], headers = _b.headers;
        return new core_1.Observable(function (observer) {
            if (!_this.url) {
                observer.error({
                    errors: [
                        __assign({}, new graphql_1.GraphQLError("Subscribe only available for AWS AppSync endpoint")),
                    ],
                });
                observer.complete();
            }
            else {
                var subscriptionId_1 = (0, uuid_1.v4)();
                var token = _this.auth.type === aws_appsync_auth_link_1.AUTH_TYPE.AMAZON_COGNITO_USER_POOLS ||
                    _this.auth.type === aws_appsync_auth_link_1.AUTH_TYPE.OPENID_CONNECT
                    ? _this.auth.jwtToken
                    : null;
                token = _this.auth.type === aws_appsync_auth_link_1.AUTH_TYPE.AWS_LAMBDA ? _this.auth.token : token;
                var options = {
                    appSyncGraphqlEndpoint: _this.url,
                    authenticationType: _this.auth.type,
                    query: (0, graphql_1.print)(query),
                    region: _this.region,
                    graphql_headers: function () { return (headers); },
                    variables: variables,
                    apiKey: _this.auth.type === aws_appsync_auth_link_1.AUTH_TYPE.API_KEY ? _this.auth.apiKey : "",
                    credentials: _this.auth.type === aws_appsync_auth_link_1.AUTH_TYPE.AWS_IAM ? _this.auth.credentials : null,
                    token: token
                };
                _this._startSubscriptionWithAWSAppSyncRealTime({
                    options: options,
                    observer: observer,
                    subscriptionId: subscriptionId_1
                });
                return function () { return __awaiter(_this, void 0, void 0, function () {
                    var subscriptionState;
                    return __generator(this, function (_a) {
                        // Cleanup after unsubscribing or observer.complete was called after _startSubscriptionWithAWSAppSyncRealTime
                        try {
                            this._verifySubscriptionAlreadyStarted(subscriptionId_1);
                            subscriptionState = this.subscriptionObserverMap.get(subscriptionId_1).subscriptionState;
                            if (subscriptionState === types_1.SUBSCRIPTION_STATUS.CONNECTED) {
                                this._sendUnsubscriptionMessage(subscriptionId_1);
                            }
                            else {
                                throw new Error("Subscription has failed, starting to remove subscription.");
                            }
                        }
                        catch (err) {
                            this._removeSubscriptionObserver(subscriptionId_1);
                            return [2 /*return*/];
                        }
                        return [2 /*return*/];
                    });
                }); };
            }
        }).filter(function (data) {
            var _a = data.extensions, _b = _a === void 0 ? {} : _a, _c = _b.controlMsgType, controlMsgType = _c === void 0 ? undefined : _c;
            var isControlMsg = typeof controlMsgType !== "undefined";
            return controlEvents === true || !isControlMsg;
        });
    };
    AppSyncRealTimeSubscriptionHandshakeLink.prototype._verifySubscriptionAlreadyStarted = function (subscriptionId) {
        return __awaiter(this, void 0, void 0, function () {
            var subscriptionState;
            var _this = this;
            return __generator(this, function (_a) {
                subscriptionState = this.subscriptionObserverMap.get(subscriptionId).subscriptionState;
                // This in case unsubscribe is invoked before sending start subscription message
                if (subscriptionState === types_1.SUBSCRIPTION_STATUS.PENDING) {
                    return [2 /*return*/, new Promise(function (res, rej) {
                            var _a = _this.subscriptionObserverMap.get(subscriptionId), observer = _a.observer, subscriptionState = _a.subscriptionState, variables = _a.variables, query = _a.query;
                            _this.subscriptionObserverMap.set(subscriptionId, {
                                observer: observer,
                                subscriptionState: subscriptionState,
                                variables: variables,
                                query: query,
                                subscriptionReadyCallback: res,
                                subscriptionFailedCallback: rej
                            });
                        })];
                }
                return [2 /*return*/];
            });
        });
    };
    AppSyncRealTimeSubscriptionHandshakeLink.prototype._sendUnsubscriptionMessage = function (subscriptionId) {
        try {
            if (this.awsRealTimeSocket &&
                this.awsRealTimeSocket.readyState === WebSocket.OPEN &&
                this.socketStatus === types_1.SOCKET_STATUS.READY) {
                // Preparing unsubscribe message to stop receiving messages for that subscription
                var unsubscribeMessage = {
                    id: subscriptionId,
                    type: types_1.MESSAGE_TYPES.GQL_STOP
                };
                var stringToAWSRealTime = JSON.stringify(unsubscribeMessage);
                this.awsRealTimeSocket.send(stringToAWSRealTime);
                this._removeSubscriptionObserver(subscriptionId);
            }
        }
        catch (err) {
            // If GQL_STOP is not sent because of disconnection issue, then there is nothing the client can do
            logger({ err: err });
        }
    };
    AppSyncRealTimeSubscriptionHandshakeLink.prototype._removeSubscriptionObserver = function (subscriptionId) {
        this.subscriptionObserverMap.delete(subscriptionId);
        if (this.subscriptionObserverMap.size === 0) {
            // Socket could be sending data to unsubscribe so is required to wait until is flushed
            this._closeSocketWhenFlushed();
        }
    };
    AppSyncRealTimeSubscriptionHandshakeLink.prototype._closeSocketWhenFlushed = function () {
        logger("closing WebSocket...");
        clearTimeout(this.keepAliveTimeoutId);
        if (!this.awsRealTimeSocket) {
            this.socketStatus = types_1.SOCKET_STATUS.CLOSED;
            return;
        }
        if (this.awsRealTimeSocket.bufferedAmount > 0) {
            setTimeout(this._closeSocketWhenFlushed.bind(this), 1000);
        }
        else {
            var tempSocket = this.awsRealTimeSocket;
            tempSocket.close(1000);
            this.awsRealTimeSocket = null;
            this.socketStatus = types_1.SOCKET_STATUS.CLOSED;
        }
    };
    AppSyncRealTimeSubscriptionHandshakeLink.prototype._startSubscriptionWithAWSAppSyncRealTime = function (_a) {
        var options = _a.options, observer = _a.observer, subscriptionId = _a.subscriptionId;
        return __awaiter(this, void 0, void 0, function () {
            var appSyncGraphqlEndpoint, authenticationType, query, variables, apiKey, region, _b, graphql_headers, credentials, token, subscriptionState, data, dataString, headerObj, _c, _d, subscriptionMessage, stringToAWSRealTime, err_1, _e, message, subscriptionFailedCallback_1, _f, subscriptionFailedCallback, subscriptionReadyCallback;
            var _g;
            var _this = this;
            return __generator(this, function (_h) {
                switch (_h.label) {
                    case 0:
                        appSyncGraphqlEndpoint = options.appSyncGraphqlEndpoint, authenticationType = options.authenticationType, query = options.query, variables = options.variables, apiKey = options.apiKey, region = options.region, _b = options.graphql_headers, graphql_headers = _b === void 0 ? function () { return ({}); } : _b, credentials = options.credentials, token = options.token;
                        subscriptionState = types_1.SUBSCRIPTION_STATUS.PENDING;
                        data = {
                            query: query,
                            variables: variables
                        };
                        // Having a subscription id map will make it simple to forward messages received
                        this.subscriptionObserverMap.set(subscriptionId, {
                            observer: observer,
                            query: query,
                            variables: variables,
                            subscriptionState: subscriptionState,
                            startAckTimeoutId: null,
                        });
                        dataString = JSON.stringify(data);
                        _c = [{}];
                        return [4 /*yield*/, this._awsRealTimeHeaderBasedAuth({
                                apiKey: apiKey,
                                appSyncGraphqlEndpoint: appSyncGraphqlEndpoint,
                                authenticationType: authenticationType,
                                payload: dataString,
                                canonicalUri: "",
                                region: region,
                                credentials: credentials,
                                token: token
                            })];
                    case 1:
                        _d = [__assign.apply(void 0, _c.concat([(_h.sent())]))];
                        return [4 /*yield*/, graphql_headers()];
                    case 2:
                        headerObj = __assign.apply(void 0, [__assign.apply(void 0, _d.concat([(_h.sent())])), (_g = {}, _g[aws_appsync_auth_link_1.USER_AGENT_HEADER] = aws_appsync_auth_link_1.USER_AGENT, _g)]);
                        subscriptionMessage = {
                            id: subscriptionId,
                            payload: {
                                data: dataString,
                                extensions: {
                                    authorization: __assign({}, headerObj)
                                }
                            },
                            type: types_1.MESSAGE_TYPES.GQL_START
                        };
                        stringToAWSRealTime = JSON.stringify(subscriptionMessage);
                        _h.label = 3;
                    case 3:
                        _h.trys.push([3, 5, , 6]);
                        return [4 /*yield*/, this._initializeWebSocketConnection({
                                apiKey: apiKey,
                                appSyncGraphqlEndpoint: appSyncGraphqlEndpoint,
                                authenticationType: authenticationType,
                                region: region,
                                credentials: credentials,
                                token: token
                            })];
                    case 4:
                        _h.sent();
                        return [3 /*break*/, 6];
                    case 5:
                        err_1 = _h.sent();
                        _e = err_1.message, message = _e === void 0 ? "" : _e;
                        observer.error({
                            errors: [
                                __assign({}, new graphql_1.GraphQLError("Connection failed: " + message))
                            ]
                        });
                        observer.complete();
                        subscriptionFailedCallback_1 = (this.subscriptionObserverMap.get(subscriptionId) || {}).subscriptionFailedCallback;
                        // Notify concurrent unsubscription
                        if (typeof subscriptionFailedCallback_1 === "function") {
                            subscriptionFailedCallback_1();
                        }
                        return [2 /*return*/];
                    case 6:
                        _f = this.subscriptionObserverMap.get(subscriptionId), subscriptionFailedCallback = _f.subscriptionFailedCallback, subscriptionReadyCallback = _f.subscriptionReadyCallback;
                        // This must be done before sending the message in order to be listening immediately
                        this.subscriptionObserverMap.set(subscriptionId, {
                            observer: observer,
                            subscriptionState: subscriptionState,
                            variables: variables,
                            query: query,
                            subscriptionReadyCallback: subscriptionReadyCallback,
                            subscriptionFailedCallback: subscriptionFailedCallback,
                            startAckTimeoutId: setTimeout(function () {
                                _this._timeoutStartSubscriptionAck.call(_this, subscriptionId);
                            }, START_ACK_TIMEOUT)
                        });
                        if (this.awsRealTimeSocket) {
                            this.awsRealTimeSocket.send(stringToAWSRealTime);
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    AppSyncRealTimeSubscriptionHandshakeLink.prototype._initializeWebSocketConnection = function (_a) {
        var _this = this;
        var appSyncGraphqlEndpoint = _a.appSyncGraphqlEndpoint, authenticationType = _a.authenticationType, apiKey = _a.apiKey, region = _a.region, credentials = _a.credentials, token = _a.token;
        if (this.socketStatus === types_1.SOCKET_STATUS.READY) {
            return;
        }
        return new Promise(function (res, rej) { return __awaiter(_this, void 0, void 0, function () {
            var discoverableEndpoint, payloadString, headerString, _a, _b, headerQs, payloadQs, awsRealTimeUrl, err_2;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        this.promiseArray.push({ res: res, rej: rej });
                        if (!(this.socketStatus === types_1.SOCKET_STATUS.CLOSED)) return [3 /*break*/, 5];
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 4, , 5]);
                        this.socketStatus = types_1.SOCKET_STATUS.CONNECTING;
                        discoverableEndpoint = AppSyncRealTimeSubscriptionHandshakeLink._discoverAppSyncRealTimeEndpoint(this.url);
                        payloadString = "{}";
                        _b = (_a = JSON).stringify;
                        return [4 /*yield*/, this._awsRealTimeHeaderBasedAuth({
                                authenticationType: authenticationType,
                                payload: payloadString,
                                canonicalUri: "/connect",
                                apiKey: apiKey,
                                appSyncGraphqlEndpoint: appSyncGraphqlEndpoint,
                                region: region,
                                credentials: credentials,
                                token: token
                            })];
                    case 2:
                        headerString = _b.apply(_a, [_c.sent()]);
                        headerQs = Buffer.from(headerString).toString("base64");
                        payloadQs = Buffer.from(payloadString).toString("base64");
                        awsRealTimeUrl = discoverableEndpoint + "?header=" + headerQs + "&payload=" + payloadQs;
                        return [4 /*yield*/, this._initializeRetryableHandshake({ awsRealTimeUrl: awsRealTimeUrl })];
                    case 3:
                        _c.sent();
                        this.promiseArray.forEach(function (_a) {
                            var res = _a.res;
                            logger("Notifying connection successful");
                            res();
                        });
                        this.socketStatus = types_1.SOCKET_STATUS.READY;
                        this.promiseArray = [];
                        return [3 /*break*/, 5];
                    case 4:
                        err_2 = _c.sent();
                        this.promiseArray.forEach(function (_a) {
                            var rej = _a.rej;
                            return rej(err_2);
                        });
                        this.promiseArray = [];
                        if (this.awsRealTimeSocket &&
                            this.awsRealTimeSocket.readyState === WebSocket.OPEN) {
                            this.awsRealTimeSocket.close(3001);
                        }
                        this.awsRealTimeSocket = null;
                        this.socketStatus = types_1.SOCKET_STATUS.CLOSED;
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        }); });
    };
    AppSyncRealTimeSubscriptionHandshakeLink.prototype._awsRealTimeHeaderBasedAuth = function (_a) {
        var authenticationType = _a.authenticationType, payload = _a.payload, canonicalUri = _a.canonicalUri, appSyncGraphqlEndpoint = _a.appSyncGraphqlEndpoint, apiKey = _a.apiKey, region = _a.region, credentials = _a.credentials, token = _a.token;
        return __awaiter(this, void 0, void 0, function () {
            var headerHandler, handler, host, result;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        headerHandler = {
                            API_KEY: this._awsRealTimeApiKeyHeader.bind(this),
                            AWS_IAM: this._awsRealTimeIAMHeader.bind(this),
                            OPENID_CONNECT: this._awsRealTimeAuthorizationHeader.bind(this),
                            AMAZON_COGNITO_USER_POOLS: this._awsRealTimeAuthorizationHeader.bind(this),
                            AWS_LAMBDA: this._awsRealTimeAuthorizationHeader.bind(this)
                        };
                        handler = headerHandler[authenticationType];
                        if (typeof handler !== "function") {
                            logger("Authentication type " + authenticationType + " not supported");
                            return [2 /*return*/, {}];
                        }
                        host = url.parse(appSyncGraphqlEndpoint).host;
                        return [4 /*yield*/, handler({
                                payload: payload,
                                canonicalUri: canonicalUri,
                                appSyncGraphqlEndpoint: appSyncGraphqlEndpoint,
                                apiKey: apiKey,
                                region: region,
                                host: host,
                                credentials: credentials,
                                token: token
                            })];
                    case 1:
                        result = _b.sent();
                        return [2 /*return*/, result];
                }
            });
        });
    };
    AppSyncRealTimeSubscriptionHandshakeLink.prototype._awsRealTimeAuthorizationHeader = function (_a) {
        var host = _a.host, token = _a.token;
        return __awaiter(this, void 0, void 0, function () {
            var _b;
            var _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _c = {};
                        if (!(typeof token === "function")) return [3 /*break*/, 2];
                        return [4 /*yield*/, token.call(undefined)];
                    case 1:
                        _b = _d.sent();
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, token];
                    case 3:
                        _b = _d.sent();
                        _d.label = 4;
                    case 4: return [2 /*return*/, (_c.Authorization = _b,
                            _c.host = host,
                            _c)];
                }
            });
        });
    };
    AppSyncRealTimeSubscriptionHandshakeLink.prototype._awsRealTimeApiKeyHeader = function (_a) {
        var apiKey = _a.apiKey, host = _a.host;
        return __awaiter(this, void 0, void 0, function () {
            var dt, dtStr;
            return __generator(this, function (_b) {
                dt = new Date();
                dtStr = dt.toISOString().replace(/[:\-]|\.\d{3}/g, "");
                return [2 /*return*/, {
                        host: host,
                        "x-amz-date": dtStr,
                        "x-api-key": apiKey
                    }];
            });
        });
    };
    AppSyncRealTimeSubscriptionHandshakeLink.prototype._awsRealTimeIAMHeader = function (_a) {
        var payload = _a.payload, canonicalUri = _a.canonicalUri, appSyncGraphqlEndpoint = _a.appSyncGraphqlEndpoint, region = _a.region, credentials = _a.credentials;
        return __awaiter(this, void 0, void 0, function () {
            var endpointInfo, creds, _b, accessKeyId, secretAccessKey, sessionToken, formattedCredentials, request, signed_params;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        endpointInfo = {
                            region: region,
                            service: SERVICE
                        };
                        creds = typeof credentials === "function"
                            ? credentials.call()
                            : credentials || {};
                        if (!(creds && typeof creds.getPromise === "function")) return [3 /*break*/, 2];
                        return [4 /*yield*/, creds.getPromise()];
                    case 1:
                        _c.sent();
                        _c.label = 2;
                    case 2:
                        if (!creds) {
                            throw new Error("No credentials");
                        }
                        return [4 /*yield*/, creds];
                    case 3:
                        _b = _c.sent(), accessKeyId = _b.accessKeyId, secretAccessKey = _b.secretAccessKey, sessionToken = _b.sessionToken;
                        formattedCredentials = {
                            access_key: accessKeyId,
                            secret_key: secretAccessKey,
                            session_token: sessionToken
                        };
                        request = {
                            url: "" + appSyncGraphqlEndpoint + canonicalUri,
                            body: payload,
                            method: "POST",
                            headers: __assign({}, APPSYNC_REALTIME_HEADERS)
                        };
                        signed_params = aws_appsync_auth_link_1.Signer.sign(request, formattedCredentials, endpointInfo);
                        return [2 /*return*/, signed_params.headers];
                }
            });
        });
    };
    AppSyncRealTimeSubscriptionHandshakeLink.prototype._initializeRetryableHandshake = function (_a) {
        var awsRealTimeUrl = _a.awsRealTimeUrl;
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        logger("Initializaling retryable Handshake");
                        return [4 /*yield*/, (0, retry_1.jitteredExponentialRetry)(this._initializeHandshake.bind(this), [
                                { awsRealTimeUrl: awsRealTimeUrl }
                            ])];
                    case 1:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    AppSyncRealTimeSubscriptionHandshakeLink.prototype._initializeHandshake = function (_a) {
        var awsRealTimeUrl = _a.awsRealTimeUrl;
        return __awaiter(this, void 0, void 0, function () {
            var err_3, errorType, errorCode;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        logger("Initializing handshake " + awsRealTimeUrl);
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, (function () {
                                return new Promise(function (res, rej) {
                                    var newSocket = AppSyncRealTimeSubscriptionHandshakeLink.createWebSocket(awsRealTimeUrl, "graphql-ws");
                                    newSocket.onerror = function () {
                                        logger("WebSocket connection error");
                                    };
                                    newSocket.onclose = function () {
                                        rej(new Error("Connection handshake error"));
                                    };
                                    newSocket.onopen = function () {
                                        _this.awsRealTimeSocket = newSocket;
                                        return res();
                                    };
                                });
                            })()];
                    case 2:
                        _b.sent();
                        // Step 2: wait for ack from AWS AppSyncReaTime after sending init
                        return [4 /*yield*/, (function () {
                                return new Promise(function (res, rej) {
                                    var ackOk = false;
                                    _this.awsRealTimeSocket.onerror = function (error) {
                                        logger("WebSocket closed " + JSON.stringify(error));
                                    };
                                    _this.awsRealTimeSocket.onclose = function (event) {
                                        logger("WebSocket closed " + event.reason);
                                        rej(new Error(JSON.stringify(event)));
                                    };
                                    _this.awsRealTimeSocket.onmessage = function (message) {
                                        logger("subscription message from AWS AppSyncRealTime: " + message.data + " ");
                                        var data = JSON.parse(message.data);
                                        var type = data.type, _a = data.payload, _b = _a === void 0 ? {} : _a, _c = _b.connectionTimeoutMs, connectionTimeoutMs = _c === void 0 ? DEFAULT_KEEP_ALIVE_TIMEOUT : _c;
                                        if (type === types_1.MESSAGE_TYPES.GQL_CONNECTION_ACK) {
                                            ackOk = true;
                                            _this.keepAliveTimeout = connectionTimeoutMs;
                                            _this.awsRealTimeSocket.onmessage = _this._handleIncomingSubscriptionMessage.bind(_this);
                                            _this.awsRealTimeSocket.onerror = function (err) {
                                                logger(err);
                                                _this._errorDisconnect(types_1.CONTROL_MSG.CONNECTION_CLOSED);
                                            };
                                            _this.awsRealTimeSocket.onclose = function (event) {
                                                logger("WebSocket closed " + event.reason);
                                                _this._errorDisconnect(types_1.CONTROL_MSG.CONNECTION_CLOSED);
                                            };
                                            res("Cool, connected to AWS AppSyncRealTime");
                                            return;
                                        }
                                        if (type === types_1.MESSAGE_TYPES.GQL_CONNECTION_ERROR) {
                                            var _d = data.payload, _e = _d === void 0 ? {} : _d, _f = _e.errors, _g = _f === void 0 ? [] : _f, _h = _g[0], _j = _h === void 0 ? {} : _h, _k = _j.errorType, errorType = _k === void 0 ? "" : _k, _l = _j.errorCode, errorCode = _l === void 0 ? 0 : _l;
                                            rej({ errorType: errorType, errorCode: errorCode });
                                        }
                                    };
                                    var gqlInit = {
                                        type: types_1.MESSAGE_TYPES.GQL_CONNECTION_INIT
                                    };
                                    _this.awsRealTimeSocket.send(JSON.stringify(gqlInit));
                                    function checkAckOk() {
                                        if (!ackOk) {
                                            rej(new Error("Connection timeout: ack from AWSRealTime was not received on " + CONNECTION_INIT_TIMEOUT + " ms"));
                                        }
                                    }
                                    setTimeout(checkAckOk.bind(_this), CONNECTION_INIT_TIMEOUT);
                                });
                            })()];
                    case 3:
                        // Step 2: wait for ack from AWS AppSyncReaTime after sending init
                        _b.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        err_3 = _b.sent();
                        errorType = err_3.errorType, errorCode = err_3.errorCode;
                        if (NON_RETRYABLE_CODES.indexOf(errorCode) >= 0) {
                            throw new retry_1.NonRetryableError(errorType);
                        }
                        else if (errorType) {
                            throw new Error(errorType);
                        }
                        else {
                            throw err_3;
                        }
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    AppSyncRealTimeSubscriptionHandshakeLink.prototype._handleIncomingSubscriptionMessage = function (message) {
        logger("subscription message from AWS AppSync RealTime: " + message.data);
        var _a = JSON.parse(message.data), _b = _a.id, id = _b === void 0 ? "" : _b, payload = _a.payload, type = _a.type;
        var _c = this.subscriptionObserverMap.get(id) || {}, _d = _c.observer, observer = _d === void 0 ? null : _d, _e = _c.query, query = _e === void 0 ? "" : _e, _f = _c.variables, variables = _f === void 0 ? {} : _f, _g = _c.startAckTimeoutId, startAckTimeoutId = _g === void 0 ? 0 : _g, _h = _c.subscriptionReadyCallback, subscriptionReadyCallback = _h === void 0 ? null : _h, _j = _c.subscriptionFailedCallback, subscriptionFailedCallback = _j === void 0 ? null : _j;
        logger({ id: id, observer: observer, query: query, variables: variables });
        if (type === types_1.MESSAGE_TYPES.GQL_DATA && payload && payload.data) {
            if (observer) {
                observer.next(payload);
            }
            else {
                logger("observer not found for id: " + id);
            }
            return;
        }
        if (type === types_1.MESSAGE_TYPES.GQL_START_ACK) {
            logger("subscription ready for " + JSON.stringify({ query: query, variables: variables }));
            if (typeof subscriptionReadyCallback === "function") {
                subscriptionReadyCallback();
            }
            clearTimeout(startAckTimeoutId);
            if (observer) {
                observer.next({
                    data: payload,
                    extensions: {
                        controlMsgType: "CONNECTED"
                    }
                });
            }
            else {
                logger("observer not found for id: " + id);
            }
            var subscriptionState = types_1.SUBSCRIPTION_STATUS.CONNECTED;
            this.subscriptionObserverMap.set(id, {
                observer: observer,
                query: query,
                variables: variables,
                startAckTimeoutId: null,
                subscriptionState: subscriptionState,
                subscriptionReadyCallback: subscriptionReadyCallback,
                subscriptionFailedCallback: subscriptionFailedCallback
            });
            return;
        }
        if (type === types_1.MESSAGE_TYPES.GQL_CONNECTION_KEEP_ALIVE) {
            clearTimeout(this.keepAliveTimeoutId);
            this.keepAliveTimeoutId = setTimeout(this._errorDisconnect.bind(this, types_1.CONTROL_MSG.TIMEOUT_DISCONNECT), this.keepAliveTimeout);
            return;
        }
        if (type === types_1.MESSAGE_TYPES.GQL_ERROR) {
            var subscriptionState = types_1.SUBSCRIPTION_STATUS.FAILED;
            this.subscriptionObserverMap.set(id, {
                observer: observer,
                query: query,
                variables: variables,
                startAckTimeoutId: startAckTimeoutId,
                subscriptionReadyCallback: subscriptionReadyCallback,
                subscriptionFailedCallback: subscriptionFailedCallback,
                subscriptionState: subscriptionState
            });
            observer.error({
                errors: [
                    __assign({}, new graphql_1.GraphQLError("Connection failed: " + JSON.stringify(payload)))
                ]
            });
            clearTimeout(startAckTimeoutId);
            observer.complete();
            if (typeof subscriptionFailedCallback === "function") {
                subscriptionFailedCallback();
            }
        }
    };
    AppSyncRealTimeSubscriptionHandshakeLink.prototype._errorDisconnect = function (msg) {
        logger("Disconnect error: " + msg);
        // TODO: Should we ERROR even if the connection was closed?
        this.subscriptionObserverMap.forEach(function (_a) {
            var observer = _a.observer;
            if (observer && !observer.closed) {
                observer.error({
                    errors: [__assign({}, new graphql_1.GraphQLError(msg))],
                });
            }
        });
        this.subscriptionObserverMap.clear();
        if (this.awsRealTimeSocket) {
            this.awsRealTimeSocket.close();
        }
        this.socketStatus = types_1.SOCKET_STATUS.CLOSED;
    };
    AppSyncRealTimeSubscriptionHandshakeLink.prototype._timeoutStartSubscriptionAck = function (subscriptionId) {
        var _a = this.subscriptionObserverMap.get(subscriptionId) || {}, observer = _a.observer, query = _a.query, variables = _a.variables;
        if (!observer) {
            return;
        }
        this.subscriptionObserverMap.set(subscriptionId, {
            observer: observer,
            query: query,
            variables: variables,
            subscriptionState: types_1.SUBSCRIPTION_STATUS.FAILED
        });
        if (observer && !observer.closed) {
            observer.error({
                errors: [
                    __assign({}, new graphql_1.GraphQLError("Subscription timeout " + JSON.stringify({ query: query, variables: variables })))
                ]
            });
            // Cleanup will be automatically executed
            observer.complete();
        }
        logger("timeoutStartSubscription", JSON.stringify({ query: query, variables: variables }));
    };
    AppSyncRealTimeSubscriptionHandshakeLink.createWebSocket = function (awsRealTimeUrl, protocol) {
        return new WebSocket(awsRealTimeUrl, protocol);
    };
    AppSyncRealTimeSubscriptionHandshakeLink._discoverAppSyncRealTimeEndpoint = function (url) {
        return url
            .replace("https://", "wss://")
            .replace('http://', 'ws://')
            .replace("appsync-api", "appsync-realtime-api")
            .replace("gogi-beta", "grt-beta");
    };
    return AppSyncRealTimeSubscriptionHandshakeLink;
}(core_1.ApolloLink));
exports.AppSyncRealTimeSubscriptionHandshakeLink = AppSyncRealTimeSubscriptionHandshakeLink;
