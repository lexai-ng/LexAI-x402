import express from "express";
import { HTTPFacilitatorClient } from "@x402/core/server";
import { paymentMiddleware, x402ResourceServer } from "@x402/express";
import { ExactSvmScheme } from "@x402/svm/exact/server";

const network = "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1";
const payTo = process.env.SOLANA_PAY_TO?.trim();
const facilitatorUrl = process.env.FACILITATOR_URL?.trim();

if (!payTo || !facilitatorUrl) {
  throw new Error("Set SOLANA_PAY_TO and FACILITATOR_URL in Secrets");
}

const facilitator = new HTTPFacilitatorClient({ url: facilitatorUrl });
const resourceServer = new x402ResourceServer(facilitator).register(
  network,
  new ExactSvmScheme()
);

const app = express();

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

app.get("/", (_req, res) => res.send("LexAI Legal Intelligence API (x402, Solana devnet)"));

app.get("/search", (_req, res) => {
  res.json({ result: "Sample case law result goes here (real LexAI search comes next)" });
});

app.listen(4021, "0.0.0.0", () => console.log("LexAI x402 API listening on port 4021"));
