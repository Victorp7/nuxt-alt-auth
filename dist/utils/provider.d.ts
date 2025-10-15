import type { Oauth2SchemeOptions, RefreshSchemeOptions } from '../runtime';
import type { StrategyOptions, TokenableSchemeOptions } from '../types';
import type { Nuxt } from '@nuxt/schema';
export declare function assignDefaults<SOptions extends StrategyOptions>(strategy: SOptions, defaults: SOptions): void;
export declare function addAuthorize<SOptions extends StrategyOptions<Oauth2SchemeOptions>>(nuxt: Nuxt, strategy: SOptions, useForms?: boolean): void;
export declare function addLocalAuthorize<SOptions extends StrategyOptions<RefreshSchemeOptions>>(nuxt: Nuxt, strategy: SOptions): void;
export declare function initializePasswordGrantFlow<SOptions extends StrategyOptions<RefreshSchemeOptions>>(nuxt: Nuxt, strategy: SOptions): void;
export declare function assignAbsoluteEndpoints<SOptions extends StrategyOptions<(TokenableSchemeOptions | RefreshSchemeOptions) & {
    url: string;
}>>(strategy: SOptions): void;
export declare function authorizeGrant(opt: any): string;
export declare function localAuthorizeGrant(opt: any): string;
export declare function passwordGrant(opt: any): string;
