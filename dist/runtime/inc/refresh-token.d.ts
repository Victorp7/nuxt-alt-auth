import type { RefreshableScheme } from '../../types';
import type { Storage } from '../core';
import { TokenStatus } from './token-status';
export declare class RefreshToken {
    #private;
    scheme: RefreshableScheme;
    $storage: Storage;
    constructor(scheme: RefreshableScheme, storage: Storage);
    get(): string | boolean;
    set(tokenValue: string | boolean): string | boolean | void | null | undefined;
    sync(): string | boolean | void | null | undefined;
    reset(): void;
    status(): TokenStatus;
}
