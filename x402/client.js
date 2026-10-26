import { base58 } from "@scure/base";
import { createKeyPairSignerFromBytes } from "@solana/kit";
import { x402Client, wrapFetchWithPayment } from "@x402/fetch";
import { ExactSvmScheme } from "@x402/svm/exact/client";

const secret = process.env.SOLANA_PRIVATE_KEY;
if (!secret) throw new Error("Set SOLANA_PRIVATE_KEY in Secrets");

const signer = await createKeyPairSignerFromBytes(base58.decode(secret));
const client = new x402Client();

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
const response = await fetchWithPayment("http://127.0.0.1:4021/search");

if (!response.ok) {
  console.error(`Payment or request failed with status ${response.status}`);
  process.exit(1);
}

console.log(await response.json());
console.log("Receipt:", response.headers.get("PAYMENT-RESPONSE"));
