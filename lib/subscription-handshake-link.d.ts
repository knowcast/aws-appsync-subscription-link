/// <reference types="zen-observable" />
/*!
 * Copyright 2017-2018 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */
import { ApolloLink, Observable, Operation, FetchResult } from "@apollo/client/core";
declare type MqttConnectionInfo = {
    client: string;
    url: string;
    topics: string[];
};
export declare const CONTROL_EVENTS_KEY = "@@controlEvents";
export declare class SubscriptionHandshakeLink extends ApolloLink {
    private subsInfoContextKey;
    private topicObservers;
    private clientObservers;
    constructor(subsInfoContextKey: any);
    request(operation: Operation): Observable<unknown>;
    connectNewClients(connectionInfo: MqttConnectionInfo[], observer: ZenObservable.Observer<FetchResult>, operation: Operation): Promise<any[]>;
    connectNewClient(connectionInfo: MqttConnectionInfo, observer: ZenObservable.Observer<FetchResult>, selectionNames: string[]): Promise<any>;
    subscribeToTopics<T>(client: any, topics: string[], observer: ZenObservable.Observer<T>): Promise<unknown[]>;
    subscribeToTopic<T>(client: any, topic: string, observer: ZenObservable.Observer<T>): Promise<unknown>;
    onMessage: (topic: string, message: string, selectionNames: string[]) => void;
}
export {};
