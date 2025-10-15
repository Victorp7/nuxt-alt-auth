import type { ProviderOptions, ProviderPartialOptions } from '../../types';
import type { Oauth2SchemeOptions } from '..';
import type { Nuxt } from '@nuxt/schema';
export interface DiscordProviderOptions extends ProviderOptions, Oauth2SchemeOptions {
}
export declare function discord(nuxt: Nuxt, strategy: ProviderPartialOptions<DiscordProviderOptions>): void;
