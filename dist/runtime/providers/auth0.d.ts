import type { ProviderOptions, ProviderPartialOptions } from '../../types';
import type { Oauth2SchemeOptions } from '..';
import type { Nuxt } from '@nuxt/schema';
export interface Auth0ProviderOptions extends ProviderOptions, Oauth2SchemeOptions {
    domain: string;
}
export declare function auth0(nuxt: Nuxt, strategy: ProviderPartialOptions<Auth0ProviderOptions>): void;
