import type { ProviderPartialOptions, ProviderOptions } from '../../types';
import type { Oauth2SchemeOptions } from '..';
import type { Nuxt } from '@nuxt/schema';
export interface GoogleProviderOptions extends ProviderOptions, Oauth2SchemeOptions {
}
export declare function google(nuxt: Nuxt, strategy: ProviderPartialOptions<GoogleProviderOptions>): void;
