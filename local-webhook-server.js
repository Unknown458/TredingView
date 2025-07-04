// Simple local webhook server for testing TradingView alerts
import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3001;

// In-memory storage for alerts
let alerts = [];

// Middleware
app.use(cors());
app.use(express.json());

// Webhook endpoint for TradingView
app.post('/api/webhook', (req, res) => {
  try {
    console.log('📨 Received TradingView Alert:', req.body);
    
    // Parse the alert message
    const alertData = req.body;
    const alertMessage = alertData.message || alertData.text || JSON.stringify(alertData);
    
    // Parse the structured alert message
    const parsedAlert = parseAlertMessage(alertMessage);
    
    if (parsedAlert) {
      // Add timestamp
      parsedAlert.timestamp = new Date().toISOString();
      
      // Store the alert (add to beginning for latest first)
      alerts.unshift(parsedAlert);
      
      // Keep only last 100 alerts
      if (alerts.length > 100) {
        alerts = alerts.slice(0, 100);
      }
      
      console.log('✅ Alert stored successfully:', parsedAlert);
      console.log(`📊 Total alerts stored: ${alerts.length}`);
      
      res.json({
        success: true,
        message: 'Alert received and stored',
        alert: parsedAlert
      });
    } else {
      console.log('❌ Invalid alert format');
      res.status(400).json({
        success: false,
        message: 'Invalid alert format',
        receivedData: alertData
      });
    }
  } catch (error) {
    console.error('💥 Error processing webhook:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Get alerts endpoint for frontend
app.get('/api/webhook', (req, res) => {
  console.log(`📊 Frontend requesting ${alerts.length} alerts`);
  res.json({
    success: true,
    alerts: alerts,
    count: alerts.length
  });
});

// Test endpoint
app.get('/test', (req, res) => {
  res.json({
    message: 'Webhook server is running!',
    alertCount: alerts.length,
    timestamp: new Date().toISOString()
  });
});

// Function to parse Pine Script alert messages
function parseAlertMessage(message) {
  try {
    console.log('🔍 Parsing message:', message);
    
    // Handle different message formats
    if (typeof message === 'object') {
      message = JSON.stringify(message);
    }
    
    // Expected format: "SYMBOL | SIGNAL_TYPE Signal\nP: PRICE  ATR: ATR  RSI: RSI\nLongStop: LONG_STOP  ShortStop: SHORT_STOP"
    const lines = message.split('\n');
    
    if (lines.length < 3) {
      console.log('❌ Message format incorrect, expected 3 lines, got:', lines.length);
      return null;
    }
    
    // Parse first line: "SYMBOL | SIGNAL_TYPE Signal"
    const firstLine = lines[0];
    const symbolMatch = firstLine.match(/^([^|]+)\s*\|\s*(.+?)\s+Signal$/);
    
    if (!symbolMatch) {
      console.log('❌ Could not parse first line:', firstLine);
      return null;
    }
    
    const symbol = symbolMatch[1].trim();
    const signalType = symbolMatch[2].trim();
    
    // Parse second line: "P: PRICE  ATR: ATR  RSI: RSI"
    const secondLine = lines[1];
    const priceMatch = secondLine.match(/P:\s*([\d.]+)/);
    const atrMatch = secondLine.match(/ATR:\s*([\d.]+)/);
    const rsiMatch = secondLine.match(/RSI:\s*([\d.]+)/);
    
    // Parse third line: "LongStop: LONG_STOP  ShortStop: SHORT_STOP"
    const thirdLine = lines[2];
    const longStopMatch = thirdLine.match(/LongStop:\s*([\d.]+)/);
    const shortStopMatch = thirdLine.match(/ShortStop:\s*([\d.]+)/);
    
    if (!priceMatch || !atrMatch || !rsiMatch || !longStopMatch || !shortStopMatch) {
      console.log('❌ Could not parse all required fields from lines 2-3');
      return null;
    }
    
    return {
      symbol,
      signalType,
      price: priceMatch[1],
      atr: atrMatch[1],
      rsi: rsiMatch[1],
      longStop: longStopMatch[1],
      shortStop: shortStopMatch[1],
      timestamp: ''
    };
  } catch (error) {
    console.error('💥 Error parsing message:', error);
    return null;
  }
}

// Start server
app.listen(PORT, () => {
  console.log('🚀 Local Webhook Server Started!');
  console.log(`📡 Webhook URL: http://localhost:${PORT}/api/webhook`);
  console.log(`🧪 Test URL: http://localhost:${PORT}/test`);
  console.log('');
  console.log('📋 Next Steps:');
  console.log('1. Install ngrok: npm install -g ngrok');
  console.log(`2. Run: ngrok http ${PORT}`);
  console.log('3. Use the ngrok URL in TradingView webhook');
  console.log('4. Update your React app to fetch from this server');
  console.log('');
  console.log('🧪 Test Commands:');
  console.log(`curl -X POST http://localhost:${PORT}/api/webhook -H "Content-Type: application/json" -d '{"message": "BTCUSDT | BUY+LONG Signal\\nP: 45000.50  ATR: 1200.30  RSI: 35.20\\nLongStop: 43500.00  ShortStop: 46500.00"}'`);
  console.log('');
  console.log('Press Ctrl+C to stop');
});
