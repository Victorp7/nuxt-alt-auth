import type { ProviderOptions, ProviderPartialOptions } from '../../types';
import type { Oauth2SchemeOptions } from '..';
import type { Nuxt } from '@nuxt/schema';
export interface GithubProviderOptions extends ProviderOptions, Oauth2SchemeOptions {
}
export declare function github(nuxt: Nuxt, strategy: ProviderPartialOptions<GithubProviderOptions>): void;
