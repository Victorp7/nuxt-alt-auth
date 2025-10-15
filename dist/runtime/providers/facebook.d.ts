import type { ProviderPartialOptions, ProviderOptions } from '../../types';
import type { Oauth2SchemeOptions } from '..';
import type { Nuxt } from '@nuxt/schema';
export interface FacebookProviderOptions extends ProviderOptions, Oauth2SchemeOptions {
}
export declare function facebook(nuxt: Nuxt, strategy: ProviderPartialOptions<FacebookProviderOptions>): void;
