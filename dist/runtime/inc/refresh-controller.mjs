export class RefreshController {
  constructor(scheme) {
    this.scheme = scheme;
    this.$auth = scheme.$auth;
  }
  $auth;
  #refreshPromise = null;
  // Multiple requests will be queued until the first has completed token refresh.
  handleRefresh() {
    if (this.#refreshPromise) {
      return this.#refreshPromise;
    }
    return this.#doRefresh();
  }
  // Returns a promise which is resolved when refresh is completed
  // Call this function when you intercept a request with an expired token.
  #doRefresh() {
    this.#refreshPromise = new Promise((resolve, reject) => {
      this.scheme.refreshTokens().then((response) => {
        this.#refreshPromise = null;
        resolve(response);
      }).catch((error) => {
        this.#refreshPromise = null;
        reject(error);
      });
    });
    return this.#refreshPromise;
  }
}
