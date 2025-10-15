/// <reference types="node" />
import type { RefreshableScheme, SchemePartialOptions, SchemeCheck, RefreshableSchemeOptions, UserOptions, SchemeOptions, HTTPResponse, EndpointsOption, TokenableSchemeOptions } from '../../types';
import type { IncomingMessage } from 'node:http';
import type { Auth } from '../core';
import { RefreshController, RequestHandler, Token, RefreshToken } from '../inc';
import { BaseScheme } from './base';
export interface Oauth2SchemeEndpoints extends EndpointsOption {
    authorization: string;
    token: string;
    userInfo: string;
    logout: string | false;
}
export interface Oauth2SchemeOptions extends SchemeOptions, TokenableSchemeOptions, RefreshableSchemeOptions {
    endpoints: Oauth2SchemeEndpoints;
    user: UserOptions;
    responseMode: 'query.jwt' | 'fragment.jwt' | 'form_post.jwt' | 'jwt' | '';
    responseType: 'code' | 'token' | 'id_token' | 'none' | string;
    grantType: 'implicit' | 'authorization_code' | 'client_credentials' | 'password' | 'refresh_token' | 'urn:ietf:params:oauth:grant-type:device_code';
    accessType: 'online' | 'offline';
    redirectUri: string;
    logoutRedirectUri: string;
    clientId: string;
    clientSecretTransport: 'body' | 'aurthorization_header';
    scope: string | string[];
    state: string;
    codeChallengeMethod: 'implicit' | 'S256' | 'plain' | '' | false;
    acrValues: string;
    audience: string;
    autoLogout: boolean;
    clientWindow: boolean;
    clientWindowWidth: number;
    clientWindowHeight: number;
    organization?: string;
}
export declare class Oauth2Scheme<OptionsT extends Oauth2SchemeOptions = Oauth2SchemeOptions> extends BaseScheme<OptionsT> implements RefreshableScheme {
    #private;
    req: IncomingMessage | undefined;
    token: Token;
    refreshToken: RefreshToken;
    refreshController: RefreshController;
    requestHandler: RequestHandler;
    constructor($auth: Auth, options: SchemePartialOptions<Oauth2SchemeOptions>, ...defaults: SchemePartialOptions<Oauth2SchemeOptions>[]);
    protected get scope(): string;
    protected get redirectURI(): string;
    protected get logoutRedirectURI(): string;
    check(checkStatus?: boolean): SchemeCheck;
    mounted(): Promise<HTTPResponse<any> | void>;
    reset(): void;
    login(options?: {
        state?: string;
        params?: any;
        nonce?: string;
    }): Promise<void>;
    clientWindowCallback(event: MessageEvent): void;
    clientWindowFeatures(clientWindowWidth: number, clientWindowHeight: number): string;
    logout(): void;
    fetchUser(): Promise<void>;
    refreshTokens(): Promise<HTTPResponse<any> | void>;
    protected updateTokens(response: HTTPResponse<any>): void;
    protected pkceChallengeFromVerifier(v: string, hashValue: boolean): Promise<string>;
    generateRandomString(): string;
}
