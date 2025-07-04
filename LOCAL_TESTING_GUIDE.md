# 🧪 Local Testing Guide for TradingView Webhooks

## 🎯 Goal
Test the webhook system locally before deploying to production.

## 🚀 Quick Setup (3 Steps)

### **Step 1: Install Dependencies**
```bash
npm install express cors
```

### **Step 2: Start Local Webhook Server**
```bash
node local-webhook-server.js
```
This starts a webhook server on `http://localhost:3001`

### **Step 3: Start Your React App**
```bash
npm run dev
```
This starts your React app on `http://localhost:5173`

## 🧪 Testing Methods

### **Method 1: Manual Test (Quick)**
1. **Send a test alert:**
   ```bash
   node test-alert.js
   ```

2. **Check results:**
   - Go to `http://localhost:5173/alerts`
   - You should see test alerts in the table

### **Method 2: TradingView Test (Real)**
1. **Install ngrok:**
   ```bash
   npm install -g ngrok
   ```

2. **Create public tunnel:**
   ```bash
   ngrok http 3001
   ```

3. **Copy the ngrok URL** (e.g., `https://abc123.ngrok.io`)

4. **Configure TradingView Alert:**
   - **Webhook URL**: `https://abc123.ngrok.io/api/webhook`
   - **Message**: Use default Pine Script message
   - **Frequency**: Once Per Bar Close

5. **Test on TradingView:**
   - Create an alert with your Pine Script
   - Wait for signal to trigger
   - Check `http://localhost:5173/alerts` for the alert

## 📊 What You Should See

### **In Webhook Server Console:**
```
🚀 Local Webhook Server Started!
📡 Webhook URL: http://localhost:3001/api/webhook
📨 Received TradingView Alert: { message: "BTCUSDT | BUY+LONG Signal..." }
✅ Alert stored successfully: { symbol: "BTCUSDT", signalType: "BUY+LONG", ... }
📊 Total alerts stored: 1
```

### **In React App (`/alerts` page):**
- Table showing received alerts
- Real-time updates every 30 seconds
- Color-coded signal types
- All alert data (Symbol, Signal, Price, RSI, ATR, Stops)

## 🔧 Troubleshooting

### **No Alerts Showing in React App?**
1. Check webhook server is running (`node local-webhook-server.js`)
2. Check React app is running (`npm run dev`)
3. Check browser console for errors
4. Verify you're on the `/alerts` page

### **Webhook Server Not Receiving Alerts?**
1. Check ngrok is running and URL is correct
2. Test with manual script: `node test-alert.js`
3. Check TradingView alert configuration
4. Verify Pine Script message format

### **Parse Errors?**
1. Check Pine Script alert message format exactly matches:
   ```
   SYMBOL | SIGNAL_TYPE Signal
   P: PRICE  ATR: ATR  RSI: RSI
   LongStop: LONG_STOP  ShortStop: SHORT_STOP
   ```

## 📋 Testing Checklist

- [ ] Webhook server starts without errors
- [ ] React app starts and shows alerts page
- [ ] Manual test script sends alerts successfully
- [ ] Alerts appear in React app table
- [ ] ngrok creates public tunnel
- [ ] TradingView can send to ngrok URL
- [ ] Real TradingView alerts appear in app

## 🎯 Success Criteria

✅ **Local webhook server receives and parses alerts correctly**
✅ **React app displays alerts in real-time**
✅ **TradingView can send alerts via ngrok**
✅ **All alert data is captured and displayed**

## 🚀 Next Steps After Testing

Once local testing works:
1. Deploy to Vercel production
2. Update TradingView webhooks to production URL
3. Monitor production alerts
4. Add database for persistent storage

## 🛠️ Commands Summary

```bash
# Install dependencies
npm install express cors

# Start webhook server (Terminal 1)
node local-webhook-server.js

# Start React app (Terminal 2)
npm run dev

# Test manually (Terminal 3)
node test-alert.js

# Create public tunnel (Terminal 4)
ngrok http 3001
```

## 📱 URLs During Testing

- **React App**: `http://localhost:5173`
- **Alerts Page**: `http://localhost:5173/alerts`
- **Webhook Server**: `http://localhost:3001`
- **Webhook Endpoint**: `http://localhost:3001/api/webhook`
- **ngrok Public URL**: `https://[random].ngrok.io/api/webhook`
