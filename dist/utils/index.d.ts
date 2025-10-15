import type { RouteComponent, RouteLocationNormalized } from '#vue-router';
import type { RecursivePartial } from '../types';
import type { NuxtApp } from '#app';
import type { H3Event } from 'h3';
export declare const isUnset: (o: any) => boolean;
export declare const isSet: (o: any) => boolean;
export declare function parseQuery(queryString: string): Record<string, unknown>;
export declare function isRelativeURL(u: string): boolean | "" | 0;
export declare function routeMeta(route: RouteLocationNormalized, key: string, value: string | boolean): boolean;
export declare function getMatchedComponents(route: RouteLocationNormalized, matches?: unknown[]): RouteComponent[][];
export declare function normalizePath(path: string | undefined, ctx: NuxtApp): string;
export declare function encodeValue(val: any): string;
export declare function decodeValue(val: any): any;
/**
 * Get property defined by dot notation in string.
 * Based on  https://github.com/dy/dotprop (MIT)
 *
 * @param  { Object } holder   Target object where to look property up
 * @param  { string } propName Dot notation, like 'this.a.b.c'
 * @return { * } A property value
 */
export declare function getProp(holder: any, propName: string | false): any;
export declare function addTokenPrefix(token: string | boolean, tokenType: string | false): string | boolean;
export declare function removeTokenPrefix(token: string | boolean, tokenType: string | false): string | boolean;
export declare function cleanObj<T extends Record<string, any>>(obj: T): RecursivePartial<T>;
export declare function randomString(length: number): string;
export declare function setH3Cookie(event: H3Event, serializedCookie: string): void;
export declare const hasOwn: <O extends object, K extends PropertyKey>(object: O, key: K) => any;
