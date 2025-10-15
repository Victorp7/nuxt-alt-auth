import { getProp } from "../../utils";
import { Token, RequestHandler } from "../inc/index.mjs";
import { BaseScheme } from "./base.mjs";
const DEFAULTS = {
  name: "local",
  endpoints: {
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
    expirationPrefix: "_token_expiration."
  },
  user: {
    property: "user",
    autoFetch: true
  },
  clientId: void 0,
  grantType: void 0,
  scope: void 0
};
export class LocalScheme extends BaseScheme {
  token;
  requestHandler;
  constructor($auth, options, ...defaults) {
    super($auth, options, ...defaults, DEFAULTS);
    this.token = new Token(this, this.$auth.$storage);
    this.requestHandler = new RequestHandler(this, process.server ? this.$auth.ctx.ssrContext.event.$http : this.$auth.ctx.$http, $auth);
  }
  check(checkStatus = false) {
    const response = {
      valid: false,
      tokenExpired: false
    };
    const token = this.token.sync();
    if (!token) {
      return response;
    }
    if (!checkStatus) {
      response.valid = true;
      return response;
    }
    const tokenStatus = this.token.status();
    if (tokenStatus.expired()) {
      response.tokenExpired = true;
      return response;
    }
    response.valid = true;
    return response;
  }
  mounted({ tokenCallback = () => this.$auth.reset(), refreshTokenCallback = () => void 0 } = {}) {
    const { tokenExpired, refreshTokenExpired } = this.check(true);
    if (refreshTokenExpired && typeof refreshTokenCallback === "function") {
      refreshTokenCallback();
    } else if (tokenExpired && typeof tokenCallback === "function") {
      tokenCallback();
    }
    this.initializeRequestInterceptor();
    return this.$auth.fetchUserOnce();
  }
  async login(endpoint, { reset = true } = {}) {
    if (!this.options.endpoints.login) {
      return;
    }
    if (reset) {
      this.$auth.reset({ resetInterceptor: false });
    }
    endpoint = endpoint || {};
    endpoint.body = endpoint.body || {};
    if (this.options.clientId) {
      endpoint.body.client_id = this.options.clientId;
    }
    if (this.options.grantType) {
      endpoint.body.grant_type = this.options.grantType;
    }
    if (this.options.scope) {
      endpoint.body.scope = this.options.scope;
    }
    if (this.options.ssr) {
      endpoint.baseURL = "";
    }
    const response = await this.$auth.request(endpoint, this.options.endpoints.login);
    this.updateTokens(response);
    if (!this.requestHandler.requestInterceptor) {
      this.initializeRequestInterceptor();
    }
    if (this.options.user.autoFetch) {
      await this.fetchUser();
    }
    return response;
  }
  setUserToken(token) {
    this.token.set(token);
    return this.fetchUser();
  }
  async fetchUser(endpoint) {
    if (!this.check().valid) {
      return Promise.resolve();
    }
    if (!this.options.endpoints.user) {
      this.$auth.setUser({});
      return Promise.resolve();
    }
    return this.$auth.requestWith(endpoint, this.options.endpoints.user).then((response) => {
      const userData = getProp(response._data, this.options.user.property);
      if (!userData) {
        const error = new Error(`User Data response does not contain field ${this.options.user.property}`);
        return Promise.reject(error);
      }
      this.$auth.setUser(userData);
      return response;
    }).catch((error) => {
      this.$auth.callOnError(error, { method: "fetchUser" });
      return Promise.reject(error);
    });
  }
  async logout(endpoint = {}) {
    if (this.options.endpoints.logout) {
      await this.$auth.requestWith(endpoint, this.options.endpoints.logout).catch((err) => console.error(err));
    }
    this.$auth.reset();
    this.$auth.redirect("logout");
  }
  reset({ resetInterceptor = true } = {}) {
    this.$auth.setUser(false);
    this.token.reset();
    if (resetInterceptor) {
      this.requestHandler.reset();
    }
  }
  extractToken(response) {
    return getProp(response._data, this.options.token.property);
  }
  updateTokens(response) {
    let tokenExpiresIn = false;
    const token = this.options.token?.required ? this.extractToken(response) : true;
    tokenExpiresIn = this.options.token?.maxAge || getProp(response._data, this.options.token.expiresProperty);
    this.token.set(token, tokenExpiresIn);
  }
  initializeRequestInterceptor() {
    this.requestHandler.initializeRequestInterceptor();
  }
}
