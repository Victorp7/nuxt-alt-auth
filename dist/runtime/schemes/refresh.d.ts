import type { HTTPRequest, HTTPResponse, RefreshableScheme, RefreshableSchemeOptions, SchemeCheck, SchemePartialOptions } from '../../types';
import type { Auth } from '..';
import { RefreshController, RefreshToken } from '../inc';
import { LocalScheme, type LocalSchemeEndpoints, type LocalSchemeOptions } from './local';
export interface RefreshSchemeEndpoints extends LocalSchemeEndpoints {
    refresh: HTTPRequest;
}
export interface RefreshSchemeOptions extends LocalSchemeOptions, RefreshableSchemeOptions {
    endpoints: RefreshSchemeEndpoints;
    autoLogout: boolean;
}
export declare class RefreshScheme<OptionsT extends RefreshSchemeOptions = RefreshSchemeOptions> extends LocalScheme<OptionsT> implements RefreshableScheme<OptionsT> {
    refreshToken: RefreshToken;
    refreshController: RefreshController;
    constructor($auth: Auth, options: SchemePartialOptions<RefreshSchemeOptions>);
    check(checkStatus?: boolean): SchemeCheck;
    mounted(): Promise<HTTPResponse<any> | void>;
    refreshTokens(): Promise<HTTPResponse<any> | void>;
    setUserToken(token: string | boolean, refreshToken?: string | boolean): Promise<HTTPResponse<any> | void>;
    reset({ resetInterceptor }?: {
        resetInterceptor?: boolean | undefined;
    }): void;
    protected extractRefreshToken(response: HTTPResponse<any>): string;
    protected updateTokens(response: HTTPResponse<any>): void;
    protected initializeRequestInterceptor(): void;
}
