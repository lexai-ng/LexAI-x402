# LexAI x402 Demo API

“The x402 demo server is in index.js.”


**DEMO ONLY — not real payment enforcement or production-ready paid access.**
The server accepts any nonempty `x-payment` header. It does not verify signatures,
transactions, token transfers, or payments on-chain. Do not send money to test it.
The search result is sample text, not a live case-law search.

## Run

Requires Node.js; the demo uses only the built-in `node:http` module.
No dependency installation, API keys, or wallet connection is needed.

```sh
node index.js
# or
pnpm start
```

The server binds to `0.0.0.0:3000` by default. `PORT` can override the port.
The Replit Run workflow launches the same server, exposed at the preview root.

## Test in the Replit preview

Open `/` in Preview to see:

```text
LexAI Legal Intelligence API - x402 Payment Demo
```

Open `/search` to see the HTTP 402 payment requirement.
To test headers, run these commands in Shell through the preview URL:

```sh
curl -i "https://${REPLIT_DEV_DOMAIN}/"
curl -i "https://${REPLIT_DEV_DOMAIN}/search"
curl -i -H 'x-payment: test-payment' "https://${REPLIT_DEV_DOMAIN}/search"
```

Expected statuses: **200**, **402**, **200**.
An empty or whitespace-only header still returns 402.

The 402 response advertises an x402-style `exact` payment on `solana-devnet`
for `"1000"` atomic USDC units (0.001 USDC, 6 decimals). Atomic amounts are
encoded as strings, as in x402 v1. This metadata is illustrative only.
