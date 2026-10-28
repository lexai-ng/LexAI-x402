import express from "express";
import { readFileSync } from "node:fs";
import { HTTPFacilitatorClient } from "@x402/core/server";
import { paymentMiddleware, x402ResourceServer } from "@x402/express";
import { ExactSvmScheme } from "@x402/svm/exact/server";

const network = "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1"; // Solana devnet
const payTo = process.env.SOLANA_PAY_TO?.trim();
const facilitatorUrl = process.env.FACILITATOR_URL?.trim();

if (!payTo || !facilitatorUrl) {
  throw new Error("Set SOLANA_PAY_TO and FACILITATOR_URL in Secrets");
}

const cases = JSON.parse(
  readFileSync(new URL("./cases.json", import.meta.url), "utf8")
);

function searchCases(q) {
  const terms = q
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .map((t) => t.replace(/s$/, ""));
  return cases
    .map((c) => {
      const hay = [c.name, c.topic, c.principle, c.summary, ...(c.tags || [])]
        .join(" ")
        .toLowerCase();
      const score = terms.reduce((s, t) => s + (hay.includes(t) ? 1 : 0), 0);
      return { c, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((x) => x.c);
}

const facilitator = new HTTPFacilitatorClient({ url: facilitatorUrl });
const resourceServer = new x402ResourceServer(facilitator).register(
  network,
  new ExactSvmScheme()
);

const app = express();

// Validate BEFORE the paywall, so a malformed request is never charged
app.use("/search", (req, res, next) => {
  const q = String(req.query.q ?? "").trim();
  if (q.length < 2) {
    return res.status(400).json({
      error: "Missing search query. Use /search?q=your+topic (for example q=negligence).",
    });
  }
  next();
});

app.use(
  paymentMiddleware(
    {
      "GET /search": {
        accepts: [{ scheme: "exact", price: "$0.001", network, payTo }],
        description: "LexAI Commonwealth case law search",
        mimeType: "application/json",
      },
    },
    resourceServer
  )
);

app.get("/", (_req, res) =>
  res.send("LexAI Legal Intelligence API (x402, Solana devnet). Try /search?q=negligence")
);

app.get("/search", (req, res) => {
  const q = String(req.query.q).trim();
  const results = searchCases(q);
  res.json({
    query: q,
    count: results.length,
    results,
    notice:
      "Sample dataset for demonstration. Verify citations against official law reports before relying on them.",
  });
});

app.listen(4021, "0.0.0.0", (err) => {
  if (err) {
    console.error("Could not start server:", err.message);
    process.exit(1);
  }
  console.log("LexAI x402 API listening on port 4021");
});
