# TradingView Webhook Setup Guide

## 🎯 Overview
This guide shows you how to set up TradingView alerts to send webhooks to your website and display them in real-time.

## 🚀 Architecture
```
TradingView Pine Script → Webhook → Vercel API → Your Website
```

## 📡 Webhook URL
Your webhook endpoint is:
```
https://treding-view.vercel.app/api/webhook
```

## 🔧 Setup Steps

### 1. Deploy to Vercel
1. Push your code to GitHub
2. Connect your GitHub repo to Vercel
3. Deploy automatically
4. Your webhook will be available at the URL above

### 2. Configure TradingView Alerts

#### In Pine Script (Already Done):
Your Pine Script already generates properly formatted alert messages like:
```
BTCUSDT | BUY+LONG Signal
P: 45000.50  ATR: 1200.30  RSI: 35.20
LongStop: 43500.00  ShortStop: 46500.00
```

#### In TradingView Alert Dialog:
1. **Create Alert** on your chart
2. **Condition**: Select your Pine Script indicator
3. **Alert Actions**: 
   - ✅ Check "Webhook URL"
   - **URL**: `https://treding-view.vercel.app/api/webhook`
   - **Message**: Use the default message from Pine Script (don't change it)
4. **Settings**:
   - **Frequency**: Once Per Bar Close (recommended)
   - **Expiration**: Open-ended
5. **Create Alert**

### 3. View Alerts on Website
1. Navigate to: `https://treding-view.vercel.app/alerts`
2. You'll see a table with all received alerts
3. Auto-refreshes every 30 seconds
4. Shows: Symbol, Signal Type, Price, RSI, ATR, Stops, Timestamp

## 📊 Alert Message Format
The webhook expects this exact format from Pine Script:
```
SYMBOL | SIGNAL_TYPE Signal
P: PRICE  ATR: ATR_VALUE  RSI: RSI_VALUE
LongStop: LONG_STOP  ShortStop: SHORT_STOP
```

Examples:
- `BTCUSDT | BUY+LONG Signal`
- `ETHUSDT | SELL+SHORT Signal`
- `ADAUSDT | Buy Signal`
- `DOTUSDT | Long Signal`

## 🔍 Testing
1. **Test the webhook directly**:
   ```bash
   curl -X POST https://treding-view.vercel.app/api/webhook \
     -H "Content-Type: application/json" \
     -d '{"message": "BTCUSDT | BUY+LONG Signal\nP: 45000.50  ATR: 1200.30  RSI: 35.20\nLongStop: 43500.00  ShortStop: 46500.00"}'
   ```

2. **Check stored alerts**:
   ```bash
   curl https://treding-view.vercel.app/api/webhook
   ```

## 🛠️ Features
- ✅ **Real-time alerts** from TradingView
- ✅ **Auto-refresh** every 30 seconds
- ✅ **Signal type detection** (Buy/Sell/Long/Short)
- ✅ **Color coding** (Green for bullish, Red for bearish)
- ✅ **Complete data** (Price, RSI, ATR, Stops)
- ✅ **Timestamp tracking**
- ✅ **Responsive design**
- ✅ **Error handling**

## 🔧 Troubleshooting

### No Alerts Showing?
1. Check TradingView alert is active
2. Verify webhook URL is correct
3. Ensure Pine Script message format is exact
4. Check browser console for errors

### Webhook Not Working?
1. Test with curl command above
2. Check Vercel function logs
3. Verify alert message format

### Wrong Data Parsing?
1. Check Pine Script alert message format
2. Ensure no extra characters or formatting
3. Test with exact format shown above

## 📈 Next Steps
1. **Database Integration**: Replace in-memory storage with a database
2. **Real-time Updates**: Add WebSocket for instant updates
3. **Alert Filtering**: Add filters by symbol, signal type, etc.
4. **Export Features**: Add CSV/Excel export
5. **Mobile App**: Create mobile notifications
