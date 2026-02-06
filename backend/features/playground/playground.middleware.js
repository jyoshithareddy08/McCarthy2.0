/**
 * Sets req.user for playground routes.
 * Uses X-User-Id header (dev) or PLAYGROUND_DEMO_USER_ID env.
 * Create a user in DB and set their _id in .env for playground to work.
 */
export const withPlaygroundUser = (req, res, next) => {
  const userId = req.headers["x-user-id"] || process.env.PLAYGROUND_DEMO_USER_ID;
  if (!userId) {
    return res.status(401).json({
      error: "User context required. Set X-User-Id header or PLAYGROUND_DEMO_USER_ID in env.",
    });
  }
  req.user = { id: userId };
  next();
};
