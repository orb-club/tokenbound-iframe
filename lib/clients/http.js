// lib/clients/http.js
/**
 * Native-fetch HTTP client that preserves the public surface and runtime
 * semantics of the previous `axios` client. This is the org-wide template for
 * migrating off axios (see orb-club/web-login#32), so the behaviour is
 * intentionally axios-compatible:
 *
 *  - THROWS on non-2xx responses (fetch resolves on 4xx/5xx; axios rejects).
 *    Thrown errors carry an axios-shaped `response = { status, data, headers }`
 *    so existing `catch (e) { e.response?.status }` call sites keep working.
 *  - Auto-parses JSON response bodies (guarding empty / non-JSON bodies),
 *    returning `{ data, status, headers, config }` like an axios response.
 *  - Applies a `baseURL`, default headers, `params` -> URLSearchParams,
 *    `data` -> JSON body, and an optional `timeout` via AbortSignal.timeout.
 *
 * NOTE: this repo's previous axios usage had NO interceptors (no auth-token
 * injection, no 401/refresh), so none are ported here — unlike web-login,
 * which had request/response interceptors that were ported verbatim.
 */

/**
 * axios-shaped error. Existing call sites read `error.response?.status` and
 * `error.response?.data`, so we replicate that shape exactly.
 */
export class HttpError extends Error {
  constructor(message, response, config) {
    super(message);
    this.name = "HttpError";
    this.response = response;
    this.config = config;
  }
}

const buildUrl = (baseURL, url = "", params) => {
  // axios joins baseURL + url; an empty url posts to baseURL itself.
  let full = url;
  if (baseURL) {
    if (!url) full = baseURL;
    else if (/^https?:\/\//i.test(url)) full = url; // absolute url overrides baseURL
    else full = `${baseURL.replace(/\/$/, "")}/${url.replace(/^\//, "")}`;
  }
  if (params && Object.keys(params).length > 0) {
    const search = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value === undefined || value === null) continue;
      search.append(key, String(value));
    }
    const qs = search.toString();
    if (qs) full += (full.includes("?") ? "&" : "?") + qs;
  }
  return full;
};

const parseBody = async (res) => {
  // axios auto-parses JSON; fetch does not. Guard empty / non-JSON bodies so a
  // 204 or an HTML error page does not blow up on res.json().
  const text = await res.text();
  if (!text) return undefined;
  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  }
  // Best-effort JSON parse for servers that omit the content-type header.
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

export const createHttpClient = (options = {}) => {
  const { baseURL = "", headers: defaultHeaders = {}, timeout } = options;

  const request = async (config) => {
    const method = (config.method || "GET").toUpperCase();

    const headers = { ...defaultHeaders, ...(config.headers || {}) };

    // Body handling: strings are sent verbatim (already-serialised payloads),
    // objects are JSON.stringify'd with a JSON content-type.
    let body;
    if (
      config.data !== undefined &&
      config.data !== null &&
      method !== "GET" &&
      method !== "HEAD"
    ) {
      if (typeof config.data === "string") {
        body = config.data;
      } else {
        body = JSON.stringify(config.data);
        if (!headers["Content-Type"]) headers["Content-Type"] = "application/json";
      }
    }

    const effectiveTimeout = config.timeout ?? timeout;
    const signal =
      effectiveTimeout !== undefined ? AbortSignal.timeout(effectiveTimeout) : undefined;

    const finalUrl = buildUrl(baseURL, config.url, config.params);

    const res = await fetch(finalUrl, { method, headers, body, signal });
    const data = await parseBody(res);

    // axios THROWS on non-2xx; fetch does not. Replicate the throw + shape.
    if (!res.ok) {
      throw new HttpError(
        `Request failed with status code ${res.status}`,
        { status: res.status, data, headers: res.headers },
        config
      );
    }

    return { data, status: res.status, headers: res.headers, config };
  };

  return {
    request,
    get: (url, config) => request({ ...config, url, method: "GET" }),
    post: (url, data, config) => request({ ...config, url, method: "POST", data }),
    put: (url, data, config) => request({ ...config, url, method: "PUT", data }),
    delete: (url, config) => request({ ...config, url, method: "DELETE" }),
  };
};

/**
 * Default client with no baseURL — drop-in replacement for top-level
 * `axios.get` / `axios.post` calls, which always pass an absolute URL.
 */
export const httpClient = createHttpClient();

export default httpClient;
