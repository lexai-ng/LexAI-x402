// LexAI x402 Demo API — DEMO ONLY, not real payment enforcement.
// Any nonempty x-payment header is accepted without cryptographic or on-chain verification.
const http = require('node:http');

const PORT = Number(process.env.PORT || 3000);
const HOST = '0.0.0.0';

function json(res, statusCode, body) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-LexAI-Demo': 'true; payment-not-verified',
  });
  res.end(JSON.stringify(body));
}

const server = http.createServer((req, res) => {
  const pathname = new URL(req.url, 'http://localhost').pathname;

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return json(res, 405, { error: 'Method not allowed' });
  }

  if (pathname === '/') {
    res.writeHead(200, {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-LexAI-Demo': 'true; payment-not-verified',
    });
    return res.end('LexAI Legal Intelligence API - x402 Payment Demo');
  }

  if (pathname === '/search') {
    const payment = req.headers['x-payment'];
    if (typeof payment !== 'string' || payment.trim().length === 0) {
      return json(res, 402, {
        x402Version: 1,
        error: 'Payment is required',
        demo: 'DEMO ONLY: x-payment headers are not cryptographically or on-chain verified. Not production-ready paid access.',
        accepts: [{
          scheme: 'exact',
          network: 'solana-devnet',
          // 1000 atomic units = 0.001 USDC (6 decimals).
          maxAmountRequired: '1000',
          resource: '/search',
          description: 'LexAI Commonwealth case law search',
          mimeType: 'application/json',
          payTo: 'Hk2BDrmc2Js39u9uumnjnQk44S1M4ewD85kP4fMcDopuw',
          maxTimeoutSeconds: 60,
          asset: '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU',
        }],
      });
    }

    return json(res, 200, {
      status: 200,
      note: 'Payment header received (not verified yet)',
      result: 'Sample case law result goes here',
      demo: 'DEMO ONLY: no cryptographic or on-chain payment verification. Not production-ready paid access.',
    });
  }

  return json(res, 404, { error: 'Not found' });
});

server.on('error', (error) => {
  process.stderr.write(`LexAI demo server failed: ${error.message}\n`);
  process.exit(1);
});

server.listen(PORT, HOST, () => {
  process.stdout.write(`LexAI x402 Demo API listening on http://${HOST}:${PORT}\n`);
  process.stdout.write('DEMO ONLY: any nonempty x-payment header bypasses this simulated wall. No payments are verified.\n');
});
