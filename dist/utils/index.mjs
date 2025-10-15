export const isUnset = (o) => typeof o === "undefined" || o === null;
export const isSet = (o) => !isUnset(o);
export function parseQuery(queryString) {
  const query = {};
  const pairs = queryString.split("&");
  for (let i = 0; i < pairs.length; i++) {
    const pair = pairs[i].split("=");
    query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || "");
  }
  return query;
}
export function isRelativeURL(u) {
  return u && u.length && new RegExp(["^\\/([a-zA-Z0-9@\\-%_~.:]", "[/a-zA-Z0-9@\\-%_~.:]*)?", "([?][^#]*)?(#[^#]*)?$"].join("")).test(u);
}
export function routeMeta(route, key, value) {
  return route.meta[key] === value;
}
export function getMatchedComponents(route, matches = []) {
  return [
    ...route.matched.map(function(m, index) {
      return Object.keys(m.components).map(function(key) {
        matches.push(index);
        return m.components[key];
      });
    })
  ];
}
export function normalizePath(path = "", ctx) {
  let result = path.split("?")[0];
  if (ctx.$config.app.baseURL) {
    result = result.replace(ctx.$config.app.baseURL, "/");
  }
  if (result.charAt(result.length - 1) === "/") {
    result = result.slice(0, -1);
  }
  result = result.replace(/\/+/g, "/");
  return result;
}
export function encodeValue(val) {
  if (typeof val === "string") {
    return val;
  }
  return JSON.stringify(val);
}
export function decodeValue(val) {
  if (typeof val === "string") {
    try {
      return JSON.parse(val);
    } catch (_) {
    }
  }
  return val;
}
export function getProp(holder, propName) {
  if (isJSON(holder)) {
    holder = JSON.parse(holder);
  }
  if (!propName || !holder || typeof holder !== "object") {
    return holder;
  }
  if (propName in holder) {
    return holder[propName];
  }
  const propParts = Array.isArray(propName) ? propName : propName.split(".");
  let result = holder;
  for (let part of propParts) {
    if (result[part] === void 0) {
      return void 0;
    }
    result = result[part];
  }
  return result;
}
function isJSON(str) {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
}
export function addTokenPrefix(token, tokenType) {
  if (!token || !tokenType || typeof token !== "string" || token.startsWith(tokenType)) {
    return token;
  }
  return tokenType + " " + token;
}
export function removeTokenPrefix(token, tokenType) {
  if (!token || !tokenType || typeof token !== "string") {
    return token;
  }
  return token.replace(tokenType + " ", "");
}
export function cleanObj(obj) {
  for (const key in obj) {
    if (obj[key] === void 0) {
      delete obj[key];
    }
  }
  return obj;
}
export function randomString(length) {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}
export function setH3Cookie(event, serializedCookie) {
  let cookies = event.node.res.getHeader("Set-Cookie") || [];
  if (!Array.isArray(cookies)) cookies = [cookies];
  cookies.unshift(serializedCookie);
  if (!event.node.res.headersSent) {
    event.node.res.setHeader("Set-Cookie", cookies.filter(
      (value, index, items) => items.findIndex(
        (val) => val.startsWith(value.slice(0, value.indexOf("=")))
      ) === index
    ));
  }
}
export const hasOwn = (object, key) => Object.hasOwn ? Object.hasOwn(object, key) : Object.prototype.hasOwnProperty.call(object, key);
