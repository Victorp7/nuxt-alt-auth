import { ExpiredAuthSessionError } from "./expired-auth-session-error.mjs";
export class RequestHandler {
  scheme;
  auth;
  http;
  requestInterceptor;
  responseErrorInterceptor;
  currentToken;
  constructor(scheme, http, auth) {
    this.scheme = scheme;
    this.http = http;
    this.auth = auth;
    this.requestInterceptor = null;
    this.responseErrorInterceptor = null;
    this.currentToken = this.auth.$storage?.memory?.[this.scheme.options.token?.prefix + this.scheme.options.name];
  }
  setHeader(token) {
    if (this.scheme.options.token && this.scheme.options.token.global) {
      this.http.setHeader(this.scheme.options.token.name, token);
    }
  }
  clearHeader() {
    if (this.scheme.options.token && this.scheme.options.token.global) {
      this.http.setHeader(this.scheme.options.token.name, null);
    }
  }
  initializeRequestInterceptor(refreshEndpoint) {
    this.requestInterceptor = this.http.onRequest(
      async (config) => {
        if (this.scheme.options.token && this.currentToken) {
          this.setHeader(this.currentToken);
        }
        if (this.scheme.options.token && !this.#needToken(config) || config.url === refreshEndpoint) {
          return config;
        }
        const { valid, tokenExpired, refreshTokenExpired, isRefreshable } = this.scheme.check(true);
        let isValid = valid;
        if (refreshTokenExpired) {
          this.scheme.reset?.();
          throw new ExpiredAuthSessionError();
        }
        if (tokenExpired) {
          if (!isRefreshable) {
            this.scheme.reset?.();
            throw new ExpiredAuthSessionError();
          }
          isValid = await this.scheme.refreshController.handleRefresh().then(() => true).catch(() => {
            this.scheme.reset?.();
            throw new ExpiredAuthSessionError();
          });
        }
        const token = this.scheme.token;
        if (!isValid) {
          if (token && !token.get() && this.#requestHasAuthorizationHeader(config)) {
            throw new ExpiredAuthSessionError();
          }
          return config;
        }
        return this.#getUpdatedRequestConfig(config, token ? token.get() : false);
      }
    );
    this.responseErrorInterceptor = this.http.onResponseError((error) => {
      if (typeof this.auth.options.resetOnResponseError === "function") {
        this.auth.options.resetOnResponseError(error, this.auth, this.scheme);
      } else if (this.auth.options.resetOnResponseError && error?.response?.status === 401) {
        this.scheme.reset?.();
        throw new ExpiredAuthSessionError();
      }
    });
  }
  reset() {
    this.http.interceptors.request.eject(this.requestInterceptor);
    this.http.interceptors.response.eject(this.responseErrorInterceptor);
    this.requestInterceptor = null;
    this.responseErrorInterceptor = null;
  }
  #needToken(config) {
    const options = this.scheme.options;
    return options.token.global || Object.values(options.endpoints).some((endpoint) => typeof endpoint === "object" ? endpoint.url === config.url : endpoint === config.url);
  }
  // ---------------------------------------------------------------
  // Watch requests for token expiration
  // Refresh tokens if token has expired
  #getUpdatedRequestConfig(config, token) {
    if (typeof token === "string") {
      config.headers[this.scheme.options.token.name] = token;
    }
    return config;
  }
  #requestHasAuthorizationHeader(config) {
    return !!config.headers[this.scheme.options.token.name];
  }
}
