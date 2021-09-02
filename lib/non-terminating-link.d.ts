/// <reference types="zen-observable" />
/*!
 * Copyright 2017-2018 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */
import { ApolloLink, NextLink } from '@apollo/client/core';
export declare class NonTerminatingLink extends ApolloLink {
    private contextKey;
    private link;
    constructor(contextKey: string, { link }: {
        link: ApolloLink;
    });
    request(operation: any, forward?: NextLink): import("zen-observable")<import("@apollo/client/core").FetchResult<{
        [key: string]: any;
    }, Record<string, any>, Record<string, any>>>;
}
