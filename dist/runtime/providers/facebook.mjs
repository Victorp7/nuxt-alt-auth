import { assignDefaults } from "../../utils/provider";
import { OAUTH2DEFAULTS } from "../inc/index.mjs";
export function facebook(nuxt, strategy) {
  const DEFAULTS = Object.assign(OAUTH2DEFAULTS, {
    scheme: "oauth2",
    endpoints: {
      authorization: "https://facebook.com/v2.12/dialog/oauth",
      userInfo: "https://graph.facebook.com/v2.12/me?fields=about,name,picture{url},email"
    },
    scope: ["public_profile", "email"]
  });
  assignDefaults(strategy, DEFAULTS);
}
