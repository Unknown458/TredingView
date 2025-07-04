// Simple script to test sending alerts to the webhook
import http from 'http';

const PORT = 3001;
const HOST = 'localhost';

// Test alert data in the format your Pine Script sends
const testAlerts = [
  {
    message: "BTCUSDT | BUY+LONG Signal\nP: 45000.50  ATR: 1200.30  RSI: 35.20\nLongStop: 43500.00  ShortStop: 46500.00"
  },
  {
    message: "ETHUSDT | SELL+SHORT Signal\nP: 2800.75  ATR: 85.40  RSI: 68.90\nLongStop: 2750.00  ShortStop: 2850.00"
  },
  {
    message: "ADAUSDT | Buy Signal\nP: 0.4520  ATR: 0.0180  RSI: 42.10\nLongStop: 0.4400  ShortStop: 0.4650"
  },
  {
    message: "DOTUSDT | Long Signal\nP: 6.850  ATR: 0.320  RSI: 38.50\nLongStop: 6.500  ShortStop: 7.200"
  }
];

function sendTestAlert(alertData, index) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(alertData);
    
    const options = {
      hostname: HOST,
      port: PORT,
      path: '/api/webhook',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`✅ Alert ${index + 1} sent successfully!`);
        console.log(`📊 Response:`, JSON.parse(data));
        console.log('---');
        resolve(data);
      });
    });

    req.on('error', (error) => {
      console.error(`❌ Error sending alert ${index + 1}:`, error.message);
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Starting Webhook Tests...');
  console.log(`📡 Target: http://${HOST}:${PORT}/api/webhook`);
  console.log('');

  // Send test alerts one by one with delay
  for (let i = 0; i < testAlerts.length; i++) {
    try {
      console.log(`📤 Sending test alert ${i + 1}/${testAlerts.length}:`);
      console.log(`📝 Message: ${testAlerts[i].message.split('\n')[0]}`);
      
      await sendTestAlert(testAlerts[i], i);
      
      // Wait 2 seconds between alerts
      if (i < testAlerts.length - 1) {
        console.log('⏳ Waiting 2 seconds...\n');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    } catch (error) {
      console.error(`💥 Failed to send alert ${i + 1}`);
    }
  }

  console.log('🎉 All test alerts sent!');
  console.log('');
  console.log('📋 Next Steps:');
  console.log('1. Check your React app at http://localhost:5173/alerts');
  console.log('2. You should see the test alerts in the table');
  console.log('3. If working, set up ngrok for TradingView testing');
}

// Check if webhook server is running first
function checkServer() {
  return new Promise((resolve) => {
    const req = http.request({
      hostname: HOST,
      port: PORT,
      path: '/test',
      method: 'GET'
    }, (res) => {
      resolve(true);
    });

    req.on('error', () => {
      resolve(false);
    });

    req.end();
  });
}

async function main() {
  console.log('🔍 Checking if webhook server is running...');
  
  const serverRunning = await checkServer();
  
  if (!serverRunning) {
    console.log('❌ Webhook server is not running!');
    console.log('');
    console.log('📋 Please start the webhook server first:');
    console.log('   node local-webhook-server.js');
    console.log('');
    process.exit(1);
  }

  console.log('✅ Webhook server is running!');
  console.log('');
  
  await runTests();
}

main().catch(console.error);
