import { cleanObj, getProp } from "../../utils";
import { RefreshController, RefreshToken, ExpiredAuthSessionError } from "../inc/index.mjs";
import { LocalScheme } from "./local.mjs";
const DEFAULTS = {
  name: "refresh",
  endpoints: {
    refresh: {
      url: "/api/auth/refresh",
      method: "POST"
    }
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
  autoLogout: false
};
export class RefreshScheme extends LocalScheme {
  refreshToken;
  refreshController;
  constructor($auth, options) {
    super($auth, options, DEFAULTS);
    this.refreshToken = new RefreshToken(this, this.$auth.$storage);
    this.refreshController = new RefreshController(this);
  }
  check(checkStatus = false) {
    const response = {
      valid: false,
      tokenExpired: false,
      refreshTokenExpired: false,
      isRefreshable: true
    };
    const token = this.token.sync();
    this.refreshToken.sync();
    if (!token) {
      return response;
    }
    if (!checkStatus) {
      response.valid = true;
      return response;
    }
    const tokenStatus = this.token.status();
    const refreshTokenStatus = this.refreshToken.status();
    if (refreshTokenStatus.expired()) {
      response.refreshTokenExpired = true;
      return response;
    }
    if (tokenStatus.expired()) {
      response.tokenExpired = true;
      return response;
    }
    response.valid = true;
    return response;
  }
  mounted() {
    return super.mounted({
      tokenCallback: () => {
        if (this.options.autoLogout) {
          this.$auth.reset();
        }
      },
      refreshTokenCallback: () => {
        this.$auth.reset();
      }
    });
  }
  async refreshTokens() {
    if (!this.options.endpoints.refresh) {
      return Promise.resolve();
    }
    if (!this.check().valid) {
      return Promise.resolve();
    }
    const refreshTokenStatus = this.refreshToken.status();
    if (refreshTokenStatus.expired()) {
      this.$auth.reset();
      throw new ExpiredAuthSessionError();
    }
    if (!this.options.refreshToken.tokenRequired) {
      this.requestHandler.clearHeader();
    }
    const endpoint = {
      body: {
        client_id: void 0,
        grant_type: void 0
      }
    };
    if (this.options.refreshToken.required && this.options.refreshToken.data && !this.options.refreshToken.httpOnly) {
      endpoint.body[this.options.refreshToken.data] = this.refreshToken.get();
    }
    if (this.options.clientId) {
      endpoint.body.client_id = this.options.clientId;
    }
    endpoint.body.grant_type = "refresh_token";
    cleanObj(endpoint.body);
    if (this.options.ssr) {
      endpoint.baseURL = "";
    }
    const response = await this.$auth.request(endpoint, this.options.endpoints.refresh);
    this.updateTokens(response);
  }
  setUserToken(token, refreshToken) {
    this.token.set(token);
    if (refreshToken) {
      this.refreshToken.set(refreshToken);
    }
    return this.fetchUser();
  }
  reset({ resetInterceptor = true } = {}) {
    this.$auth.setUser(false);
    this.token.reset();
    this.refreshToken.reset();
    if (resetInterceptor) {
      this.requestHandler.reset();
    }
  }
  extractRefreshToken(response) {
    return getProp(response._data, this.options.refreshToken.property);
  }
  updateTokens(response) {
    let tokenExpiresIn = false;
    const token = this.options.token?.required ? this.extractToken(response) : true;
    const refreshToken = this.options.refreshToken.required ? this.extractRefreshToken(response) : true;
    tokenExpiresIn = this.options.token?.maxAge || getProp(response._data, this.options.token.expiresProperty);
    this.token.set(token, tokenExpiresIn);
    if (refreshToken) {
      this.refreshToken.set(refreshToken);
    }
  }
  initializeRequestInterceptor() {
    this.requestHandler.initializeRequestInterceptor(
      this.options.endpoints.refresh.url
    );
  }
}
