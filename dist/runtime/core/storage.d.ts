import type { ModuleOptions, AuthStore, AuthState, StoreIncludeOptions } from '../../types';
import type { NuxtApp } from '#app';
import { type CookieSerializeOptions } from 'cookie-es';
import { type Ref } from 'vue';
/**
 * @class Storage
 * @classdesc Storage class for stores and cookies
 * @param { NuxtApp } ctx - Nuxt app context
 * @param { ModuleOptions } options - Module options
 */
export declare class Storage {
    #private;
    ctx: NuxtApp;
    options: ModuleOptions;
    state: AuthState;
    memory: AuthState;
    constructor(ctx: NuxtApp, options: ModuleOptions);
    setUniversal<V extends any>(key: string, value: V, include?: StoreIncludeOptions): V | void;
    getUniversal(key: string): any;
    syncUniversal(key: string, defaultValue?: any, include?: StoreIncludeOptions): any;
    removeUniversal(key: string): void;
    get pinia(): AuthStore;
    get store(): Ref<AuthState, AuthState>;
    setState(key: string, value: any): unknown;
    getState(key: string): unknown;
    watchState(watchKey: string, fn: (value: any) => void): void;
    removeState(key: string): void;
    setLocalStorage<V extends any>(key: string, value: V): V | void;
    getLocalStorage(key: string): any;
    removeLocalStorage(key: string): void;
    isLocalStorageEnabled(): boolean;
    setSessionStorage<V extends any>(key: string, value: V): V | void;
    getSessionStorage(key: string): any;
    removeSessionStorage(key: string): void;
    isSessionStorageEnabled(): boolean;
    setCookie<V extends any>(key: string, value: V, options?: CookieSerializeOptions): void;
    getCookies(): Record<string, any> | void;
    getCookie(key: string): string | null | undefined;
    removeCookie(key: string, options?: CookieSerializeOptions): void;
    isCookiesEnabled(): boolean;
}
