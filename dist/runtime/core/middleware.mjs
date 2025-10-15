import { routeMeta, getMatchedComponents, hasOwn, normalizePath } from "../../utils";
import { useAuth, useNuxtApp, defineNuxtRouteMiddleware } from "#imports";
export default defineNuxtRouteMiddleware(async (to, from) => {
  if (hasOwn(to.meta, "auth") && routeMeta(to, "auth", false)) {
    return;
  }
  const matches = [];
  const Components = getMatchedComponents(to, matches);
  if (!Components.length) {
    return;
  }
  const auth = useAuth();
  const ctx = useNuxtApp();
  const { login, callback } = auth.options.redirect;
  const pageIsInGuestMode = hasOwn(to.meta, "auth") && routeMeta(to, "auth", "guest");
  const insidePage = (page) => normalizePath(to.path, ctx) === normalizePath(page, ctx);
  if (auth.$state.loggedIn) {
    const { tokenExpired, refreshTokenExpired, isRefreshable } = auth.check(true);
    if (!login || insidePage(login) || pageIsInGuestMode) {
      return auth.redirect("home", to);
    }
    if (refreshTokenExpired) {
      auth.reset();
      return auth.redirect("login", to);
    } else if (tokenExpired) {
      if (isRefreshable) {
        try {
          await auth.refreshTokens();
        } catch (error) {
          auth.reset();
          return auth.redirect("login", to);
        }
      } else {
        auth.reset();
        return auth.redirect("login", to);
      }
    }
  } else if (!pageIsInGuestMode && (!callback || !insidePage(callback))) {
    return auth.redirect("login", to);
  }
});
