import type { ProviderPartialOptions, ProviderOptions } from '../../types';
import type { RefreshSchemeOptions } from '..';
import type { Nuxt } from '@nuxt/schema';
export interface LaravelJWTProviderOptions extends ProviderOptions, RefreshSchemeOptions {
    url: string;
}
export declare function laravelJWT(nuxt: Nuxt, strategy: ProviderPartialOptions<LaravelJWTProviderOptions>): void;
