import { assignDefaults } from "../../utils/provider";
import { OAUTH2DEFAULTS } from "../inc/index.mjs";
export function auth0(nuxt, strategy) {
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
