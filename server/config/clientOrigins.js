const defaultClientOrigin = "http://localhost:5173";
const allowedOrigins = new Set([
  process.env.CLIENT_URL || defaultClientOrigin
]);

if (process.env.NODE_ENV !== "production") {
  allowedOrigins.add(defaultClientOrigin);
  allowedOrigins.add("http://127.0.0.1:5173");
}

function isAllowedOrigin(origin) {
  return typeof origin === "string" && allowedOrigins.has(origin);
}

module.exports = { isAllowedOrigin };
