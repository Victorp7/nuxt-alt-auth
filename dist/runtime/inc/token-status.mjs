export var TokenStatusEnum = /* @__PURE__ */ ((TokenStatusEnum2) => {
  TokenStatusEnum2["UNKNOWN"] = "UNKNOWN";
  TokenStatusEnum2["VALID"] = "VALID";
  TokenStatusEnum2["EXPIRED"] = "EXPIRED";
  return TokenStatusEnum2;
})(TokenStatusEnum || {});
export class TokenStatus {
  #status;
  #isHttpOnly;
  constructor(token, tokenExpiresAt, httpOnly = false) {
    this.#status = this.#calculate(token, tokenExpiresAt);
    this.#isHttpOnly = httpOnly;
  }
  unknown() {
    return "UNKNOWN" /* UNKNOWN */ === this.#status;
  }
  valid() {
    return "VALID" /* VALID */ === this.#status;
  }
  expired() {
    return "EXPIRED" /* EXPIRED */ === this.#status;
  }
  #calculate(token, tokenExpiresAt) {
    const now = Date.now();
    try {
      if (this.#isHttpOnly && !tokenExpiresAt || (!this.#isHttpOnly && !token || !tokenExpiresAt)) {
        return "UNKNOWN" /* UNKNOWN */;
      }
    } catch (error) {
      return "UNKNOWN" /* UNKNOWN */;
    }
    const timeSlackMillis = 500;
    tokenExpiresAt -= timeSlackMillis;
    if (now < tokenExpiresAt) {
      return "VALID" /* VALID */;
    }
    return "EXPIRED" /* EXPIRED */;
  }
}
