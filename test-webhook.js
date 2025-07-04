// Simple test script to test the webhook locally
const http = require('http');
const fs = require('fs');
const path = require('path');

// Import our webhook handler (we'll need to adapt it for Node.js)
const webhookHandler = require('./api/webhook-test.js');

const PORT = 3001;

const server = http.createServer(async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.url === '/api/webhook') {
    let body = '';
    
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', async () => {
      try {
        // Create mock Vercel request/response objects
        const mockReq = {
          method: req.method,
          body: req.method === 'POST' ? JSON.parse(body || '{}') : undefined,
          headers: req.headers
        };
        
        const mockRes = {
          status: (code) => ({
            json: (data) => {
              res.writeHead(code, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify(data));
            },
            end: () => {
              res.writeHead(code);
              res.end();
            }
          }),
          setHeader: (key, value) => res.setHeader(key, value)
        };
        
        await webhookHandler.default(mockReq, mockRes);
      } catch (error) {
        console.error('Error:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Internal server error' }));
      }
    });
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(PORT, () => {
  console.log(`🚀 Test server running on http://localhost:${PORT}`);
  console.log(`📡 Webhook endpoint: http://localhost:${PORT}/api/webhook`);
  console.log('');
  console.log('Test commands:');
  console.log('1. Test POST (send alert):');
  console.log(`   curl -X POST http://localhost:${PORT}/api/webhook -H "Content-Type: application/json" -d '{"message": "BTCUSDT | BUY+LONG Signal\\nP: 45000.50  ATR: 1200.30  RSI: 35.20\\nLongStop: 43500.00  ShortStop: 46500.00"}'`);
  console.log('');
  console.log('2. Test GET (fetch alerts):');
  console.log(`   curl http://localhost:${PORT}/api/webhook`);
  console.log('');
  console.log('Press Ctrl+C to stop');
});
