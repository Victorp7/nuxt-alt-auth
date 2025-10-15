import type { TokenableScheme, RefreshableScheme } from '../../types';
import type { Auth } from '..';
import { FetchInstance } from '@refactorjs/ofetch';
export declare class RequestHandler {
    #private;
    scheme: TokenableScheme | RefreshableScheme;
    auth: Auth;
    http: FetchInstance;
    requestInterceptor: number | null;
    responseErrorInterceptor: number | null;
    currentToken: string;
    constructor(scheme: TokenableScheme | RefreshableScheme, http: FetchInstance, auth: Auth);
    setHeader(token: string): void;
    clearHeader(): void;
    initializeRequestInterceptor(refreshEndpoint?: string | Request): void;
    reset(): void;
}
