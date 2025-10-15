import { assignDefaults, addAuthorize } from "../../utils/provider";
import { OAUTH2DEFAULTS } from "../inc/index.mjs";
export function discord(nuxt, strategy) {
  const DEFAULTS = Object.assign(OAUTH2DEFAULTS, {
    scheme: "oauth2",
    endpoints: {
      authorization: "https://discord.com/api/oauth2/authorize",
      token: "https://discord.com/api/oauth2/token",
      userInfo: "https://discord.com/api/users/@me"
      //   logout: 'https://discord.com/api/oauth2/token/revoke' //TODO: add post method, because discord using the post method to logout
    },
    grantType: "authorization_code",
    codeChallengeMethod: "S256",
    scope: ["identify", "email"]
  });
  assignDefaults(strategy, DEFAULTS);
  addAuthorize(nuxt, strategy, true);
}
