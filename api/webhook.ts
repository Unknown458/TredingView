import type { VercelRequest, VercelResponse } from '@vercel/node';

// Interface for TradingView webhook payload
interface TradingViewAlert {
  symbol: string;
  signalType: string;
  price: string;
  atr: string;
  rsi: string;
  longStop: string;
  shortStop: string;
  timestamp: string;
}

// In-memory storage for alerts (in production, use a database)
let alerts: TradingViewAlert[] = [];

// Function to parse the alert message from Pine Script
function parseAlertMessage(message: string): TradingViewAlert | null {
  try {
    // Expected format from Pine Script:
    // "SYMBOL | SIGNAL_TYPE Signal\nP: PRICE  ATR: ATR  RSI: RSI\nLongStop: LONG_STOP  ShortStop: SHORT_STOP"
    
    const lines = message.split('\n');
    if (lines.length < 3) return null;
    
    // Parse first line: "SYMBOL | SIGNAL_TYPE Signal"
    const firstLine = lines[0];
    const symbolMatch = firstLine.match(/^([^|]+)\s*\|\s*(.+?)\s+Signal$/);
    if (!symbolMatch) return null;
    
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
    console.error('Error parsing alert message:', error);
    return null;
  }
}

// Main handler function
export default async function handler(req: VercelRequest, res: VercelResponse) {
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
      let alertData = req.body;
      
      console.log('Received TradingView Alert:', alertData);

      // Handle raw body if needed
      if (typeof alertData === 'undefined') {
        const buffers: Buffer[] = [];
        for await (const chunk of req) {
          buffers.push(chunk);
        }
        const data = Buffer.concat(buffers).toString();
        alertData = JSON.parse(data || '{}');
      }
      
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
        
        console.log('Alert stored successfully:', parsedAlert);
        
        return res.status(200).json({
          success: true,
          message: 'Alert received and stored',
          alert: parsedAlert
        });
      } else {
        return res.status(400).json({
          success: false,
          message: 'Invalid alert format',
          receivedData: alertData
        });
      }
    } catch (error) {
      console.error('Error processing webhook:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  } else if (req.method === 'GET') {
    // Return stored alerts for the frontend
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