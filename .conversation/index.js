const http = require('http');

const PAY_TO = 'Hk2BDrmc2Js39u9uumjnQk44S1M4ewD85kP4fMcDopuw';

const server = http.createServer((req, res) => {
  if (req.url === '/search') {
    // Client retried with proof of payment
    if (req.headers['x-payment']) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        status: 200,
        note: 'Payment header received (not verified yet)',
        result: 'Sample case law result goes here'
      }));
      return;
    }

    // No payment yet: return 402 with payment requirements
    res.writeHead(402, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      x402Version: 1,
      error: 'Payment required to access LexAI case law',
      accepts: [{
        scheme: 'exact',
        network: 'solana-devnet',
        maxAmountRequired: '1000', // 0.001 USDC (6 decimals)
        resource: '/search',
        description: 'LexAI Commonwealth case law search',
        mimeType: 'application/json',
        payTo: PAY_TO,
        maxTimeoutSeconds: 60,
        asset: '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU' // devnet USDC mint
      }]
    }));
    return;
  }

  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('LexAI Legal Intelligence API - x402 Payment Demo');
});

server.listen(3000, '0.0.0.0', () => {
  console.log('LexAI server running on port 3000');
  console.log('Visit /search to see the x402 payment wall');
});
