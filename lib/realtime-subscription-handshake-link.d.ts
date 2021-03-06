/// <reference types="zen-observable" />
/*!
 * Copyright 2017-2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */
import { ApolloLink, Observable, Operation, FetchResult } from "@apollo/client/core";
import { UrlInfo } from "./types";
export declare const CONTROL_EVENTS_KEY = "@@controlEvents";
export declare class AppSyncRealTimeSubscriptionHandshakeLink extends ApolloLink {
    private url;
    private region;
    private auth;
    private awsRealTimeSocket;
    private socketStatus;
    private keepAliveTimeoutId;
    private keepAliveTimeout;
    private subscriptionObserverMap;
    private promiseArray;
    constructor({ url: theUrl, region: theRegion, auth: theAuth }: UrlInfo);
    request(operation: Operation): Observable<FetchResult<{
        [key: string]: any;
    }, Record<string, any>, Record<string, any>>>;
    private _verifySubscriptionAlreadyStarted;
    private _sendUnsubscriptionMessage;
    private _removeSubscriptionObserver;
    private _closeSocketWhenFlushed;
    private _startSubscriptionWithAWSAppSyncRealTime;
    private _initializeWebSocketConnection;
    private _awsRealTimeHeaderBasedAuth;
    private _awsRealTimeAuthorizationHeader;
    private _awsRealTimeApiKeyHeader;
    private _awsRealTimeIAMHeader;
    private _initializeRetryableHandshake;
    private _initializeHandshake;
    private _handleIncomingSubscriptionMessage;
    private _errorDisconnect;
    private _timeoutStartSubscriptionAck;
    static createWebSocket(awsRealTimeUrl: string, protocol: string): WebSocket;
    private static _discoverAppSyncRealTimeEndpoint;
}
