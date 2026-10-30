# LexAI x402: Pay-per-query Commonwealth case law on Solana

LexAI is a legal research platform for Commonwealth law (live at https://lexai-ng.netlify.app). This project adds an **x402 payment layer on Solana**, so a person, an app or an AI agent can pay a fraction of a cent per legal query, with no subscription, no account and no manual checkout.

Built for the Encode Club x Solana x402 hackathon (October 2026) by Nnadozie ([lexai-ng](https://github.com/lexai-ng)) in Port Harcourt, Nigeria, entirely on an Android phone.

## Demo

- Demo video: Demo video: coming soon
- Example payment on Solana devnet:   - All payments received by the LexAI wallet on Solana devnet: https://explorer.solana.com/address/Hk2BDrmc2Js39u9uumjnQk44S1M4ewD85kP4fMcDopuw?cluster=devnet 
- Code: the `x402/` folder

## How it works

1. A client requests `GET /search?q=negligence`.
2. The server replies `402 Payment Required` with a `PAYMENT-REQUIRED` header: price 0.001 USDC, network Solana devnet, pay-to wallet.
3. The client signs a USDC payment on Solana and retries with a `PAYMENT-SIGNATURE` header.
4. The server asks an x402 facilitator to verify and settle the payment on Solana.
5. Only after settlement does the server return the case law results, plus a `PAYMENT-RESPONSE` receipt containing the transaction signature.

```
Client -> GET /search?q=...        -> LexAI server
Client <- 402 + payment terms      <- LexAI server
Client -> retry + signed payment   -> LexAI server -> facilitator -> Solana
Client <- 200 + results + receipt  <- LexAI server
```

## Why Solana

- **Micropayments work:** a query costs 0.001 USDC. Fees and finality on Solana are low enough that this price is practical.
- **Stablecoin settlement:** payments are USDC SPL token transfers, so prices are stable and easy to reason about.
- **Agent-ready:** any AI agent with a Solana wallet can pay per request with no signup. This is how a legal research agent could buy LexAI lookups autonomously.
- **Verifiable:** every paid request produces a transaction signature that anyone can check on Solana Explorer.

## Tech

- Node.js, Express
- x402 v2: `@x402/core`, `@x402/express`, `@x402/svm`, `@x402/fetch`
- Solana devnet, devnet USDC (mint `4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU`)
- Facilitator: `https://x402.org/facilitator`

## Setup

Requires Node.js 20 or newer (tested on 24) and two devnet wallets: a **receiver** (the LexAI wallet) and a **payer** (a disposable test wallet). Use devnet-only wallets and never reuse a key that holds real funds.

1. Get devnet USDC for the payer from https://faucet.circle.com (choose Solana, Devnet). Optionally get devnet SOL from https://faucet.solana.com.
2. Set these environment variables (on Replit, use Secrets):

| Variable | Value |
|---|---|
| `SOLANA_PAY_TO` | the receiver wallet address |
| `FACILITATOR_URL` | `https://x402.org/facilitator` |
| `SOLANA_PRIVATE_KEY` | the payer's private key, base58 (client only) |

3. Install and run:

```
cd x402
npm install
node server.js
```

## Try it

In a second terminal:

```
# no query: refused with 400, never charged
curl -i "localhost:4021/search"

# with a query, no payment: 402 Payment Required
curl -i "localhost:4021/search?q=contract"

# the client pays automatically and prints results and the transaction link
node client.js "customary law inheritance"
```

## Failed payments and safety

- A request with no query is rejected with `400` **before** the paywall, so a malformed request is never charged.
- The server serves results only after the facilitator verifies and settles the payment.
- The client has a spend policy: it only pays in devnet USDC and never more than 0.01 USDC per request.
- The client reports clear errors for a missing key, an unreachable server, an unfunded wallet or a rejected payment, instead of failing silently.

## Data

`/search` runs over a small built-in sample dataset of eight landmark Commonwealth and Nigerian cases, for demonstration only. Verify any citation against official law reports before relying on it. Connecting the full LexAI corpus is the next step.

## Status and roadmap

Working on devnet: 402 challenge, payment, facilitator verification and settlement, result delivery, receipts.

Next:
- Connect the full LexAI case law and statute corpus
- Move from devnet to mainnet
- Naira payments through Paystack for human users, with x402 for agents
- An MCP server so AI agents can discover and pay for LexAI tools

## Note on `index.js`

The `index.js` in the repository root is an earlier mock that accepted any `x-payment` header without verification. It is superseded by the real implementation in `x402/`.
