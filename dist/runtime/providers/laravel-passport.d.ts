import type { ProviderPartialOptions, ProviderOptions } from '../../types';
import type { Oauth2SchemeOptions, RefreshSchemeOptions } from '..';
import type { Nuxt } from '@nuxt/schema';
export interface LaravelPassportProviderOptions extends ProviderOptions, Oauth2SchemeOptions {
    url: string;
}
export interface LaravelPassportPasswordProviderOptions extends ProviderOptions, RefreshSchemeOptions {
    url: string;
}
export type PartialPassportOptions = ProviderPartialOptions<LaravelPassportProviderOptions>;
export type PartialPassportPasswordOptions = ProviderPartialOptions<LaravelPassportPasswordProviderOptions>;
export declare function laravelPassport(nuxt: Nuxt, strategy: PartialPassportOptions | PartialPassportPasswordOptions): void;
