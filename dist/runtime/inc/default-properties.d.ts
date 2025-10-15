export declare const OAUTH2DEFAULTS: {
    accessType: undefined;
    redirectUri: undefined;
    logoutRedirectUri: undefined;
    clientId: undefined;
    clientSecretTransport: string;
    audience: undefined;
    grantType: undefined;
    responseMode: undefined;
    acrValues: undefined;
    autoLogout: boolean;
    endpoints: {
        logout: undefined;
        authorization: undefined;
        token: undefined;
        userInfo: undefined;
    };
    scope: never[];
    token: {
        property: string;
        expiresProperty: string;
        type: string;
        name: string;
        maxAge: boolean;
        global: boolean;
        prefix: string;
        expirationPrefix: string;
    };
    idToken: {
        property: string;
        maxAge: number;
        prefix: string;
        expirationPrefix: string;
        httpOnly: boolean;
    };
    refreshToken: {
        property: string;
        maxAge: number;
        prefix: string;
        expirationPrefix: string;
        httpOnly: boolean;
    };
    user: {
        property: boolean;
    };
    responseType: string;
    codeChallengeMethod: boolean;
    clientWindow: boolean;
    clientWindowWidth: number;
    clientWindowHeight: number;
};
export declare const LOCALDEFAULTS: {
    cookie: {
        name: undefined;
    };
    endpoints: {
        csrf: {
            url: string;
        };
        login: {
            url: string;
            method: string;
        };
        logout: {
            url: string;
            method: string;
        };
        user: {
            url: string;
            method: string;
        };
        refresh: {
            url: string;
            method: string;
        };
    };
    token: {
        expiresProperty: string;
        property: string;
        type: string;
        name: string;
        maxAge: boolean;
        global: boolean;
        required: boolean;
        prefix: string;
        expirationPrefix: string;
        httpOnly: boolean;
    };
    refreshToken: {
        property: string;
        data: string;
        maxAge: number;
        required: boolean;
        tokenRequired: boolean;
        prefix: string;
        expirationPrefix: string;
        httpOnly: boolean;
    };
    autoLogout: boolean;
    user: {
        property: string;
        autoFetch: boolean;
    };
    clientId: undefined;
    grantType: undefined;
    scope: undefined;
};
export declare const ProviderAliases: {
    'laravel/jwt': string;
    'laravel/passport': string;
    'laravel/sanctum': string;
};
export declare const BuiltinSchemes: {
    local: string;
    cookie: string;
    refresh: string;
    laravelJWT: string;
    oauth2: string;
    openIDConnect: string;
    auth0: string;
};
export declare const LocalSchemes: string[];
export declare const OAuth2Schemes: string[];
