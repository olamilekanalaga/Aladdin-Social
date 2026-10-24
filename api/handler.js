import app from "../server/app.mjs";
/** Restore the API route explicitly so SPA rewrites cannot swallow API requests. */
export default function handler(req, res) {
  const parsed = new URL(req.url, "https://aladdin.invalid");
  const route = req.query?.__route || parsed.searchParams.get("__route");
  if (typeof route === "string") {
    parsed.searchParams.delete("__route");
    req.url = `/api/${route}${parsed.search}`;
  }
  return app(req, res);
}
