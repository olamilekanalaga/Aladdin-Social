import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
const configuredKey = process.env.ALADDIN_SOCIAL_DEMO_SESSION_SECRET;
if (process.env.VERCEL && !configuredKey)
  throw new Error(
    "Configure ALADDIN_SOCIAL_DEMO_SESSION_SECRET before deploying the demo API.",
  );
const key = configuredKey || randomBytes(32).toString("hex");
export function encodeSession(session) {
  const payload = Buffer.from(JSON.stringify(session)).toString("base64url");
  const signature = createHmac("sha256", key)
    .update(payload)
    .digest("base64url");
  return `${payload}.${signature}`;
}
export function decodeSession(cookie) {
  try {
    if (typeof cookie !== "string" || cookie.length > 3800) return null;
    const [payload, signature, ...extra] = cookie.split(".");
    if (
      extra.length ||
      !payload ||
      !signature ||
      !/^[a-zA-Z0-9_-]{43}$/.test(signature)
    )
      return null;
    const expected = createHmac("sha256", key)
      .update(payload)
      .digest("base64url");
    if (!timingSafeEqual(Buffer.from(signature), Buffer.from(expected)))
      return null;
    const value = JSON.parse(Buffer.from(payload, "base64url").toString());
    if (
      !value ||
      value.expires < Date.now() ||
      !Number.isFinite(value.expires) ||
      !["social", "wallet"].includes(value.identity) ||
      !["basic", "intelligence", "opportunities"].includes(value.plan) ||
      typeof value.csrf !== "string" ||
      !Array.isArray(value.receipts)
    )
      return null;
    return value;
  } catch {
    return null;
  }
}
export function saveSession(req, res, session) {
  res.cookie("aladdin_session", encodeSession(session), {
    httpOnly: true,
    sameSite: "strict",
    secure: Boolean(process.env.VERCEL) || req.secure,
    maxAge: Math.max(0, session.expires - Date.now()),
    path: "/",
  });
  res.set("Cache-Control", "private, no-store");
}
