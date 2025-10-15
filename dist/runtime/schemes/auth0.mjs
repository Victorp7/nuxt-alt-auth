import { withQuery } from "ufo";
import { Oauth2Scheme } from "../schemes/oauth2.mjs";
export class Auth0Scheme extends Oauth2Scheme {
  logout() {
    this.$auth.reset();
    const opts = {
      client_id: this.options.clientId,
      returnTo: this.logoutRedirectURI
    };
    const url = withQuery(this.options.endpoints.logout, opts);
    window.location.replace(url);
  }
}
