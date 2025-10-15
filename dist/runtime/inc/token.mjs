import { addTokenPrefix } from "../../utils";
import { TokenStatus } from "./token-status.mjs";
import { jwtDecode } from "jwt-decode";
export class Token {
  scheme;
  $storage;
  constructor(scheme, storage) {
    this.scheme = scheme;
    this.$storage = storage;
  }
  get() {
    const key = this.scheme.options.token.prefix + this.scheme.name;
    return this.$storage.getUniversal(key);
  }
  set(tokenValue, expiresIn = false) {
    const token = addTokenPrefix(tokenValue, this.scheme.options.token.type);
    this.#setToken(token);
    this.#updateExpiration(token, expiresIn);
    if (typeof token === "string") {
      this.scheme.requestHandler.setHeader(token);
    }
    return token;
  }
  sync() {
    const token = this.#syncToken();
    this.#syncExpiration();
    if (typeof token === "string") {
      this.scheme.requestHandler.setHeader(token);
    }
    return token;
  }
  reset() {
    this.scheme.requestHandler.clearHeader();
    this.#resetSSRToken();
    this.#setToken(void 0);
    this.#setExpiration(void 0);
  }
  status() {
    return new TokenStatus(this.get(), this.#getExpiration(), this.scheme.options.token?.httpOnly);
  }
  #resetSSRToken() {
    if (this.scheme.options.ssr && this.scheme.options.token?.httpOnly) {
      const key = this.scheme.options.token.prefix + this.scheme.name;
      this.scheme.$auth.request({ baseURL: "", url: "/_auth/reset", body: new URLSearchParams({ token: key }), method: "POST" });
    }
  }
  #getExpiration() {
    const key = this.scheme.options.token.expirationPrefix + this.scheme.name;
    return this.$storage.getUniversal(key);
  }
  #setExpiration(expiration) {
    const key = this.scheme.options.token.expirationPrefix + this.scheme.name;
    return this.$storage.setUniversal(key, expiration);
  }
  #syncExpiration() {
    const key = this.scheme.options.token.expirationPrefix + this.scheme.name;
    return this.$storage.syncUniversal(key);
  }
  #updateExpiration(token, expiresIn) {
    let tokenExpiration;
    const tokenIssuedAtMillis = Date.now();
    const maxAge = expiresIn ? expiresIn : this.scheme.options.token.maxAge;
    const tokenTTLMillis = Number(maxAge) * 1e3;
    const tokenExpiresAtMillis = tokenTTLMillis ? tokenIssuedAtMillis + tokenTTLMillis : 0;
    try {
      tokenExpiration = jwtDecode(token).exp * 1e3 || tokenExpiresAtMillis;
    } catch (error) {
      tokenExpiration = tokenExpiresAtMillis;
      if (!(error && error.name === "InvalidTokenError")) {
        throw error;
      }
    }
    return this.#setExpiration(tokenExpiration || false);
  }
  #setToken(token) {
    const key = this.scheme.options.token.prefix + this.scheme.name;
    return this.$storage.setUniversal(key, token);
  }
  #syncToken() {
    const key = this.scheme.options.token.prefix + this.scheme.name;
    return this.$storage.syncUniversal(key);
  }
}
