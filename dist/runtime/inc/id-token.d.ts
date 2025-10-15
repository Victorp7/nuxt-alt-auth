import type { IdTokenableScheme } from '../../types';
import type { Storage } from '../core';
import { TokenStatus } from './token-status';
export declare class IdToken {
    #private;
    scheme: IdTokenableScheme;
    $storage: Storage;
    constructor(scheme: IdTokenableScheme, storage: Storage);
    get(): string | boolean;
    set(tokenValue: string | boolean): string | boolean;
    sync(): string | boolean | void | null | undefined;
    reset(): void;
    status(): TokenStatus;
    userInfo(): import("../../types").UserInfo | undefined;
}
