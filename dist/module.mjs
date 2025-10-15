import { addTemplate, addServerHandler, resolvePath, defineNuxtModule, createResolver, installModule, addPluginTemplate, addImports, addRouteMiddleware } from '@nuxt/kit';
import { serialize } from '@refactorjs/serialize';
import { join } from 'pathe';
import { defu } from 'defu';
import 'jwt-decode';
import { existsSync } from 'fs';
import { hash } from 'ohash';

const name = "@plusrelocation/nuxt-alt-auth";
const version = "3.1.7";

const OAUTH2DEFAULTS = {
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
const LOCALDEFAULTS = {
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
const ProviderAliases = {
  "laravel/jwt": "laravelJWT",
  "laravel/passport": "laravelPassport",
  "laravel/sanctum": "laravelSanctum"
};
const BuiltinSchemes = {
  local: "LocalScheme",
  cookie: "CookieScheme",
  refresh: "RefreshScheme",
  laravelJWT: "LaravelJWTScheme",
  oauth2: "Oauth2Scheme",
  openIDConnect: "OpenIDConnectScheme",
  auth0: "Auth0Scheme"
};
const LocalSchemes = [
  "local",
  "cookie",
  "refresh",
  "laravelJWT"
];
const OAuth2Schemes = [
  "oauth",
  "openIDConnect",
  "auth0"
];

function assignDefaults(strategy, defaults) {
  Object.assign(strategy, defu(strategy, defaults));
}
function addAuthorize(nuxt, strategy, useForms = false) {
  const clientSecret = strategy.clientSecret;
  const clientId = strategy.clientId;
  const tokenEndpoint = strategy.endpoints.token;
  const audience = strategy.audience;
  delete strategy.clientSecret;
  const endpoint = `/_auth/oauth/${strategy.name}/authorize`;
  strategy.endpoints.token = endpoint;
  strategy.responseType = "code";
  addTemplate({
    filename: `authorize-${strategy.name}.ts`,
    write: true,
    getContents: () => authorizeGrant({
      strategy,
      useForms,
      clientSecret,
      clientId,
      tokenEndpoint,
      audience
    })
  });
  addServerHandler({
    route: endpoint,
    method: "post",
    handler: join(nuxt.options.buildDir, `authorize-${strategy.name}.ts`)
  });
}
function addLocalAuthorize(nuxt, strategy) {
  const tokenEndpoint = strategy.endpoints?.login?.url;
  const refreshEndpoint = strategy.endpoints?.refresh?.url;
  const endpoint = `/_auth/local/${strategy.name}/authorize`;
  strategy.endpoints.login.url = endpoint;
  strategy.endpoints.refresh.url = endpoint;
  addTemplate({
    filename: `local-${strategy.name}.ts`,
    write: true,
    getContents: () => localAuthorizeGrant({
      strategy,
      tokenEndpoint,
      refreshEndpoint
    })
  });
  addServerHandler({
    route: endpoint,
    method: "post",
    handler: join(nuxt.options.buildDir, `local-${strategy.name}.ts`)
  });
}
function initializePasswordGrantFlow(nuxt, strategy) {
  const clientSecret = strategy.clientSecret;
  const clientId = strategy.clientId;
  const tokenEndpoint = strategy.endpoints.token;
  delete strategy.clientSecret;
  const endpoint = `/_auth/${strategy.name}/token`;
  strategy.endpoints.login.url = endpoint;
  strategy.endpoints.refresh.url = endpoint;
  addTemplate({
    filename: `password-${strategy.name}.ts`,
    write: true,
    getContents: () => passwordGrant({
      strategy,
      clientSecret,
      clientId,
      tokenEndpoint
    })
  });
  addServerHandler({
    route: endpoint,
    method: "post",
    handler: join(nuxt.options.buildDir, `password-${strategy.name}.ts`)
  });
}
function assignAbsoluteEndpoints(strategy) {
  const { url, endpoints } = strategy;
  if (endpoints) {
    for (const key of Object.keys(endpoints)) {
      const endpoint = endpoints[key];
      if (endpoint) {
        if (typeof endpoint === "object") {
          if (!endpoint.url || endpoint.url.startsWith(url)) {
            continue;
          }
          endpoints[key].url = url + endpoint.url;
        } else {
          if (endpoint.startsWith(url)) {
            continue;
          }
          endpoints[key] = url + endpoint;
        }
      }
    }
  }
}
function authorizeGrant(opt) {
  return `import { defineEventHandler, readBody, createError, getCookie } from 'h3'
// @ts-expect-error: virtual file 
import { config } from '#nuxt-auth-options'
import { serialize } from 'cookie-es'

const options = ${serialize(opt, { space: 4 })}

function addTokenPrefix(token: string | boolean, tokenType: string | false): string | boolean {
    if (!token || !tokenType || typeof token !== 'string' || token.startsWith(tokenType)) {
        return token;
    }

    return tokenType + ' ' + token;
}

export default defineEventHandler(async (event) => {
    const {
        code,
        code_verifier: codeVerifier,
        redirect_uri: redirectUri = options.strategy.redirectUri,
        response_type: responseType = options.strategy.responseType,
        grant_type: grantType = options.strategy.grantType,
        refresh_token: refreshToken
    } = await readBody(event)

    const refreshCookieName = config.stores.cookie.prefix + options.strategy?.refreshToken?.prefix + options.strategy.name
    const tokenCookieName = config.stores.cookie.prefix + options.strategy?.token?.prefix + options.strategy.name
    const idTokenCookieName = config.stores.cookie.prefix + options.strategy?.idToken?.prefix + options.strategy.name
    const serverRefreshToken = getCookie(event, refreshCookieName)

    // Grant type is authorization code, but code is not available
    if (grantType === 'authorization_code' && !code) {
        return createError({
            statusCode: 500,
            message: 'Missing authorization code'
        })
    }

    // Grant type is refresh token, but refresh token is not available
    if ((grantType === 'refresh_token' && !options.strategy.refreshToken.httpOnly && !refreshToken) || (grantType === 'refresh_token' && options.strategy.refreshToken.httpOnly && !serverRefreshToken)) {
        return createError({
            statusCode: 500,
            message: 'Missing refresh token'
        })
    }

    let body = {
        client_id: options.clientId,
        client_secret: options.clientSecret,
        refresh_token: options.strategy.refreshToken.httpOnly ? serverRefreshToken : refreshToken,
        grant_type: grantType,
        response_type: responseType,
        redirect_uri: redirectUri,
        audience: options.audience,
        code_verifier: codeVerifier,
        code
    }

    if (grantType !== 'refresh_token') {
        delete body.refresh_token
    }

    const headers = {
        Accept: 'application/json',
        'Content-Type': 'application/json'
    }

    if (options.strategy.clientSecretTransport === 'authorization_header') {
        // @ts-ignore
        headers['Authorization'] = 'Basic ' + Buffer.from(options.clientId + ':' + options.clientSecret).toString('base64')
        // client_secret is transported in auth header
        delete body.client_secret
    }

    const response = await $http.post(options.tokenEndpoint, {
        body,
        headers
    })

    let cookies = event.node.res.getHeader('Set-Cookie') as string[] || [];

    const refreshCookieValue = response._data?.[options.strategy?.refreshToken?.property]
    if (config.stores.cookie.enabled && refreshCookieValue && options.strategy.refreshToken.httpOnly) {
        const refreshCookie = serialize(refreshCookieName, refreshCookieValue, { ...config.stores.cookie.options, httpOnly: true })
        cookies.push(refreshCookie);
    }

    const tokenCookieValue = response._data?.[options.strategy?.token?.property]
    if (config.stores.cookie.enabled && tokenCookieValue && options.strategy.token.httpOnly) {
        const token = addTokenPrefix(tokenCookieValue, options.strategy.token.type) as string
        const tokenCookie = serialize(tokenCookieName, token, { ...config.stores.cookie.options, httpOnly: true })
        cookies.push(tokenCookie);
    }

    const idTokenCookieValue = response._data?.[options.strategy?.idToken?.property]
    if (config.stores.cookie.enabled && idTokenCookieValue && options.strategy.idToken.httpOnly) {
        const idTokenCookie = serialize(idTokenCookieName, token, { ...config.stores.cookie.options, httpOnly: true })
        cookies.push(idTokenCookie);
    }

    if (cookies.length) {
        event.node.res.setHeader('Set-Cookie', cookies);
    }

    event.node.res.end(JSON.stringify(response._data))
})
`;
}
function localAuthorizeGrant(opt) {
  return `import { defineEventHandler, readBody, createError, getCookie } from 'h3'
// @ts-expect-error: virtual file
import { config } from '#nuxt-auth-options'
import { serialize } from 'cookie-es'

const options = ${serialize(opt, { space: 4 })}

function addTokenPrefix(token: string | boolean, tokenType: string | false): string | boolean {
    if (!token || !tokenType || typeof token !== 'string' || token.startsWith(tokenType)) {
        return token;
    }

    return tokenType + ' ' + token;
}

export default defineEventHandler(async (event) => {
    const requestBody = await readBody(event)

    const refreshCookieName = config.stores.cookie.prefix + options.strategy?.refreshToken?.prefix + options.strategy.name
    const refreshTokenDataName = options.strategy.refreshToken.data
    const tokenCookieName = config.stores.cookie.prefix + options.strategy?.token?.prefix + options.strategy.name
    const serverRefreshToken = getCookie(event, refreshCookieName)

    // Grant type is refresh token, but refresh token is not available
    if ((requestBody.grant_type === 'refresh_token' && !options.strategy.refreshToken.httpOnly && !requestBody[refreshTokenDataName]) || (requestBody.grant_type === 'refresh_token' && options.strategy.refreshToken.httpOnly && !serverRefreshToken)) {
        return createError({
            statusCode: 500,
            message: 'Missing refresh token'
        })
    }

    let body = {
        ...requestBody,
        [refreshTokenDataName]: options.strategy.refreshToken.httpOnly ? serverRefreshToken : requestBody[refreshTokenDataName],
    }

    if (requestBody.grant_type !== 'refresh_token') {
        delete body[refreshTokenDataName]
    }

    const headers = {
        'Content-Type': 'application/json'
    }

    let response

    if (body[refreshTokenDataName]) {
        response = await $http.post(options.refreshEndpoint, {
            body,
            headers: {
                ...headers,
                // @ts-ignore: headers might not be set
                ...options.strategy?.endpoints?.refresh?.headers
            }
        })
    } else {
        response = await $http.post(options.tokenEndpoint, {
            body,
            headers: {
                ...headers,
                // @ts-ignore: headers might not be set
                ...options.strategy?.endpoints?.login?.headers
            }
        })
    }

    let cookies = event.node.res.getHeader('Set-Cookie') as string[] || [];

    const refreshCookieValue = response._data?.[options.strategy?.refreshToken?.property]
    if (config.stores.cookie.enabled && refreshCookieValue && options.strategy.refreshToken.httpOnly) {
        const refreshCookie = serialize(refreshCookieName, refreshCookieValue, { ...config.stores.cookie.options, httpOnly: true })
        cookies.push(refreshCookie);
    }

    const tokenCookieValue = response._data?.[options.strategy?.token?.property]
    if (config.stores.cookie.enabled && tokenCookieValue && options.strategy.token.httpOnly) {
        const token = addTokenPrefix(tokenCookieValue, options.strategy.token.type) as string
        const tokenCookie = serialize(tokenCookieName, token, { ...config.stores.cookie.options, httpOnly: true })
        cookies.push(tokenCookie);
    }

    if (cookies.length) {
        event.node.res.setHeader('Set-Cookie', cookies);
    }

    event.node.res.end(JSON.stringify(response._data))
})
`;
}
function passwordGrant(opt) {
  return `import requrl from 'requrl';
import { defineEventHandler, readBody, createError } from 'h3';

const options = ${serialize(opt, { space: 4 })}

export default defineEventHandler(async (event) => {
    const body = await readBody(event)

    // If \`grant_type\` is not defined, set default value
    if (!body.grant_type) {
        body.grant_type = options.strategy.grantType
    }

    // If \`client_id\` is not defined, set default value
    if (!body.client_id) {
        body.grant_type = options.clientId
    }

    // Grant type is password, but username or password is not available
    if (body.grant_type === 'password' && (!body.username || !body.password)) {
        return createError({
            statusCode: 400,
            message: 'Invalid username or password'
        })
    }

    // Grant type is refresh token, but refresh token is not available
    if (body.grant_type === 'refresh_token' && !body.refresh_token) {
        event.respondWith({ status: 400, body: JSON.stringify({ message: 'Refresh token not provided' }) });
        return createError({
            statusCode: 400,
            message: 'Refresh token not provided'
        })
    }

    const response = await $http.post(options.tokenEndpoint, {
        baseURL: requrl(event.node.req),
        body: {
            client_id: options.clientId,
            client_secret: options.clientSecret,
            ...body
        },
        headers: {
            Accept: 'application/json'
        }
    })

    event.node.res.end(JSON.stringify(response._data))
})
`;
}

const hasOwn = (object, key) => Object.hasOwn ? Object.hasOwn(object, key) : Object.prototype.hasOwnProperty.call(object, key);

function auth0(nuxt, strategy) {
  const DEFAULTS = Object.assign(OAUTH2DEFAULTS, {
    scheme: "auth0",
    endpoints: {
      authorization: `https://${strategy.domain}/authorize`,
      userInfo: `https://${strategy.domain}/userinfo`,
      token: `https://${strategy.domain}/oauth/token`,
      logout: `https://${strategy.domain}/v2/logout`
    },
    scope: ["openid", "profile", "email"]
  });
  assignDefaults(strategy, DEFAULTS);
}

function discord(nuxt, strategy) {
  const DEFAULTS = Object.assign(OAUTH2DEFAULTS, {
    scheme: "oauth2",
    endpoints: {
      authorization: "https://discord.com/api/oauth2/authorize",
      token: "https://discord.com/api/oauth2/token",
      userInfo: "https://discord.com/api/users/@me"
      //   logout: 'https://discord.com/api/oauth2/token/revoke' //TODO: add post method, because discord using the post method to logout
    },
    grantType: "authorization_code",
    codeChallengeMethod: "S256",
    scope: ["identify", "email"]
  });
  assignDefaults(strategy, DEFAULTS);
  addAuthorize(nuxt, strategy, true);
}

function facebook(nuxt, strategy) {
  const DEFAULTS = Object.assign(OAUTH2DEFAULTS, {
    scheme: "oauth2",
    endpoints: {
      authorization: "https://facebook.com/v2.12/dialog/oauth",
      userInfo: "https://graph.facebook.com/v2.12/me?fields=about,name,picture{url},email"
    },
    scope: ["public_profile", "email"]
  });
  assignDefaults(strategy, DEFAULTS);
}

function github(nuxt, strategy) {
  const DEFAULTS = Object.assign(OAUTH2DEFAULTS, {
    scheme: "oauth2",
    endpoints: {
      authorization: "https://github.com/login/oauth/authorize",
      token: "https://github.com/login/oauth/access_token",
      userInfo: "https://api.github.com/user"
    },
    scope: ["user", "email"]
  });
  assignDefaults(strategy, DEFAULTS);
  addAuthorize(nuxt, strategy);
}

function google(nuxt, strategy) {
  const DEFAULTS = Object.assign(OAUTH2DEFAULTS, {
    scheme: "oauth2",
    endpoints: {
      authorization: "https://accounts.google.com/o/oauth2/v2/auth",
      userInfo: "https://www.googleapis.com/oauth2/v3/userinfo"
    },
    scope: ["openid", "profile", "email"]
  });
  assignDefaults(strategy, DEFAULTS);
}

function laravelJWT(nuxt, strategy) {
  const { url } = strategy;
  if (!url) {
    throw new Error("url is required for laravel jwt!");
  }
  const DEFAULTS = Object.assign(LOCALDEFAULTS, {
    name: "laravelJWT",
    scheme: "laravelJWT",
    endpoints: {
      login: {
        url: url + "/api/auth/login"
      },
      refresh: {
        url: url + "/api/auth/refresh"
      },
      logout: {
        url: url + "/api/auth/logout"
      },
      user: {
        url: url + "/api/auth/user"
      }
    },
    token: {
      property: "access_token",
      maxAge: 3600
    },
    refreshToken: {
      property: false,
      data: false,
      maxAge: 1209600,
      required: false,
      tokenRequired: true
    },
    user: {
      property: false
    },
    clientId: false,
    grantType: false
  });
  assignDefaults(strategy, DEFAULTS);
  assignAbsoluteEndpoints(strategy);
  if (strategy.ssr) {
    addLocalAuthorize(nuxt, strategy);
  }
}

function isPasswordGrant(strategy) {
  return strategy.grantType === "password";
}
function laravelPassport(nuxt, strategy) {
  const { url } = strategy;
  if (!url) {
    throw new Error("url is required is laravel passport!");
  }
  const defaults = Object.assign(LOCALDEFAULTS, {
    name: "laravelPassport",
    token: {
      property: "access_token",
      type: "Bearer",
      name: "Authorization",
      maxAge: 60 * 60 * 24 * 365
    },
    refreshToken: {
      property: "refresh_token",
      data: "refresh_token",
      maxAge: 60 * 60 * 24 * 30
    },
    user: {
      property: false
    }
  });
  let DEFAULTS;
  if (isPasswordGrant(strategy)) {
    DEFAULTS = {
      ...defaults,
      scheme: "refresh",
      endpoints: {
        token: url + "/oauth/token",
        login: {
          baseURL: ""
        },
        refresh: {
          baseURL: ""
        },
        logout: false,
        user: {
          url: url + "/api/auth/user"
        }
      },
      grantType: "password"
    };
    assignDefaults(strategy, DEFAULTS);
    assignAbsoluteEndpoints(strategy);
    initializePasswordGrantFlow(nuxt, strategy);
  } else {
    DEFAULTS = {
      ...defaults,
      scheme: "oauth2",
      endpoints: {
        authorization: url + "/oauth/authorize",
        token: url + "/oauth/token",
        userInfo: url + "/api/auth/user",
        logout: false
      },
      responseType: "code",
      grantType: "authorization_code",
      scope: "*"
    };
    assignDefaults(strategy, DEFAULTS);
    assignAbsoluteEndpoints(strategy);
    addAuthorize(nuxt, strategy);
  }
}

function laravelSanctum(nuxt, strategy) {
  const { url } = strategy;
  if (!url) {
    throw new Error("URL is required with Laravel Sanctum!");
  }
  const endpointDefaults = {
    credentials: "include"
  };
  const DEFAULTS = Object.assign(LOCALDEFAULTS, {
    scheme: "cookie",
    name: "laravelSanctum",
    cookie: {
      name: "XSRF-TOKEN"
    },
    endpoints: {
      csrf: {
        ...endpointDefaults,
        url: "/sanctum/csrf-cookie"
      },
      login: {
        ...endpointDefaults,
        url: "/login"
      },
      refresh: {
        ...endpointDefaults,
        url: "/refresh"
      },
      logout: {
        ...endpointDefaults,
        url: "/logout"
      },
      user: {
        ...endpointDefaults,
        url: "/api/user"
      }
    },
    user: {
      property: false,
      autoFetch: true
    },
    token: {
      type: "Bearer"
    }
  });
  assignDefaults(strategy, DEFAULTS);
  assignAbsoluteEndpoints(strategy);
  if (strategy.ssr) {
    addLocalAuthorize(nuxt, strategy);
  }
}

const AUTH_PROVIDERS = {
    __proto__: null,
    auth0: auth0,
    discord: discord,
    facebook: facebook,
    github: github,
    google: google,
    laravelJWT: laravelJWT,
    laravelPassport: laravelPassport,
    laravelSanctum: laravelSanctum
};

async function resolveStrategies(nuxt, options) {
  const strategies = [];
  const strategyScheme = {};
  for (const name of Object.keys(options.strategies)) {
    if (!options.strategies?.[name] || options.strategies?.[name].enabled === false) {
      continue;
    }
    const strategy = Object.assign({}, options.strategies[name]);
    if (!strategy.name) {
      strategy.name = name;
    }
    if (!strategy.provider) {
      strategy.provider = strategy.name;
    }
    if (hasOwn(strategy, "ssr")) {
      strategy.ssr = strategy.ssr;
    } else {
      strategy.ssr = nuxt.options.ssr;
    }
    const provider = await resolveProvider(strategy.provider, nuxt, strategy);
    delete strategy.provider;
    if (typeof provider === "function") {
      provider(nuxt, strategy);
    }
    if (!strategy.scheme) {
      strategy.scheme = strategy.name;
    }
    try {
      const schemeImport = await resolveScheme(strategy.scheme);
      delete strategy.scheme;
      strategyScheme[strategy.name] = schemeImport;
      strategies.push(strategy);
    } catch (e) {
      console.error(`[Auth] Error resolving strategy ${strategy.name}: ${e}`);
    }
  }
  return {
    strategies,
    strategyScheme
  };
}
async function resolveScheme(scheme) {
  if (typeof scheme !== "string") {
    return;
  }
  if (BuiltinSchemes[scheme]) {
    return {
      name: BuiltinSchemes[scheme],
      as: BuiltinSchemes[scheme],
      from: "#auth/runtime"
    };
  }
  const path = await resolvePath(scheme);
  if (existsSync(path)) {
    const _path = path.replace(/\\/g, "/");
    return {
      name: "default",
      as: "Scheme$" + hash({ path: _path }),
      from: _path
    };
  }
}
async function resolveProvider(provider, nuxt, strategy) {
  provider = ProviderAliases[provider] || provider;
  if (AUTH_PROVIDERS[provider]) {
    return AUTH_PROVIDERS[provider];
  }
  if (typeof provider === "function") {
    return provider(nuxt, strategy);
  }
  if (typeof provider === "string") {
    return (nuxt2, strategy2) => {
      if (OAuth2Schemes.includes(strategy2.scheme) && strategy2.ssr) {
        assignDefaults(strategy2, OAUTH2DEFAULTS);
        addAuthorize(nuxt2, strategy2, true);
      }
      if (LocalSchemes.includes(strategy2.scheme) && strategy2.ssr) {
        assignDefaults(strategy2, LOCALDEFAULTS);
        if (strategy2.url) {
          assignAbsoluteEndpoints(strategy2);
        }
        addLocalAuthorize(nuxt2, strategy2);
      }
    };
  }
}

const moduleDefaults = {
  // -- Enable Global Middleware --
  globalMiddleware: false,
  enableMiddleware: true,
  // -- Error handling --
  resetOnError: false,
  resetOnResponseError: false,
  ignoreExceptions: false,
  // -- Authorization --
  scopeKey: "scope",
  // -- Redirects --
  rewriteRedirects: true,
  fullPathRedirect: false,
  redirectStrategy: "storage",
  watchLoggedIn: true,
  tokenValidationInterval: false,
  redirect: {
    login: "/login",
    logout: "/",
    home: "/",
    callback: "/login"
  },
  stores: {
    state: {
      namespace: "auth"
    },
    pinia: {
      enabled: false,
      namespace: "auth"
    },
    cookie: {
      enabled: true,
      prefix: "auth.",
      options: {
        path: "/",
        sameSite: "lax"
      }
    },
    local: {
      enabled: false,
      prefix: "auth."
    },
    session: {
      enabled: false,
      prefix: "auth."
    }
  },
  // -- Strategies --
  defaultStrategy: void 0,
  strategies: {}
};

const getAuthPlugin = (options) => {
  return `import { Auth, ExpiredAuthSessionError } from '#auth/runtime'
import { defineNuxtPlugin, useRuntimeConfig } from '#imports'
import { defu } from 'defu';

// Active schemes
${options.schemeImports.map((i) => `import { ${i.name}${i.name !== i.as ? " as " + i.as : ""} } from '${i.from}'`).join("\n")}

// Options
let options = ${serialize(options.options, { space: 4 })}

export default defineNuxtPlugin({
    name: 'nuxt-alt:auth',
    async setup(nuxtApp) {
        // Create a new Auth instance
        const auth = new Auth(nuxtApp, options)

        // Register strategies
        ${options.strategies.map((strategy) => {
    const scheme = options.strategyScheme[strategy.name];
    const schemeOptions = JSON.stringify(strategy);
    return `auth.registerStrategy('${strategy.name}', new ${scheme.as}(auth, defu(useRuntimeConfig()?.public?.auth?.strategies?.['${strategy.name}'], ${schemeOptions})))`;
  }).join(";\n")}

        nuxtApp.provide('auth', auth)

        return auth.init()
        .catch(error => {
            if (process.client) {
                // Don't console log expired auth session errors. This error is common, and expected to happen.
                // The error happens whenever the user does an ssr request (reload/initial navigation) with an expired refresh
                // token. We don't want to log this as an error.
                if (error instanceof ExpiredAuthSessionError) {
                    return
                }

                console.error('[ERROR] [AUTH]', error)
            }
        })
    }
})`;
};

const CONFIG_KEY = "auth";
const module = defineNuxtModule({
  meta: {
    name,
    version,
    configKey: CONFIG_KEY,
    compatibility: {
      nuxt: "^3.0.0"
    }
  },
  defaults: ({ options }) => ({
    ...moduleDefaults,
    stores: {
      cookie: {
        secure: options.dev ? false : true
      }
    }
  }),
  async setup(moduleOptions, nuxt) {
    const resolver = createResolver(import.meta.url);
    const runtime = resolver.resolve("runtime");
    const options = defu(nuxt.options.runtimeConfig[CONFIG_KEY], moduleOptions, moduleDefaults);
    const { strategies, strategyScheme } = await resolveStrategies(nuxt, options);
    delete options.strategies;
    const uniqueImports = /* @__PURE__ */ new Set();
    const schemeImports = Object.values(strategyScheme).filter((i) => {
      if (uniqueImports.has(i.as)) {
        return false;
      }
      uniqueImports.add(i.as);
      return true;
    });
    options.defaultStrategy = options.defaultStrategy || strategies.length ? strategies[0].name : "";
    nuxt.hook("nitro:config", (config) => {
      config.virtual = config.virtual || {};
      config.virtual["#nuxt-auth-options"] = `export const config = ${serialize(options, { space: 4 })}`;
    });
    if (!nuxt.options.modules.includes("@nuxt-alt/http")) {
      installModule("@nuxt-alt/http");
    }
    addPluginTemplate({
      getContents: () => getAuthPlugin({ options, strategies, strategyScheme, schemeImports }),
      filename: "auth.plugin.mjs"
    });
    addImports([
      { from: resolver.resolve("runtime/composables"), name: "useAuth" }
    ]);
    nuxt.options.alias["#auth/runtime"] = runtime;
    const providers = resolver.resolve("runtime/providers");
    nuxt.options.alias["#auth/providers"] = providers;
    const utils = resolver.resolve("utils");
    nuxt.options.alias["#auth/utils"] = utils;
    nuxt.options.build.transpile.push(runtime, providers, utils);
    if (nuxt.options.ssr) {
      addServerHandler({
        route: "/_auth/reset",
        method: "post",
        handler: resolver.resolve(runtime, "token-nitro")
      });
    }
    if (options.enableMiddleware) {
      addRouteMiddleware({
        name: "auth",
        path: resolver.resolve("runtime/core/middleware"),
        global: options.globalMiddleware
      }, { override: true });
    }
    if (options.plugins) {
      options.plugins.forEach((p) => nuxt.options.plugins.push(p));
      delete options.plugins;
    }
  }
});

export { module as default };
