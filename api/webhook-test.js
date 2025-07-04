// Node.js compatible version for local testing

// Interface for TradingView webhook payload
// In-memory storage for alerts (in production, use a database)
let alerts = [];

async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    try {
      // Parse the webhook payload from TradingView
      const alertData = req.body;
      
      console.log('📨 Received TradingView Alert:', alertData);

      // Parse the alert message (assuming it comes in the format from Pine Script)
      const alertMessage = alertData.message || alertData.text || '';
      
      // Parse the structured alert message
      const parsedAlert = parseAlertMessage(alertMessage);
      
      if (parsedAlert) {
        // Add timestamp
        parsedAlert.timestamp = new Date().toISOString();
        
        // Store the alert (add to beginning of array for latest first)
        alerts.unshift(parsedAlert);
        
        // Keep only last 100 alerts to prevent memory issues
        if (alerts.length > 100) {
          alerts = alerts.slice(0, 100);
        }
        
        console.log('✅ Alert stored successfully:', parsedAlert);
        
        return res.status(200).json({
          success: true,
          message: 'Alert received and stored',
          alert: parsedAlert
        });
      } else {
        console.log('❌ Invalid alert format:', alertData);
        return res.status(400).json({
          success: false,
          message: 'Invalid alert format',
          receivedData: alertData
        });
      }
    } catch (error) {
      console.error('💥 Error processing webhook:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  } else if (req.method === 'GET') {
    // Return stored alerts for the frontend
    console.log(`📊 Returning ${alerts.length} stored alerts`);
    return res.status(200).json({
      success: true,
      alerts: alerts,
      count: alerts.length
    });
  } else {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }
}

// Function to parse the alert message from Pine Script
function parseAlertMessage(message) {
  try {
    console.log('🔍 Parsing alert message:', message);
    
    // Expected format from Pine Script:
    // "SYMBOL | SIGNAL_TYPE Signal\nP: PRICE  ATR: ATR  RSI: RSI\nLongStop: LONG_STOP  ShortStop: SHORT_STOP"
    
    const lines = message.split('\n');
    if (lines.length < 3) {
      console.log('❌ Not enough lines in message');
      return null;
    }
    
    // Parse first line: "SYMBOL | SIGNAL_TYPE Signal"
    const firstLine = lines[0];
    const symbolMatch = firstLine.match(/^([^|]+)\s*\|\s*(.+?)\s+Signal$/);
    if (!symbolMatch) {
      console.log('❌ Could not parse symbol and signal type from:', firstLine);
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
      console.log('❌ Could not parse all required fields');
      console.log('Price:', priceMatch?.[1]);
      console.log('ATR:', atrMatch?.[1]);
      console.log('RSI:', rsiMatch?.[1]);
      console.log('LongStop:', longStopMatch?.[1]);
      console.log('ShortStop:', shortStopMatch?.[1]);
      return null;
    }
    
    const result = {
      symbol,
      signalType,
      price: priceMatch[1],
      atr: atrMatch[1],
      rsi: rsiMatch[1],
      longStop: longStopMatch[1],
      shortStop: shortStopMatch[1],
      timestamp: ''
    };
    
    console.log('✅ Successfully parsed alert:', result);
    return result;
  } catch (error) {
    console.error('💥 Error parsing alert message:', error);
    return null;
  }
}

module.exports = { default: handler };
