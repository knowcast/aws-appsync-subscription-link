"use strict";
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
exports.createSubscriptionHandshakeLink = exports.CONTROL_EVENTS_KEY = void 0;
var subscription_handshake_link_1 = require("./subscription-handshake-link");
Object.defineProperty(exports, "CONTROL_EVENTS_KEY", { enumerable: true, get: function () { return subscription_handshake_link_1.CONTROL_EVENTS_KEY; } });
var core_1 = require("@apollo/client/core");
var http_1 = require("@apollo/client/link/http");
var utilities_1 = require("@apollo/client/utilities");
var non_terminating_link_1 = require("./non-terminating-link");
var realtime_subscription_handshake_link_1 = require("./realtime-subscription-handshake-link");
function createSubscriptionHandshakeLink(infoOrUrl, theResultsFetcherLink) {
    var resultsFetcherLink, subscriptionLinks;
    if (typeof infoOrUrl === "string") {
        resultsFetcherLink =
            theResultsFetcherLink || (0, http_1.createHttpLink)({ uri: infoOrUrl });
        subscriptionLinks = core_1.ApolloLink.from([
            new non_terminating_link_1.NonTerminatingLink("controlMessages", {
                link: new core_1.ApolloLink(function (operation, _forward) {
                    return new core_1.Observable(function (observer) {
                        var _a;
                        var _b = operation, _c = _b.variables, _d = subscription_handshake_link_1.CONTROL_EVENTS_KEY, controlEvents = _c[_d], variables = __rest(_c, [typeof _d === "symbol" ? _d : _d + ""]);
                        if (typeof controlEvents !== "undefined") {
                            operation.variables = variables;
                        }
                        observer.next((_a = {}, _a[subscription_handshake_link_1.CONTROL_EVENTS_KEY] = controlEvents, _a));
                        return function () { };
                    });
                })
            }),
            new non_terminating_link_1.NonTerminatingLink("subsInfo", { link: resultsFetcherLink }),
            new subscription_handshake_link_1.SubscriptionHandshakeLink("subsInfo")
        ]);
    }
    else {
        var url = infoOrUrl.url;
        resultsFetcherLink = theResultsFetcherLink || (0, http_1.createHttpLink)({ uri: url });
        subscriptionLinks = new realtime_subscription_handshake_link_1.AppSyncRealTimeSubscriptionHandshakeLink(infoOrUrl);
    }
    return core_1.ApolloLink.split(function (operation) {
        var query = operation.query;
        var _a = (0, utilities_1.getMainDefinition)(query), kind = _a.kind, graphqlOperation = _a.operation;
        var isSubscription = kind === "OperationDefinition" && graphqlOperation === "subscription";
        return isSubscription;
    }, subscriptionLinks, resultsFetcherLink);
}
exports.createSubscriptionHandshakeLink = createSubscriptionHandshakeLink;
