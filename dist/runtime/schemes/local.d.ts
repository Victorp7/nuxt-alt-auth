import type { EndpointsOption, SchemePartialOptions, TokenableSchemeOptions, TokenableScheme, UserOptions, HTTPRequest, HTTPResponse, SchemeCheck } from '../../types';
import type { Auth } from '..';
import { Token, RequestHandler } from '../inc';
import { BaseScheme } from './base';
export interface LocalSchemeEndpoints extends EndpointsOption {
    login: HTTPRequest;
    logout: HTTPRequest | false;
    user: HTTPRequest | false;
}
export interface LocalSchemeOptions extends TokenableSchemeOptions {
    endpoints: LocalSchemeEndpoints;
    user: UserOptions;
    clientId: string;
    grantType: 'implicit' | 'authorization_code' | 'client_credentials' | 'password' | 'refresh_token' | 'urn:ietf:params:oauth:grant-type:device_code';
    scope: string | string[];
}
export declare class LocalScheme<OptionsT extends LocalSchemeOptions = LocalSchemeOptions> extends BaseScheme<OptionsT> implements TokenableScheme<OptionsT> {
    token: Token;
    requestHandler: RequestHandler;
    constructor($auth: Auth, options: SchemePartialOptions<LocalSchemeOptions>, ...defaults: SchemePartialOptions<LocalSchemeOptions>[]);
    check(checkStatus?: boolean): SchemeCheck;
    mounted({ tokenCallback, refreshTokenCallback }?: {
        tokenCallback?: (() => void) | undefined;
        refreshTokenCallback?: (() => undefined) | undefined;
    }): Promise<HTTPResponse<any> | void>;
    login(endpoint: HTTPRequest, { reset }?: {
        reset?: boolean | undefined;
    }): Promise<HTTPResponse<any> | void>;
    setUserToken(token: string): Promise<HTTPResponse<any> | void>;
    fetchUser(endpoint?: HTTPRequest): Promise<HTTPResponse<any> | void>;
    logout(endpoint?: HTTPRequest): Promise<void>;
    reset({ resetInterceptor }?: {
        resetInterceptor?: boolean | undefined;
    }): void;
    protected extractToken(response: HTTPResponse<any>): string;
    protected updateTokens(response: HTTPResponse<any>): void;
    protected initializeRequestInterceptor(): void;
}
