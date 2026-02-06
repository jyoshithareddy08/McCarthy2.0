const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

const defaultHeaders = () => {
  const uid =
    import.meta.env.VITE_PLAYGROUND_USER_ID ||
    (typeof localStorage !== "undefined" && JSON.parse(localStorage.getItem("mccarthy_user") || "{}")?.id);
  const h = {};
  if (uid) h["X-User-Id"] = uid;
  return h;
};

export const api = {
  get: (path) =>
    fetch(`${BASE}${path}`).then((r) => {
      if (!r.ok) throw new Error(r.statusText || "Request failed");
      return r.json();
    }),

  post: (path, body, opts = {}) => {
    const headers = { "Content-Type": "application/json", ...defaultHeaders(), ...opts.headers };
    return fetch(`${BASE}${path}`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    }).then(async (r) => {
      const data = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(data.error || r.statusText || "Request failed");
      return data;
    });
  },
};
