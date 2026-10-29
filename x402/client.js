import dns from "node:dns"; dns.setDefaultResultOrder("ipv4first");
import { base58 } from "@scure/base";
import { createKeyPairSignerFromBytes } from "@solana/kit";
import { x402Client, wrapFetchWithPayment } from "@x402/fetch";
import { ExactSvmScheme } from "@x402/svm/exact/client";

const query = process.argv.slice(2).join(" ").trim() || "negligence";
const secret = process.env.SOLANA_PRIVATE_KEY?.replace(/\s+/g, "");
if (!secret) {
  console.error("SOLANA_PRIVATE_KEY is not set in Secrets.");
  process.exit(1);
}

const signer = await createKeyPairSignerFromBytes(base58.decode(secret));
const client = new x402Client();

// Spend control: only devnet USDC, at most 0.01 USDC per request
client.registerPolicy((_version, requirements) =>
  requirements.filter(
    ({ network, asset, amount }) =>
      network === "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1" &&
      asset === "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU" &&
      BigInt(amount) <= 10_000n
  )
);
client.register("solana:*", new ExactSvmScheme(signer));

const fetchWithPayment = wrapFetchWithPayment(fetch, client);
const url = `http://127.0.0.1:4021/search?q=${encodeURIComponent(query)}`;

let response;
try {
  response = await fetchWithPayment(url);
} catch (err) {
  console.error("Payment could not be completed:", err.message);
  console.error("Check: the server is running, the payer wallet has devnet USDC, and the facilitator is reachable.");
  process.exit(1);
}

if (!response.ok) {
  console.error(`Request failed with status ${response.status}`);
  console.error(await response.text());
  process.exit(1);
}

const data = await response.json();
console.log(`Query: "${data.query}" - ${data.count} result(s)`);
for (const c of data.results) {
  console.log(`\n${c.name} (${c.court}, ${c.year})\n  ${c.principle}`);
}

const header = response.headers.get("PAYMENT-RESPONSE");
if (header) {
  const receipt = JSON.parse(Buffer.from(header, "base64").toString());
  console.log("\nPaid 0.001 USDC on Solana devnet");
  console.log("Transaction:", receipt.transaction);
  console.log(`Explorer: https://explorer.solana.com/tx/${receipt.transaction}?cluster=devnet`);
}
