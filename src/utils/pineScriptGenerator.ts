// Add types for the signal and frequency options
export type SignalType = 
  | 'buy_only'
  | 'sell_only'
  | 'long_only'
  | 'short_only'
  | 'buy_and_sell'
  | 'long_and_short';

export type AlertFrequency = 
  | 'once_per_bar'
  | 'once_per_bar_close'
  | 'once_per_minute'
  | 'once';

export const generatePineScript = (
    tradingPairs: string[], 
    signalType: SignalType = 'buy_only',
    alertFrequency: AlertFrequency = 'once_per_bar'
): string => {
    // Determine which signals to show based on signal type
    const showBuy = signalType === 'buy_only' || signalType === 'buy_and_sell';
    const showSell = signalType === 'sell_only' || signalType === 'buy_and_sell';
    const showLong = signalType === 'long_only' || signalType === 'long_and_short';
    const showShort = signalType === 'short_only' || signalType === 'long_and_short';

    // Convert alert frequency to Pine Script format
    const alertFreqStr = {
        'once_per_bar': 'alert.freq_once_per_bar',
        'once_per_bar_close': 'alert.freq_once_per_bar_close',
        'once_per_minute': 'alert.freq_once_per_minute',
        'once': 'alert.freq_once'
    }[alertFrequency];

    // Base script with common settings and functions
    const baseScript = `
//@version=6
indicator("Adaptive Symbol Alert with Chandelier Exit + RSI & ATR", overlay=true)

// === User Inputs ===
showBuy   = input.bool(${showBuy}, title="Show Buy Signals")
showSell  = input.bool(${showSell}, title="Show Sell Signals")
showLong  = input.bool(${showLong},  title="Show Long Signals")
showShort = input.bool(${showShort},  title="Show Short Signals")

// === RSI & ATR Settings ===
rsiLength = 14
atrLength = 22
atrMult   = 3.0

// === Chandelier Exit Function with Enhanced Logic ===
f_chandelier_exit(_close, _high, _low) =>
    atr = atrMult * ta.atr(atrLength)
    longStop = ta.highest(_close, atrLength) - atr
    longStopPrev = nz(longStop[1], longStop)
    longStop := _close[1] > longStopPrev ? math.max(longStop, longStopPrev) : longStop

    shortStop = ta.lowest(_close, atrLength) + atr
    shortStopPrev = nz(shortStop[1], shortStop)
    shortStop := _close[1] < shortStopPrev ? math.min(shortStop, shortStopPrev) : shortStop

    dir = 0
    dir := _close > shortStop[1] ? 1 : _close < longStop[1] ? -1 : dir[1]

    buySignal  = dir == 1 and dir[1] == -1
    sellSignal = dir == -1 and dir[1] == 1
    longSignal  = ta.crossover(_close, longStop)
    shortSignal = ta.crossunder(_close, shortStop)

    [buySignal, sellSignal, longSignal, shortSignal, atr, longStop, shortStop]

// === Get Signals for Main Chart Symbol Only ===
[myBuy, mySell, _, _, myAtr, myLongStop, myShortStop] = f_chandelier_exit(close, high, low)

// === Plot Buy/Sell Shapes on Chart ===
plotshape(myBuy and showBuy, title="Client Buy", location=location.belowbar, color=color.green, style=shape.labelup, text="BUY")
plotshape(mySell and showSell, title="Client Sell", location=location.abovebar, color=color.red, style=shape.labeldown, text="SELL")
`;

    // Generate symbol inputs - Remove .P if it exists and add it only once
    const symbolInputs = tradingPairs.map((pair, index) => {
        const cleanPair = pair.replace(/\.P$/, ''); // Remove .P if it exists at the end
        return `symbol${index + 1} = input.symbol("${cleanPair}.P", title="Symbol ${index + 1}")`;
    }).join('\n');

    // Function to get signals for any symbol
    const getSignalsFunction = `
// === Function to get signals + RSI + ATR for any symbol ===
f_getSignals(sym) =>
    [b, s, l, sh, atr, ls, ss] = request.security(sym, timeframe.period, f_chandelier_exit(close, high, low))
    r = request.security(sym, timeframe.period, ta.rsi(close, rsiLength))
    p = request.security(sym, timeframe.period, close)
    [b, s, l, sh, atr, r, p, ls, ss]
`;

    // Generate signal variables for each symbol
    const signalVariables = tradingPairs.map((_, index) => 
        `[buy${index + 1}, sell${index + 1}, long${index + 1}, short${index + 1}, atr${index + 1}, rsi${index + 1}, price${index + 1}, longStop${index + 1}, shortStop${index + 1}] = f_getSignals(symbol${index + 1})`
    ).join('\n');

    // Alert message function
    const alertMessageFunction = `
// === Compact alert message function ===
f_alertMessage(sym, signalType, price, atr, rsi, longStop, shortStop) =>
    symStr = str.replace(str.tostring(sym), ".P", "")
    priceStr = str.tostring(price, format.mintick)
    atrStr = str.tostring(atr, format.mintick)
    rsiStr = str.tostring(rsi, format.mintick)
    longStopStr = str.tostring(longStop, format.mintick)
    shortStopStr = str.tostring(shortStop, format.mintick)

    line1 = symStr + " | " + signalType + " Signal"
    line2 = "P: " + priceStr + "  ATR: " + atrStr + "  RSI: " + rsiStr
    line3 = "LongStop: " + longStopStr + "  ShortStop: " + shortStopStr

    line1 + "\\n" + line2 + "\\n" + line3
`;

    // Generate alert conditions for each symbol with the selected frequency
    const alertConditions = tradingPairs.map((_, index) => `
// === Alerts for Symbol ${index + 1} ===
if buy${index + 1} and showBuy
    alert(f_alertMessage(symbol${index + 1}, "Buy", price${index + 1}, atr${index + 1}, rsi${index + 1}, longStop${index + 1}, shortStop${index + 1}), ${alertFreqStr})
if sell${index + 1} and showSell
    alert(f_alertMessage(symbol${index + 1}, "Sell", price${index + 1}, atr${index + 1}, rsi${index + 1}, longStop${index + 1}, shortStop${index + 1}), ${alertFreqStr})
if long${index + 1} and showLong
    alert(f_alertMessage(symbol${index + 1}, "Long", price${index + 1}, atr${index + 1}, rsi${index + 1}, longStop${index + 1}, shortStop${index + 1}), ${alertFreqStr})
if short${index + 1} and showShort
    alert(f_alertMessage(symbol${index + 1}, "Short", price${index + 1}, atr${index + 1}, rsi${index + 1}, longStop${index + 1}, shortStop${index + 1}), ${alertFreqStr})`
    ).join('\n');

    // Combine all parts
    return `${baseScript}

// === Symbol Inputs ===
${symbolInputs}

${getSignalsFunction}

// === Get signals & indicators for all symbols ===
${signalVariables}

${alertMessageFunction}

${alertConditions}
`;
}; 