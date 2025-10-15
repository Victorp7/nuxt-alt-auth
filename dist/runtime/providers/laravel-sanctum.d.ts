import type { ProviderPartialOptions, ProviderOptions } from '../../types';
import type { CookieSchemeOptions } from '..';
import type { Nuxt } from '@nuxt/schema';
export interface LaravelSanctumProviderOptions extends ProviderOptions, CookieSchemeOptions {
}
export declare function laravelSanctum(nuxt: Nuxt, strategy: ProviderPartialOptions<LaravelSanctumProviderOptions>): void;
