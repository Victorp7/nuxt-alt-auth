import type { HTTPRequest, HTTPResponse, Scheme, SchemeCheck, TokenableScheme, RefreshableScheme, ModuleOptions, Route, AuthState } from '../../types';
import type { NuxtApp } from '#app';
import { Storage } from './storage';
export type ErrorListener = (...args: any[]) => void;
export type RedirectListener = (to: string, from: string) => string;
export declare class Auth {
    #private;
    ctx: NuxtApp;
    options: ModuleOptions;
    strategies: Record<string, Scheme>;
    $storage: Storage;
    $state: AuthState;
    error?: Error;
    constructor(ctx: NuxtApp, options: ModuleOptions);
    getStrategy(throwException?: boolean): Scheme;
    get tokenStrategy(): TokenableScheme;
    get refreshStrategy(): RefreshableScheme;
    get strategy(): Scheme;
    get user(): AuthState['user'];
    get loggedIn(): boolean;
    get busy(): boolean;
    init(): Promise<void>;
    registerStrategy(name: string, strategy: Scheme): void;
    setStrategy(name: string): Promise<HTTPResponse<any> | void>;
    mounted(...args: any[]): Promise<HTTPResponse<any> | void>;
    loginWith(name: string, ...args: any[]): Promise<HTTPResponse<any> | void>;
    login(...args: any[]): Promise<HTTPResponse<any> | void>;
    fetchUser(...args: any[]): Promise<HTTPResponse<any> | void>;
    logout(...args: any[]): Promise<void>;
    setUserToken(token: string | boolean, refreshToken?: string | boolean): Promise<HTTPResponse<any> | void>;
    reset(...args: any[]): void;
    refreshTokens(): Promise<HTTPResponse<any> | void>;
    check(...args: any[]): SchemeCheck;
    fetchUserOnce(...args: any[]): Promise<HTTPResponse<any> | void>;
    setUser(user: AuthState | false, schemeCheck?: boolean): void;
    request(endpoint: HTTPRequest, defaults?: HTTPRequest): Promise<HTTPResponse<any>>;
    requestWith(endpoint?: HTTPRequest, defaults?: HTTPRequest): Promise<HTTPResponse<any>>;
    wrapLogin(promise: Promise<HTTPResponse<any> | void>): Promise<HTTPResponse<any> | void>;
    onError(listener: ErrorListener): void;
    callOnError(error: Error, payload?: {}): void;
    /**
     *
     * @param name redirect name
     * @param route (default: false) Internal useRoute() (false) or manually specify
     * @param router (default: true) Whether to use nuxt redirect (true) or window redirect (false)
     *
     * @returns
     */
    redirect(name: string, route?: Route | false, router?: boolean): any;
    onRedirect(listener: RedirectListener): void;
    callOnRedirect(to: string, from: string): string;
    hasScope(scope: string): boolean;
}
