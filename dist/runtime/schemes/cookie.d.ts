import type { SchemePartialOptions, SchemeCheck, TokenableScheme, HTTPRequest, HTTPResponse } from '../../types';
import type { Auth } from '..';
import { LocalScheme, type LocalSchemeEndpoints, type LocalSchemeOptions } from './local';
export interface CookieSchemeEndpoints extends LocalSchemeEndpoints {
    csrf?: HTTPRequest | false;
}
export interface CookieSchemeCookie {
    name: string;
}
export interface CookieSchemeOptions extends LocalSchemeOptions {
    url?: string;
    endpoints: CookieSchemeEndpoints;
    cookie: CookieSchemeCookie;
}
export declare class CookieScheme<OptionsT extends CookieSchemeOptions> extends LocalScheme<OptionsT> implements TokenableScheme<OptionsT> {
    checkStatus: boolean;
    constructor($auth: Auth, options: SchemePartialOptions<CookieSchemeOptions>);
    mounted(): Promise<HTTPResponse<any> | void>;
    check(): SchemeCheck;
    login(endpoint: HTTPRequest): Promise<HTTPResponse<any> | void>;
    fetchUser(endpoint?: HTTPRequest): Promise<HTTPResponse<any> | void>;
    reset(): void;
}
