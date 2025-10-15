import { assignDefaults } from "../../utils/provider";
import { OAUTH2DEFAULTS } from "../inc/index.mjs";
export function google(nuxt, strategy) {
  const DEFAULTS = Object.assign(OAUTH2DEFAULTS, {
    scheme: "oauth2",
    endpoints: {
      authorization: "https://accounts.google.com/o/oauth2/v2/auth",
      userInfo: "https://www.googleapis.com/oauth2/v3/userinfo"
    },
    scope: ["openid", "profile", "email"]
  });
  assignDefaults(strategy, DEFAULTS);
}
