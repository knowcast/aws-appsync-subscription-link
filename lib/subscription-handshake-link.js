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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionHandshakeLink = exports.CONTROL_EVENTS_KEY = void 0;
/*!
 * Copyright 2017-2018 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */
var core_1 = require("@apollo/client/core");
var utils_1 = require("./utils");
var Paho = require("./vendor/paho-mqtt");
var utilities_1 = require("@apollo/client/utilities");
var logger = utils_1.rootLogger.extend('subscriptions');
var mqttLogger = logger.extend('mqtt');
exports.CONTROL_EVENTS_KEY = '@@controlEvents';
var SubscriptionHandshakeLink = /** @class */ (function (_super) {
    __extends(SubscriptionHandshakeLink, _super);
    function SubscriptionHandshakeLink(subsInfoContextKey) {
        var _this = _super.call(this) || this;
        _this.topicObservers = new Map();
        _this.clientObservers = new Map();
        _this.onMessage = function (topic, message, selectionNames) {
            var parsedMessage = JSON.parse(message);
            var observers = _this.topicObservers.get(topic);
            var data = selectionNames.reduce(function (acc, name) { return (acc[name] = acc[name] || null, acc); }, parsedMessage.data || {});
            logger('Message received', { data: data, topic: topic, observers: observers });
            observers.forEach(function (observer) {
                try {
                    observer.next(__assign(__assign({}, parsedMessage), { data: data }));
                }
                catch (err) {
                    logger(err);
                }
            });
        };
        _this.subsInfoContextKey = subsInfoContextKey;
        return _this;
    }
    SubscriptionHandshakeLink.prototype.request = function (operation) {
        var _a;
        var _this = this;
        var _b = operation.getContext(), _c = this.subsInfoContextKey, subsInfo = _b[_c], _d = _b.controlMessages, _e = _d === void 0 ? (_a = {}, _a[exports.CONTROL_EVENTS_KEY] = undefined, _a) : _d, _f = exports.CONTROL_EVENTS_KEY, controlEvents = _e[_f];
        var _g = subsInfo.extensions, _h = _g === void 0 ? { subscription: { newSubscriptions: {}, mqttConnections: [] } } : _g, _j = _h.subscription, newSubscriptions = _j.newSubscriptions, mqttConnections = _j.mqttConnections, _k = subsInfo.errors, errors = _k === void 0 ? [] : _k;
        if (errors && errors.length) {
            return new core_1.Observable(function (observer) {
                observer.error(new core_1.ApolloError({
                    errorMessage: 'Error during subscription handshake',
                    extraInfo: { errors: errors },
                    graphQLErrors: errors
                }));
                return function () { };
            });
        }
        var newSubscriptionTopics = Object.keys(newSubscriptions).map(function (subKey) { return newSubscriptions[subKey].topic; });
        var existingTopicsWithObserver = new Set(newSubscriptionTopics.filter(function (t) { return _this.topicObservers.has(t); }));
        var newTopics = new Set(newSubscriptionTopics.filter(function (t) { return !existingTopicsWithObserver.has(t); }));
        return new core_1.Observable(function (observer) {
            existingTopicsWithObserver.forEach(function (t) {
                _this.topicObservers.get(t).add(observer);
                var anObserver = Array.from(_this.topicObservers.get(t)).find(function () { return true; });
                var clientId = Array.from(_this.clientObservers).find(function (_a) {
                    var observers = _a[1].observers;
                    return observers.has(anObserver);
                })[0];
                _this.clientObservers.get(clientId).observers.add(observer);
            });
            var newTopicsConnectionInfo = mqttConnections
                .filter(function (c) { return c.topics.some(function (t) { return newTopics.has(t); }); })
                .map(function (_a) {
                var topics = _a.topics, rest = __rest(_a, ["topics"]);
                return (__assign(__assign({}, rest), { topics: topics.filter(function (t) { return newTopics.has(t); }) }));
            });
            _this.connectNewClients(newTopicsConnectionInfo, observer, operation);
            return function () {
                var clientsForCurrentObserver = Array.from(_this.clientObservers).filter(function (_a) {
                    var observers = _a[1].observers;
                    return observers.has(observer);
                });
                clientsForCurrentObserver.forEach(function (_a) {
                    var clientId = _a[0];
                    return _this.clientObservers.get(clientId).observers.delete(observer);
                });
                _this.clientObservers.forEach(function (_a) {
                    var observers = _a.observers, client = _a.client;
                    if (observers.size === 0) {
                        if (client.isConnected()) {
                            client.disconnect();
                        }
                        _this.clientObservers.delete(client.clientId);
                    }
                });
                _this.clientObservers = new Map(Array.from(_this.clientObservers).filter(function (_a) {
                    var observers = _a[1].observers;
                    return observers.size > 0;
                }));
                _this.topicObservers.forEach(function (observers) { return observers.delete(observer); });
                _this.topicObservers = new Map(Array.from(_this.topicObservers)
                    .filter(function (_a) {
                    var observers = _a[1];
                    return observers.size > 0;
                }));
            };
        }).filter(function (data) {
            var _a = data.extensions, _b = _a === void 0 ? {} : _a, _c = _b.controlMsgType, controlMsgType = _c === void 0 ? undefined : _c;
            var isControlMsg = typeof controlMsgType !== 'undefined';
            return controlEvents === true || !isControlMsg;
        });
    };
    SubscriptionHandshakeLink.prototype.connectNewClients = function (connectionInfo, observer, operation) {
        return __awaiter(this, void 0, void 0, function () {
            var query, selectionNames, result, data;
            var _this = this;
            return __generator(this, function (_a) {
                query = operation.query;
                selectionNames = (0, utilities_1.getMainDefinition)(query).selectionSet.selections.map(function (_a) {
                    var value = _a.name.value;
                    return value;
                });
                result = Promise.all(connectionInfo.map(function (c) { return _this.connectNewClient(c, observer, selectionNames); }));
                data = selectionNames.reduce(function (acc, name) { return (acc[name] = acc[name] || null, acc); }, {});
                observer.next({
                    data: data,
                    extensions: {
                        controlMsgType: 'CONNECTED',
                        controlMsgInfo: {
                            connectionInfo: connectionInfo,
                        },
                    }
                });
                return [2 /*return*/, result];
            });
        });
    };
    ;
    SubscriptionHandshakeLink.prototype.connectNewClient = function (connectionInfo, observer, selectionNames) {
        return __awaiter(this, void 0, void 0, function () {
            var clientId, url, topics, client;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        clientId = connectionInfo.client, url = connectionInfo.url, topics = connectionInfo.topics;
                        client = new Paho.Client(url, clientId);
                        client.trace = mqttLogger.bind(null, clientId);
                        client.onConnectionLost = function (_a) {
                            var errorCode = _a.errorCode, args = __rest(_a, ["errorCode"]);
                            if (errorCode !== 0) {
                                topics.forEach(function (t) {
                                    if (_this.topicObservers.has(t)) {
                                        _this.topicObservers.get(t).forEach(function (observer) { return observer.error(__assign(__assign({}, args), { permanent: true })); });
                                    }
                                });
                            }
                            topics.forEach(function (t) { return _this.topicObservers.delete(t); });
                        };
                        client.onMessageArrived = function (_a) {
                            var destinationName = _a.destinationName, payloadString = _a.payloadString;
                            return _this.onMessage(destinationName, payloadString, selectionNames);
                        };
                        return [4 /*yield*/, new Promise(function (resolve, reject) {
                                client.connect({
                                    useSSL: url.indexOf('wss://') === 0,
                                    mqttVersion: 3,
                                    onSuccess: function () { return resolve(client); },
                                    onFailure: reject,
                                });
                            })];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.subscribeToTopics(client, topics, observer)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, client];
                }
            });
        });
    };
    SubscriptionHandshakeLink.prototype.subscribeToTopics = function (client, topics, observer) {
        var _this = this;
        return Promise.all(topics.map(function (topic) { return _this.subscribeToTopic(client, topic, observer); }));
    };
    SubscriptionHandshakeLink.prototype.subscribeToTopic = function (client, topic, observer) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            client.subscribe(topic, {
                onSuccess: function () {
                    if (!_this.topicObservers.has(topic)) {
                        _this.topicObservers.set(topic, new Set());
                    }
                    if (!_this.clientObservers.has(client.clientId)) {
                        _this.clientObservers.set(client.clientId, { client: client, observers: new Set() });
                    }
                    _this.topicObservers.get(topic).add(observer);
                    _this.clientObservers.get(client.clientId).observers.add(observer);
                    resolve(topic);
                },
                onFailure: reject,
            });
        });
    };
    return SubscriptionHandshakeLink;
}(core_1.ApolloLink));
exports.SubscriptionHandshakeLink = SubscriptionHandshakeLink;
