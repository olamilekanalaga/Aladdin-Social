import express from "express";
import { randomBytes, timingSafeEqual } from "node:crypto";
import { decodeSession, saveSession } from "./session.mjs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const app = express();
app.disable("x-powered-by");
if (process.env.VERCEL) app.set("trust proxy", 1);
app.use(express.json({ limit: "20kb" }));
app.use("/api", (_req, res, next) => {
  res.set("Cache-Control", "private, no-store");
  next();
});
const devOrigins = new Set(["http://localhost:5173", "http://127.0.0.1:5173"]);
function originAllowed(req) {
  const origin = req.headers.origin;
  return (
    !origin ||
    origin === `${req.protocol}://${req.get("host")}` ||
    (process.env.NODE_ENV !== "production" && devOrigins.has(origin))
  );
}
const featureSets = {
  basic: [],
  intelligence: [
    "creator.identity",
    "wallet.relationships",
    "intelligence.export",
  ],
  opportunities: ["hiring.introduction"],
};
const privateRecords = {
  u1: {
    contact: "introductions+launchking@example.invalid",
    relationship:
      "Demo creator and attributable fee recipient; deployer ownership not established.",
    methodology:
      "Synthetic attributed fees exclude unrelated promoter wallets.",
  },
  u2: {
    contact: "introductions+marcellus@example.invalid",
    relationship: "Demo launch operator; fee recipient separate from deployer.",
    methodology: "Synthetic attribution based on opt-in seed records.",
  },
};
function session(req, res, next) {
  const id = req.headers.cookie
    ?.split(";")
    .map((s) => s.trim())
    .find((s) => s.startsWith("aladdin_session="))
    ?.slice(16);
  const s = decodeSession(id);
  if (!s || s.expires < Date.now())
    return res.status(401).json({ error: "A demo session is required." });
  s.features = featureSets[s.plan];
  req.session = s;
  next();
}
function mutation(req, res, next) {
  if (!originAllowed(req))
    return res.status(403).json({ error: "Origin rejected." });
  const csrf = req.headers["x-demo-csrf"];
  const expected = req.session?.csrf;
  if (
    typeof csrf !== "string" ||
    !expected ||
    !/^[a-f0-9]{48}$/.test(csrf) ||
    Buffer.byteLength(csrf) !== Buffer.byteLength(expected) ||
    !timingSafeEqual(Buffer.from(csrf), Buffer.from(expected))
  )
    return res.status(403).json({ error: "Session request token required." });
  next();
}
function requireFeature(feature) {
  return (req, res, next) =>
    req.session.features.includes(feature)
      ? next()
      : res.status(403).json({ error: "Feature access required.", feature });
}
function view(s) {
  return {
    mode: "demo",
    identity: s.identity,
    plan: s.plan,
    features: s.features,
    csrf: s.csrf,
    notice:
      "Simulated entitlements. No payment, X OAuth, wallet signature or real identity verification.",
  };
}
app.post("/api/session", (req, res) => {
  if (!originAllowed(req))
    return res.status(403).json({ error: "Origin rejected." });
  const s = {
    identity: req.body.identity === "wallet" ? "wallet" : "social",
    plan: "basic",
    features: [],
    csrf: randomBytes(24).toString("hex"),
    expires: Date.now() + 86400000,
    receipts: [],
  };
  saveSession(req, res, s);
  res.set("Cache-Control", "no-store").json(view(s));
});
app.get("/api/session", session, (req, res) =>
  res.set("Cache-Control", "no-store").json(view(req.session)),
);
app.post("/api/demo/access", session, mutation, (req, res) => {
  const plan = req.body.plan;
  if (!Object.hasOwn(featureSets, plan))
    return res.status(400).json({ error: "Unknown demo plan." });
  req.session.plan = plan;
  req.session.features = featureSets[plan];
  saveSession(req, res, req.session);
  res.json(view(req.session));
});
app.get(
  "/api/creators/:id/intelligence",
  session,
  requireFeature("wallet.relationships"),
  (req, res) => {
    const r = privateRecords[req.params.id];
    if (!r)
      return res.status(404).json({
        error: "No opted-in intelligence record for this demo creator.",
      });
    res.set("Cache-Control", "no-store").json({
      creatorId: req.params.id,
      relationship: r.relationship,
      methodology: r.methodology,
      verified: "fictional seed attestation",
      warning: "Not evidence of live wallet ownership.",
    });
  },
);
app.get(
  "/api/creators/:id/identity",
  session,
  requireFeature("creator.identity"),
  (req, res) => {
    if (!privateRecords[req.params.id])
      return res.status(404).json({ error: "No opted-in identity record." });
    res.set("Cache-Control", "no-store").json({
      creatorId: req.params.id,
      professionalAlias: "Opted-in demo creator " + req.params.id,
      availableFor: "Launch planning and community operations",
      consent: "Fictional opt-in attestation",
      privateContactDelivered: false,
    });
  },
);
app.get(
  "/api/intelligence/export",
  session,
  requireFeature("intelligence.export"),
  (req, res) =>
    res.set("Cache-Control", "no-store").json({
      mode: "demo",
      records: Object.entries(privateRecords).map(([creatorId, r]) => ({
        creatorId,
        relationship: r.relationship,
        methodology: r.methodology,
      })),
      license: "Prototype evaluation only",
    }),
);
app.post(
  "/api/introductions",
  session,
  mutation,
  requireFeature("hiring.introduction"),
  (req, res) => {
    const { creatorId, brief, budget } = req.body;
    if (
      !Object.hasOwn(privateRecords, creatorId) ||
      typeof brief !== "string" ||
      brief.trim().length < 20 ||
      brief.length > 2000 ||
      typeof budget !== "string" ||
      budget.length > 80
    )
      return res.status(400).json({
        error:
          "Choose an opted-in creator and provide a brief of 20–2000 characters.",
      });
    const request = {
      id: randomBytes(8).toString("hex"),
      creatorId,
      status: "Demo request recorded; no contact sent",
      createdAt: new Date().toISOString(),
    };
    req.session.receipts = [request, ...req.session.receipts].slice(0, 5);
    saveSession(req, res, req.session);
    res.status(201).json({
      id: request.id,
      status: request.status,
      createdAt: request.createdAt,
    });
  },
);
app.get("/api/introductions", session, (req, res) =>
  res.json(req.session.receipts),
);
app.use("/api", (_req, res) =>
  res.status(404).json({ error: "API route not found." }),
);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
app.use(express.static(path.join(root, "dist")));
app.get("/{*splat}", (_req, res) =>
  res.sendFile(path.join(root, "dist/index.html")),
);
export default app;
