import { assignAbsoluteEndpoints, assignDefaults, addLocalAuthorize } from "../../utils/provider";
import { LOCALDEFAULTS } from "../inc/index.mjs";
export function laravelSanctum(nuxt, strategy) {
  const { url } = strategy;
  if (!url) {
    throw new Error("URL is required with Laravel Sanctum!");
  }
  const endpointDefaults = {
    credentials: "include"
  };
  const DEFAULTS = Object.assign(LOCALDEFAULTS, {
    scheme: "cookie",
    name: "laravelSanctum",
    cookie: {
      name: "XSRF-TOKEN"
    },
    endpoints: {
      csrf: {
        ...endpointDefaults,
        url: "/sanctum/csrf-cookie"
      },
      login: {
        ...endpointDefaults,
        url: "/login"
      },
      refresh: {
        ...endpointDefaults,
        url: "/refresh"
      },
      logout: {
        ...endpointDefaults,
        url: "/logout"
      },
      user: {
        ...endpointDefaults,
        url: "/api/user"
      }
    },
    user: {
      property: false,
      autoFetch: true
    },
    token: {
      type: "Bearer"
    }
  });
  assignDefaults(strategy, DEFAULTS);
  assignAbsoluteEndpoints(strategy);
  if (strategy.ssr) {
    addLocalAuthorize(nuxt, strategy);
  }
}
