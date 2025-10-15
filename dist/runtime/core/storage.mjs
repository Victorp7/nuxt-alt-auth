import { defineStore } from "pinia";
import { isUnset, isSet, decodeValue, encodeValue, setH3Cookie } from "../../utils";
import { parse, serialize } from "cookie-es";
import { watch } from "vue";
import { useState } from "#imports";
export class Storage {
  ctx;
  options;
  #PiniaStore;
  #initPiniaStore;
  #initStore;
  state;
  #internal;
  memory;
  #piniaEnabled = false;
  constructor(ctx, options) {
    this.ctx = ctx;
    this.options = options;
    this.state = options.initialState;
    this.#initState();
  }
  // ------------------------------------
  // Universal
  // ------------------------------------
  setUniversal(key, value, include = { cookie: true, session: true, local: true }) {
    if (isUnset(value)) {
      return this.removeUniversal(key);
    }
    const storeMethods = {
      cookie: (k, v, o) => this.setCookie(k, v, o),
      session: (k, v) => this.setSessionStorage(k, v),
      local: (k, v) => this.setLocalStorage(k, v)
    };
    Object.entries(include).filter(([_, shouldInclude]) => shouldInclude).forEach(([method, opts]) => {
      if (method === "cookie" && typeof opts === "object") {
        return storeMethods[method]?.(key, value, opts);
      }
      return storeMethods[method]?.(key, value);
    });
    this.setState(key, value);
    return value;
  }
  getUniversal(key) {
    const sourceOrder = [
      () => this.getCookie(key),
      () => this.getLocalStorage(key),
      () => this.getSessionStorage(key),
      () => this.getState(key)
    ];
    if (process.server) {
      sourceOrder.unshift(() => this.getState(key));
    }
    for (let getter of sourceOrder) {
      const value = getter();
      if (!isUnset(value)) {
        return value;
      }
    }
  }
  syncUniversal(key, defaultValue, include = { cookie: true, session: true, local: true }) {
    let value = this.getUniversal(key);
    if (isUnset(value) && isSet(defaultValue)) {
      value = defaultValue;
    }
    if (isSet(value)) {
      this.getCookie(key) ? this.setUniversal(key, value, { ...include, cookie: false }) : this.setUniversal(key, value, include);
    }
    return value;
  }
  removeUniversal(key) {
    this.removeState(key);
    this.removeCookie(key);
    this.removeLocalStorage(key);
    this.removeSessionStorage(key);
  }
  // ------------------------------------
  // Local state (reactive)
  // ------------------------------------
  async #initState() {
    const pinia = this.ctx.$pinia;
    this.#piniaEnabled = this.options.stores.pinia?.enabled && !!pinia;
    if (this.#piniaEnabled) {
      this.#PiniaStore = defineStore(this.options.stores.pinia?.namespace, {
        state: () => ({ ...this.options.initialState })
      });
      this.#initPiniaStore = this.#PiniaStore(pinia);
      this.state = this.#initPiniaStore;
    } else {
      this.#initStore = useState(this.options.stores.state?.namespace, () => ({
        ...this.options.initialState
      }));
      this.state = this.#initStore.value;
    }
    this.#internal = useState("auth-internal", () => ({}));
    this.memory = this.#internal.value;
  }
  get pinia() {
    return this.#initPiniaStore;
  }
  get store() {
    return this.#initStore;
  }
  setState(key, value) {
    if (key.startsWith("_")) {
      this.memory[key] = value;
    } else if (this.#piniaEnabled) {
      this.#initPiniaStore.$patch({ [key]: value });
    } else {
      this.state[key] = value;
    }
    return this.state[key];
  }
  getState(key) {
    if (!key.startsWith("_")) {
      return this.state[key];
    } else {
      return this.memory[key];
    }
  }
  watchState(watchKey, fn) {
    if (this.#piniaEnabled) {
      watch(() => this.#initPiniaStore?.[watchKey], (modified) => {
        fn(modified);
      }, { deep: true });
    } else {
      watch(() => this.#initStore?.value?.[watchKey], (modified) => {
        fn(modified);
      }, { deep: true });
    }
  }
  removeState(key) {
    this.setState(key, void 0);
  }
  // ------------------------------------
  // Local storage
  // ------------------------------------
  setLocalStorage(key, value) {
    if (isUnset(value)) {
      return this.removeLocalStorage(key);
    }
    if (!this.isLocalStorageEnabled()) return;
    try {
      const prefixedKey = `${this.options.stores.local?.prefix}${key}`;
      localStorage.setItem(prefixedKey, encodeValue(value));
    } catch (e) {
      if (!this.options.ignoreExceptions) throw e;
    }
    return value;
  }
  getLocalStorage(key) {
    if (!this.isLocalStorageEnabled()) {
      return;
    }
    const prefixedKey = `${this.options.stores.local?.prefix}${key}`;
    return decodeValue(localStorage.getItem(prefixedKey));
  }
  removeLocalStorage(key) {
    if (!this.isLocalStorageEnabled()) {
      return;
    }
    const prefixedKey = `${this.options.stores.local?.prefix}${key}`;
    localStorage.removeItem(prefixedKey);
  }
  isLocalStorageEnabled() {
    const isNotServer = !process.server;
    const isConfigEnabled = this.options.stores.local?.enabled;
    const localTest = "test";
    if (isNotServer && isConfigEnabled) {
      try {
        localStorage.setItem(localTest, localTest);
        localStorage.removeItem(localTest);
        return true;
      } catch (e) {
        if (!this.options.ignoreExceptions) {
          console.warn("[AUTH] Local storage is enabled in config, but the browser does not support it.");
        }
      }
    }
    return false;
  }
  // ------------------------------------
  // Session storage
  // ------------------------------------
  setSessionStorage(key, value) {
    if (isUnset(value)) {
      return this.removeSessionStorage(key);
    }
    if (!this.isSessionStorageEnabled()) return;
    try {
      const prefixedKey = `${this.options.stores.session.prefix}${key}`;
      sessionStorage.setItem(prefixedKey, encodeValue(value));
    } catch (e) {
      if (!this.options.ignoreExceptions) throw e;
    }
    return value;
  }
  getSessionStorage(key) {
    if (!this.isSessionStorageEnabled()) {
      return;
    }
    const prefixedKey = this.options.stores.session.prefix + key;
    const value = sessionStorage.getItem(prefixedKey);
    return decodeValue(value);
  }
  removeSessionStorage(key) {
    if (!this.isSessionStorageEnabled()) {
      return;
    }
    const prefixedKey = this.options.stores.session.prefix + key;
    sessionStorage.removeItem(prefixedKey);
  }
  isSessionStorageEnabled() {
    const isNotServer = !process.server;
    const isConfigEnabled = this.options.stores.session?.enabled;
    const testKey = "test";
    if (isNotServer && isConfigEnabled) {
      try {
        sessionStorage.setItem(testKey, testKey);
        sessionStorage.removeItem(testKey);
        return true;
      } catch (e) {
        if (!this.options.ignoreExceptions) {
          console.warn("[AUTH] Session storage is enabled in config, but the browser does not support it.");
        }
      }
    }
    return false;
  }
  // ------------------------------------
  // Cookie Storage
  // ------------------------------------
  setCookie(key, value, options = {}) {
    if (!this.isCookiesEnabled()) {
      return;
    }
    const prefix = this.options.stores.cookie?.prefix;
    const prefixedKey = `${prefix}${key}`;
    const $value = encodeValue(value);
    const $options = { ...this.options.stores.cookie?.options, ...options };
    const cookieString = serialize(prefixedKey, $value, $options);
    if (process.client) {
      document.cookie = cookieString;
    } else if (process.server && this.ctx.ssrContext?.event.node.res) {
      setH3Cookie(this.ctx.ssrContext.event, cookieString);
    }
  }
  getCookies() {
    if (!this.isCookiesEnabled()) {
      return;
    }
    const cookieStr = process.client ? document.cookie : this.ctx.ssrContext.event.node.req.headers.cookie;
    return parse(cookieStr || "") || {};
  }
  getCookie(key) {
    if (!this.isCookiesEnabled()) {
      return;
    }
    const prefixedKey = this.options.stores.cookie?.prefix + key;
    const cookies = this.getCookies();
    return decodeValue(cookies[prefixedKey] ? decodeURIComponent(cookies[prefixedKey]) : void 0);
  }
  removeCookie(key, options) {
    this.setCookie(key, void 0, options);
  }
  isCookiesEnabled() {
    const isNotClient = process.server;
    const isConfigEnabled = this.options.stores.cookie?.enabled;
    if (isConfigEnabled) {
      if (isNotClient || window.navigator.cookieEnabled) return true;
      console.warn("[AUTH] Cookies are enabled in config, but the browser does not support it.");
    }
    return false;
  }
}
