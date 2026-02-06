const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

const defaultHeaders = () => {
  let uid = import.meta.env.VITE_PLAYGROUND_USER_ID;
  
  if (!uid && typeof localStorage !== "undefined") {
    try {
      const user = JSON.parse(localStorage.getItem("mccarthy_user") || "{}");
      uid = user?.id || user?._id;
    } catch (e) {
      console.error("Error parsing user from localStorage:", e);
    }
  }
  
  const h = {};
  if (uid) {
    h["X-User-Id"] = String(uid);
  } else {
    console.warn("No user ID found for playground requests");
  }
  return h;
};

export const api = {
  get: (path, opts = {}) => {
    const headers = { ...defaultHeaders(), ...opts.headers };
    return fetch(`${BASE}${path}`, {
      method: "GET",
      headers,
    }).then(async (r) => {
      const data = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(data.error || r.statusText || "Request failed");
      return data;
    });
  },

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
