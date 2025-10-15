import { LocalScheme } from "./local.mjs";
import { getProp } from "../../utils";
const DEFAULTS = {
  name: "cookie",
  cookie: {
    name: void 0
  },
  endpoints: {
    csrf: false
  },
  token: {
    type: false,
    property: "",
    maxAge: false,
    global: false,
    required: false
  },
  user: {
    property: false,
    autoFetch: true
  }
};
export class CookieScheme extends LocalScheme {
  checkStatus = false;
  constructor($auth, options) {
    super($auth, options, DEFAULTS);
  }
  async mounted() {
    if (process.server) {
      this.$auth.ctx.$http.setHeader("referer", this.$auth.ctx.ssrContext.event.node.req.headers.host);
    }
    if (this.options.token?.type) {
      return super.mounted();
    }
    this.checkStatus = true;
    return this.$auth.fetchUserOnce();
  }
  check() {
    const response = { valid: false };
    if (!super.check().valid && this.options.token?.type) {
      return response;
    }
    if (!this.checkStatus) {
      response.valid = true;
      return response;
    }
    if (this.options.cookie.name) {
      const cookies = this.$auth.$storage.getCookies();
      response.valid = Boolean(cookies[this.options.cookie.name]);
      return response;
    }
    response.valid = true;
    return response;
  }
  async login(endpoint) {
    this.$auth.reset();
    if (this.options.endpoints.csrf) {
      await this.$auth.request(this.options.endpoints.csrf);
    }
    if (this.options.token?.type) {
      return super.login(endpoint, { reset: false });
    }
    if (!this.options.endpoints.login) {
      return;
    }
    if (this.options.ssr) {
      endpoint.baseURL = "";
    }
    const response = await this.$auth.request(endpoint, this.options.endpoints.login);
    if (this.options.user.autoFetch) {
      if (this.checkStatus) {
        this.checkStatus = false;
      }
      await this.fetchUser();
    }
    return response;
  }
  async fetchUser(endpoint) {
    if (!this.check().valid) {
      return Promise.resolve();
    }
    if (!this.options.endpoints.user) {
      this.$auth.setUser({});
      return Promise.resolve();
    }
    if (this.checkStatus) {
      this.checkStatus = false;
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
  reset() {
    if (this.options.cookie.name) {
      this.$auth.$storage.setCookie(this.options.cookie.name, null);
    }
    if (this.options.token?.type) {
      return super.reset();
    }
    this.$auth.setUser(false);
  }
}
