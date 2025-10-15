import { ExpiredAuthSessionError } from "../inc/expired-auth-session-error.mjs";
import { isSet, getProp, isRelativeURL, routeMeta, hasOwn } from "../../utils";
import { Storage } from "./storage.mjs";
import { isSamePath, withQuery } from "ufo";
import requrl from "requrl";
export class Auth {
  ctx;
  options;
  strategies = {};
  $storage;
  $state;
  error;
  #errorListeners = [];
  #redirectListeners = [];
  #tokenValidationInterval;
  constructor(ctx, options) {
    this.ctx = ctx;
    this.#transformRedirect(options.redirect);
    this.options = options;
    const initialState = {
      user: void 0,
      loggedIn: false,
      strategy: void 0,
      busy: false
    };
    const storage = new Storage(ctx, {
      ...this.options,
      initialState
    });
    this.$storage = storage;
    this.$state = storage.state;
  }
  #transformRedirect(redirects) {
    for (const key in redirects) {
      const value = redirects[key];
      if (typeof value === "string" && typeof this.ctx.$localePath === "function") {
        redirects[key] = this.ctx.$localePath(value);
      }
      if (typeof value === "function") {
        redirects[key] = value(this, typeof this.ctx.$localePath === "function" ? this.ctx.$localePath : void 0);
      }
    }
    return redirects;
  }
  #checkTokenValidation() {
    this.#tokenValidationInterval = setInterval(async () => {
      const { valid, tokenExpired, refreshTokenExpired, isRefreshable } = this.check(true);
      let isValid = valid;
      if (refreshTokenExpired) {
        this.reset?.();
        clearInterval(this.#tokenValidationInterval);
        throw new ExpiredAuthSessionError();
      }
      if (tokenExpired) {
        if (!isRefreshable) {
          this.reset();
          clearInterval(this.#tokenValidationInterval);
          throw new ExpiredAuthSessionError();
        }
        isValid = await this.refreshStrategy.refreshController.handleRefresh().then(() => true).catch(() => {
          this.reset();
          clearInterval(this.#tokenValidationInterval);
          throw new ExpiredAuthSessionError();
        });
      }
      const token = this.tokenStrategy.token;
      if (!isValid) {
        if (token && !token.get()) {
          clearInterval(this.#tokenValidationInterval);
          throw new ExpiredAuthSessionError();
        }
      }
    }, typeof this.options.tokenValidationInterval === "number" ? this.options.tokenValidationInterval : 1e3);
  }
  getStrategy(throwException = true) {
    if (throwException) {
      if (!this.$state.strategy) {
        throw new Error("No strategy is set!");
      }
      if (!this.strategies[this.$state.strategy]) {
        throw new Error("Strategy not supported: " + this.$state.strategy);
      }
    }
    return this.strategies[this.$state.strategy];
  }
  get tokenStrategy() {
    return this.getStrategy();
  }
  get refreshStrategy() {
    return this.getStrategy();
  }
  get strategy() {
    return this.getStrategy();
  }
  get user() {
    return this.$state.user;
  }
  // ---------------------------------------------------------------
  // Strategy and Scheme
  // ---------------------------------------------------------------
  get loggedIn() {
    return this.$state.loggedIn;
  }
  get busy() {
    return this.$storage.getState("busy");
  }
  async init() {
    if (this.options.resetOnError) {
      this.onError((...args) => {
        if (typeof this.options.resetOnError !== "function" || this.options.resetOnError(...args)) {
          this.reset();
        }
      });
    }
    this.$storage.syncUniversal("strategy", this.options.defaultStrategy, { cookie: this.$state.loggedIn });
    if (!this.getStrategy(false)) {
      this.$storage.setUniversal("strategy", this.options.defaultStrategy, { cookie: this.$state.loggedIn });
      if (!this.getStrategy(false)) {
        return Promise.resolve();
      }
    }
    try {
      await this.mounted();
    } catch (error) {
      this.callOnError(error);
    } finally {
      if (process.client && this.options.watchLoggedIn) {
        const enableTokenValidation = !this.#tokenValidationInterval && this.refreshStrategy.token && this.options.tokenValidationInterval;
        this.$storage.watchState("loggedIn", (loggedIn) => {
          if (hasOwn(this.ctx.$router.currentRoute.value.meta, "auth") && !routeMeta(this.ctx.$router.currentRoute.value, "auth", false)) {
            this.redirect(loggedIn ? "home" : "logout");
          }
          if (enableTokenValidation && loggedIn) {
            this.#checkTokenValidation();
          }
        });
        if (enableTokenValidation && this.loggedIn) {
          this.#checkTokenValidation();
        }
      }
    }
  }
  registerStrategy(name, strategy) {
    this.strategies[name] = strategy;
  }
  async setStrategy(name) {
    if (name === this.$storage.getUniversal("strategy")) {
      return Promise.resolve();
    }
    if (!this.strategies[name]) {
      throw new Error(`Strategy ${name} is not defined!`);
    }
    this.reset();
    this.$storage.setUniversal("strategy", name, { cookie: this.$state.loggedIn });
    return this.mounted();
  }
  async mounted(...args) {
    if (!this.strategy.mounted) {
      return this.fetchUserOnce();
    }
    return Promise.resolve(this.strategy.mounted(...args)).catch(
      (error) => {
        this.callOnError(error, { method: "mounted" });
        return Promise.reject(error);
      }
    );
  }
  async loginWith(name, ...args) {
    return this.setStrategy(name).then(() => this.login(...args));
  }
  async login(...args) {
    if (!this.strategy.login) {
      return Promise.resolve();
    }
    return this.wrapLogin(this.strategy.login(...args)).catch(
      (error) => {
        this.callOnError(error, { method: "login" });
        return Promise.reject(error);
      }
    );
  }
  async fetchUser(...args) {
    if (!this.strategy.fetchUser) {
      return Promise.resolve();
    }
    return Promise.resolve(this.strategy.fetchUser(...args)).catch(
      (error) => {
        this.callOnError(error, { method: "fetchUser" });
        return Promise.reject(error);
      }
    );
  }
  async logout(...args) {
    this.$storage.removeCookie("strategy");
    if (!this.strategy.logout) {
      this.reset();
      return Promise.resolve();
    }
    return Promise.resolve(this.strategy.logout(...args)).catch(
      (error) => {
        this.callOnError(error, { method: "logout" });
        return Promise.reject(error);
      }
    );
  }
  // ---------------------------------------------------------------
  // User helpers
  // ---------------------------------------------------------------
  async setUserToken(token, refreshToken) {
    if (!this.tokenStrategy.setUserToken) {
      this.tokenStrategy.token.set(token);
      return Promise.resolve();
    }
    return Promise.resolve(this.tokenStrategy.setUserToken(token, refreshToken)).catch((error) => {
      this.callOnError(error, { method: "setUserToken" });
      return Promise.reject(error);
    });
  }
  reset(...args) {
    if (this.tokenStrategy.token && !this.strategy.reset) {
      this.setUser(false);
      this.tokenStrategy.token.reset();
      this.refreshStrategy.refreshToken.reset();
    }
    return this.strategy.reset(...args);
  }
  async refreshTokens() {
    if (!this.refreshStrategy.refreshController) {
      return Promise.resolve();
    }
    return Promise.resolve(this.refreshStrategy.refreshController.handleRefresh()).catch((error) => {
      this.callOnError(error, { method: "refreshTokens" });
      return Promise.reject(error);
    });
  }
  check(...args) {
    if (!this.strategy.check) {
      return { valid: true };
    }
    return this.strategy.check(...args);
  }
  async fetchUserOnce(...args) {
    if (!this.$state.user) {
      return this.fetchUser(...args);
    }
    return Promise.resolve();
  }
  // ---------------------------------------------------------------
  // Utils
  // ---------------------------------------------------------------
  setUser(user, schemeCheck = true) {
    this.$storage.setState("user", user);
    let check = { valid: Boolean(user) };
    if (schemeCheck && check.valid) {
      check = this.check();
    }
    this.$storage.setState("loggedIn", check.valid);
  }
  async request(endpoint, defaults = {}) {
    const request = typeof defaults === "object" ? Object.assign({}, defaults, endpoint) : endpoint;
    if (request.baseURL === "") {
      request.baseURL = requrl(process.server ? this.ctx.ssrContext.event.node.req : void 0);
    }
    if (!this.ctx.$http) {
      return Promise.reject(new Error("[AUTH] add the @nuxt-alt/http module to nuxt.config file"));
    }
    const $http = process.server && this.ctx.ssrContext ? this.ctx.ssrContext.event.$http.raw(request) : this.ctx.$http.raw(request);
    return $http.catch((error) => {
      this.callOnError(error, { method: "request" });
      return Promise.reject(error);
    });
  }
  async requestWith(endpoint, defaults) {
    const request = Object.assign({}, defaults, endpoint);
    if (this.tokenStrategy.token) {
      const token = this.tokenStrategy.token.get();
      const tokenName = this.tokenStrategy.options.token.name || "Authorization";
      if (!request.headers) {
        request.headers = {};
      }
      if (!request.headers[tokenName] && isSet(token) && token && typeof token === "string") {
        request.headers[tokenName] = token;
      }
    }
    return this.request(request);
  }
  async wrapLogin(promise) {
    this.$storage.setState("busy", true);
    this.error = void 0;
    return Promise.resolve(promise).then((response) => {
      this.$storage.setState("busy", false);
      this.$storage.syncUniversal("strategy", this.strategy.name);
      return response;
    }).catch((error) => {
      this.$storage.setState("busy", false);
      return Promise.reject(error);
    });
  }
  onError(listener) {
    this.#errorListeners.push(listener);
  }
  callOnError(error, payload = {}) {
    this.error = error;
    for (const fn of this.#errorListeners) {
      fn(error, payload);
    }
  }
  /**
   *
   * @param name redirect name
   * @param route (default: false) Internal useRoute() (false) or manually specify
   * @param router (default: true) Whether to use nuxt redirect (true) or window redirect (false)
   *
   * @returns
   */
  redirect(name, route = false, router = true) {
    if (!this.options.redirect) {
      return;
    }
    let to = this.options.redirect[name];
    if (!to) {
      return;
    }
    const currentRoute = this.ctx.$router.currentRoute.value;
    const nuxtRoute = this.options.fullPathRedirect ? currentRoute.fullPath : currentRoute.path;
    const from = route ? this.options.fullPathRedirect ? route.fullPath : route.path : nuxtRoute;
    const queryReturnTo = currentRoute.query.to;
    if (this.options.rewriteRedirects) {
      if (["logout", "login"].includes(name) && isRelativeURL(from) && !isSamePath(to, from)) {
        if (this.options.redirectStrategy === "query") {
          to = to + "?to=" + encodeURIComponent(queryReturnTo ? queryReturnTo : from);
        }
        if (this.options.redirectStrategy === "storage") {
          this.$storage.setUniversal("redirect", from);
        }
      }
      if (name === "home") {
        let redirect = currentRoute.query.to ? decodeURIComponent(currentRoute.query.to) : void 0;
        if (this.options.redirectStrategy === "storage") {
          redirect = this.$storage.getUniversal("redirect");
          this.$storage.setUniversal("redirect", null);
        }
        if (redirect) {
          to = redirect;
        }
      }
    }
    to = this.callOnRedirect(to, from) || to;
    if (isSamePath(to, from)) {
      return;
    }
    if (this.options.redirectStrategy === "storage") {
      if (this.options.fullPathRedirect) {
        to = withQuery(to, currentRoute.query);
      }
    }
    if (process.client && (!router || !isRelativeURL(to))) {
      return globalThis.location.replace(to);
    } else {
      return this.ctx.$router.push(typeof this.ctx.$localePath === "function" ? this.ctx.$localePath(to) : to);
    }
  }
  onRedirect(listener) {
    this.#redirectListeners.push(listener);
  }
  callOnRedirect(to, from) {
    for (const fn of this.#redirectListeners) {
      to = fn(to, from) || to;
    }
    return to;
  }
  hasScope(scope) {
    const userScopes = this.$state.user && getProp(this.$state.user, this.options.scopeKey);
    if (!userScopes) {
      return false;
    }
    if (Array.isArray(userScopes)) {
      return userScopes.includes(scope);
    }
    return Boolean(getProp(userScopes, scope));
  }
}
