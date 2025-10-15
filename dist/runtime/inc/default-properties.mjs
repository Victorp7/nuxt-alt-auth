export const OAUTH2DEFAULTS = {
  accessType: void 0,
  redirectUri: void 0,
  logoutRedirectUri: void 0,
  clientId: void 0,
  clientSecretTransport: "body",
  audience: void 0,
  grantType: void 0,
  responseMode: void 0,
  acrValues: void 0,
  autoLogout: false,
  endpoints: {
    logout: void 0,
    authorization: void 0,
    token: void 0,
    userInfo: void 0
  },
  scope: [],
  token: {
    property: "access_token",
    expiresProperty: "expires_in",
    type: "Bearer",
    name: "Authorization",
    maxAge: false,
    global: true,
    prefix: "_token.",
    expirationPrefix: "_token_expiration."
  },
  idToken: {
    property: "id_token",
    maxAge: 1800,
    prefix: "_id_token.",
    expirationPrefix: "_id_token_expiration.",
    httpOnly: false
  },
  refreshToken: {
    property: "refresh_token",
    maxAge: 60 * 60 * 24 * 30,
    prefix: "_refresh_token.",
    expirationPrefix: "_refresh_token_expiration.",
    httpOnly: false
  },
  user: {
    property: false
  },
  responseType: "token",
  codeChallengeMethod: false,
  clientWindow: false,
  clientWindowWidth: 400,
  clientWindowHeight: 600
};
export const LOCALDEFAULTS = {
  cookie: {
    name: void 0
  },
  endpoints: {
    csrf: {
      url: "/api/csrf-cookie"
    },
    login: {
      url: "/api/auth/login",
      method: "post"
    },
    logout: {
      url: "/api/auth/logout",
      method: "post"
    },
    user: {
      url: "/api/auth/user",
      method: "get"
    },
    refresh: {
      url: "/api/auth/refresh",
      method: "post"
    }
  },
  token: {
    expiresProperty: "expires_in",
    property: "token",
    type: "Bearer",
    name: "Authorization",
    maxAge: false,
    global: true,
    required: true,
    prefix: "_token.",
    expirationPrefix: "_token_expiration.",
    httpOnly: false
  },
  refreshToken: {
    property: "refresh_token",
    data: "refresh_token",
    maxAge: 60 * 60 * 24 * 30,
    required: true,
    tokenRequired: false,
    prefix: "_refresh_token.",
    expirationPrefix: "_refresh_token_expiration.",
    httpOnly: false
  },
  autoLogout: false,
  user: {
    property: "user",
    autoFetch: true
  },
  clientId: void 0,
  grantType: void 0,
  scope: void 0
};
export const ProviderAliases = {
  "laravel/jwt": "laravelJWT",
  "laravel/passport": "laravelPassport",
  "laravel/sanctum": "laravelSanctum"
};
export const BuiltinSchemes = {
  local: "LocalScheme",
  cookie: "CookieScheme",
  refresh: "RefreshScheme",
  laravelJWT: "LaravelJWTScheme",
  oauth2: "Oauth2Scheme",
  openIDConnect: "OpenIDConnectScheme",
  auth0: "Auth0Scheme"
};
export const LocalSchemes = [
  "local",
  "cookie",
  "refresh",
  "laravelJWT"
];
export const OAuth2Schemes = [
  "oauth",
  "openIDConnect",
  "auth0"
];
