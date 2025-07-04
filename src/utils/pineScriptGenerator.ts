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
    signalTypes: string[] | SignalType = ['buy_only'],
    alertFrequency: AlertFrequency = 'once_per_bar'
): string => {
    // TradingView limits: 40 security requests per script
    // Each symbol now uses only 1 security request (OPTIMIZED), so limit to 35 symbols per script
    const MAX_SYMBOLS_PER_SCRIPT = 35;

    // If too many symbols, limit to first 8 and add warning
    const limitedPairs = tradingPairs.slice(0, MAX_SYMBOLS_PER_SCRIPT);
    const hasMoreSymbols = tradingPairs.length > MAX_SYMBOLS_PER_SCRIPT;

    // Convert single signal type to array for backward compatibility
    const signalTypesArray = Array.isArray(signalTypes) ? signalTypes : [signalTypes];

    // Determine which signals to show based on selected signal types
    const showBuy = signalTypesArray.includes('buy_only') || signalTypesArray.includes('buy_and_sell') || signalTypesArray.includes('buy');
    const showSell = signalTypesArray.includes('sell_only') || signalTypesArray.includes('buy_and_sell') || signalTypesArray.includes('sell');
    const showLong = signalTypesArray.includes('long_only') || signalTypesArray.includes('long_and_short') || signalTypesArray.includes('long');
    const showShort = signalTypesArray.includes('short_only') || signalTypesArray.includes('long_and_short') || signalTypesArray.includes('short');

    // Convert alert frequency to Pine Script format
    const alertFreqStr = {
        'once_per_bar': 'alert.freq_once_per_bar',
        'once_per_bar_close': 'alert.freq_once_per_bar_close',
        'once_per_minute': 'alert.freq_once_per_minute',
        'once': 'alert.freq_once'
    }[alertFrequency];

    // Base script with CrackOS logic
    const baseScript = `
//@version=5
indicator("Enhanced CrackOs v1.2 - Multi Symbol Alert Edition", shorttitle="CrackOs+ Multi", overlay=true, max_labels_count=500, max_lines_count=500)

${hasMoreSymbols ? `// ⚠️ WARNING: Only showing first ${MAX_SYMBOLS_PER_SCRIPT} symbols out of ${tradingPairs.length} total symbols
// TradingView limits scripts to 40 security requests. Each symbol uses ~1 request.
// To monitor all symbols, create multiple scripts with different symbol batches.` : `// Monitoring ${limitedPairs.length} symbols`}

// === MULTIPLE ALERT INPUTS ===
showBuy   = input.bool(${showBuy}, title="Show Buy Signals")
showSell  = input.bool(${showSell}, title="Show Sell Signals")
showLong  = input.bool(${showLong}, title="Show Long Signals")
showShort = input.bool(${showShort}, title="Show Short Signals")

// === ORIGINAL CRACKOK INPUTS ===
atrLength        = input.int(14, "ATR Length", minval=1)
multiplier       = input.float(1.5, "Band Multiplier", step=0.1)

rsiLength        = input.int(14, "RSI Length", minval=1)
rsiOverbought    = input.int(70, "RSI Overbought")
rsiOversold      = input.int(30, "RSI Oversold")

volumeSpikeMult  = input.float(2.0, "Volume Spike Multiplier", minval=1.0)
volumeLength     = input.int(20, "Volume MA Length")

emaFastLength    = input.int(9, "Fast EMA Length")
emaSlowLength    = input.int(21, "Slow EMA Length")

srLookback       = input.int(100, "SR Lookback Period")

// === ORIGINAL CRACKOK CALCULATIONS ===
atr       = ta.atr(atrLength)
upperBand = close + (multiplier * atr)
lowerBand = close - (multiplier * atr)

rsi = ta.rsi(close, rsiLength)
volumeMa    = ta.sma(volume, volumeLength)
volumeSpike = volume > volumeMa * volumeSpikeMult

emaFast    = ta.ema(close, emaFastLength)
emaSlow    = ta.ema(close, emaSlowLength)
emaBullish = emaFast > emaSlow
emaBearish = emaFast < emaSlow

currentLowest  = ta.lowest(low, srLookback)
currentHighest = ta.highest(high, srLookback)

var float lastSupport = na
var float lastResistance = na

if currentLowest != nz(currentLowest[1])
    lastSupport := currentLowest

if currentHighest != nz(currentHighest[1])
    lastResistance := currentHighest

// === CHANDELIER EXIT FOR BUY/SELL SIGNALS ===
chandelierLength = input.int(22, title="Chandelier ATR Period")
chandelierMult = input.float(3.0, title="Chandelier ATR Multiplier")
useCloseExtremes = input.bool(true, title="Use Close Price for High/Low")

ceATR = chandelierMult * ta.atr(chandelierLength)
longStop = (useCloseExtremes ? ta.highest(close, chandelierLength) : ta.highest(high, chandelierLength)) - ceATR
longStopPrev = nz(longStop[1], longStop)
longStop := close[1] > longStopPrev ? math.max(longStop, longStopPrev) : longStop

shortStop = (useCloseExtremes ? ta.lowest(close, chandelierLength) : ta.lowest(low, chandelierLength)) + ceATR
shortStopPrev = nz(shortStop[1], shortStop)
shortStop := close[1] < shortStopPrev ? math.min(shortStop, shortStopPrev) : shortStop

var int dir = 1
dir := close > shortStopPrev ? 1 : close < longStopPrev ? -1 : dir

// === BUY/SELL SIGNALS (Chandelier Exit Logic) ===
buySignal = dir == 1 and dir[1] == -1
sellSignal = dir == -1 and dir[1] == 1

// === LONG/SHORT SIGNALS (CrackOS Logic) ===
longSignal = close > upperBand[1] and rsi < rsiOverbought and (emaBullish or close > nz(lastResistance)) and (volumeSpike or volume > volumeMa)
shortSignal = close < lowerBand[1] and rsi > rsiOversold and (emaBearish or close < nz(lastSupport)) and (volumeSpike or volume > volumeMa)

// === ORIGINAL CRACKOK PLOTTING (COMMENTED OUT FOR CLEAN CHART) ===
// bandColor = color.new(#2962FF, 85)
// uBand = plot(upperBand, "Upper Band", color=bandColor, linewidth=2)
// lBand = plot(lowerBand, "Lower Band", color=bandColor, linewidth=2)
// fill(uBand, lBand, color=bandColor, title="Band Fill")

// plot(emaFast, "Fast EMA", color=color.orange, linewidth=1)
// plot(emaSlow, "Slow EMA", color=color.purple, linewidth=2)

// Plot Chandelier Exit stops (COMMENTED OUT)
// plot(dir == 1 ? longStop : na, title="Chandelier Long Stop", color=color.green, linewidth=1)
// plot(dir == -1 ? shortStop : na, title="Chandelier Short Stop", color=color.red, linewidth=1)

// === SIGNAL PLOTTING (FIXED - Multiple labels per bar with better spacing) ===
// Calculate label offsets to prevent overlap when multiple signals occur
atrOffset = atr * 1.2  // Increased spacing for better separation

// Buy/Sell Signals (Chandelier Exit) - Primary positions
if buySignal and showBuy
    label.new(bar_index, low - atrOffset, "🟢 BUY " + str.tostring(close, format.mintick), style=label.style_label_up, textcolor=color.white, size=size.normal, yloc=yloc.price, color=color.blue)

if sellSignal and showSell
    label.new(bar_index, high + atrOffset, "🔴 SELL " + str.tostring(close, format.mintick), style=label.style_label_down, textcolor=color.white, size=size.normal, yloc=yloc.price, color=color.orange)

// Long/Short Signals (CrackOS) - Secondary positions (more offset to avoid overlap)
if longSignal and showLong
    label.new(bar_index, low - (atrOffset * 3), "▲ LONG " + str.tostring(close, format.mintick), style=label.style_label_up, textcolor=color.white, size=size.normal, yloc=yloc.price, color=color.green)

if shortSignal and showShort
    label.new(bar_index, high + (atrOffset * 3), "▼ SHORT " + str.tostring(close, format.mintick), style=label.style_label_down, textcolor=color.white, size=size.normal, yloc=yloc.price, color=color.red)

// plotshape(volumeSpike and close > open, "Volume Spike Up", style=shape.triangleup, location=location.belowbar, color=color.silver, size=size.tiny)
// plotshape(volumeSpike and close < open, "Volume Spike Down", style=shape.triangledown, location=location.abovebar, color=color.silver, size=size.tiny)

// plotchar(rsi >= rsiOverbought, "Overbought", char='OB', location=location.abovebar, color=color.red, size=size.tiny)
// plotchar(rsi <= rsiOversold, "Oversold", char='OS', location=location.belowbar, color=color.green, size=size.tiny)

// === DRAWING SUPPORT/RESISTANCE LINES (COMMENTED OUT) ===
// var line supLine = na
// var line resLine = na

// if not na(lastSupport)
//     if not na(supLine)
//         line.delete(supLine)
//     supLine := line.new(
//          x1=bar_index - srLookback, y1=lastSupport,
//          x2=bar_index, y2=lastSupport,
//          xloc=xloc.bar_index,
//          color=color.new(color.green, 50),
//          style=line.style_dotted,
//          width=2
//      )

// if not na(lastResistance)
//     if not na(resLine)
//         line.delete(resLine)
//     resLine := line.new(
//          x1=bar_index - srLookback, y1=lastResistance,
//          x2=bar_index, y2=lastResistance,
//          xloc=xloc.bar_index,
//          color=color.new(color.red, 50),
//          style=line.style_dotted,
//          width=2
//      )

// === ORIGINAL CRACKOK DASHBOARD PANEL (COMMENTED OUT) ===
// var bgColor = color.new(color.gray, 90)
// var table panel = table.new(position.top_right, 5, 10, bgcolor=bgColor, border_width=2)

// if barstate.islast
//     table.cell(panel, 0, 0, "CURRENT SIGNALS", bgcolor=color.new(color.blue, 80), text_color=color.white, width=4)
//     table.cell(panel, 0, 1, longSignal ? "▲ LONG SIGNAL" : shortSignal ? "▼ SHORT SIGNAL" : "NO ACTIVE SIGNAL",
//               bgcolor=longSignal ? color.new(color.green, 70) : shortSignal ? color.new(color.red, 70) : color.new(color.gray, 70),
//               text_color=color.white, width=4)

//     table.cell(panel, 0, 2, "INDICATOR VALUES", bgcolor=color.new(color.blue, 80), text_color=color.white, width=4)
//     table.cell(panel, 0, 3, "RSI: " + str.tostring(rsi, "#.##"), text_color=rsi >= rsiOverbought ? color.red : rsi <= rsiOversold ? color.green : color.white)
//     table.cell(panel, 1, 3, "ATR: " + str.tostring(atr, "#.##"), text_color=color.white)
//     table.cell(panel, 2, 3, "Vol Spike: " + str.tostring(volume/volumeMa, "#.##x"), text_color=volumeSpike ? color.yellow : color.white)
//     table.cell(panel, 3, 3, "EMA Diff: " + str.tostring(math.abs(emaFast - emaSlow)), text_color=emaBullish ? color.green : color.red)

//     table.cell(panel, 0, 4, "KEY LEVELS", bgcolor=color.new(color.blue, 80), text_color=color.white, width=4)
//     table.cell(panel, 0, 5, "Support: " + str.tostring(lastSupport, "#.##"), text_color=color.green)
//     table.cell(panel, 1, 5, "Resist: " + str.tostring(lastResistance, "#.##"), text_color=color.red)
//     table.cell(panel, 2, 5, "Upper Band: " + str.tostring(upperBand, "#.##"), text_color=color.blue)
//     table.cell(panel, 3, 5, "Lower Band: " + str.tostring(lowerBand, "#.##"), text_color=color.blue)

//     table.cell(panel, 0, 6, "STATISTICS", bgcolor=color.new(color.blue, 80), text_color=color.white, width=4)
//     table.cell(panel, 0, 7, "Bar Count: " + str.tostring(bar_index), text_color=color.white)
//     table.cell(panel, 1, 7, "Volume MA: " + str.tostring(volumeMa, "#.##"), text_color=color.white)

//     table.cell(panel, 0, 8, "PRICE ACTION", bgcolor=color.new(color.blue, 80), text_color=color.white, width=4)
//     table.cell(panel, 0, 9, "Open: " + str.tostring(open, "#.##"), text_color=color.white)
//     table.cell(panel, 1, 9, "High: " + str.tostring(high, "#.##"), text_color=color.white)
//     table.cell(panel, 2, 9, "Low: " + str.tostring(low, "#.##"), text_color=color.white)
//     table.cell(panel, 3, 9, "Close: " + str.tostring(close, "#.##"), text_color=close > open ? color.green : color.red)
`;

    // Generate symbol inputs - Remove .P if it exists and add it only once
    const symbolInputs = limitedPairs.map((pair, index) => {
        const cleanPair = pair.replace(/\.P$/, ''); // Remove .P if it exists at the end
        return `symbol${index + 1} = input.symbol("${cleanPair}.P", title="Symbol ${index + 1}")`;
    }).join('\n');

    // Function to get CrackOS signals for any symbol (OPTIMIZED - fewer security requests)
    const getSignalsFunction = `
// === MULTIPLE ALERT FUNCTIONS ===
f_getCrackOsSignals(sym) =>
    // Get essential data in one request using a tuple (OPTIMIZED - only what's needed for alerts)
    [symClose, symVolume, symAtr, symRsi, symVolumeMa, symEmaFast, symEmaSlow, symCurrentLowest, symCurrentHighest, symDir] = request.security(sym, timeframe.period, [close, volume, ta.atr(atrLength), ta.rsi(close, rsiLength), ta.sma(volume, volumeLength), ta.ema(close, emaFastLength), ta.ema(close, emaSlowLength), ta.lowest(low, srLookback), ta.highest(high, srLookback), dir])

    // Calculate bands and signals
    symUpperBand = symClose + (multiplier * symAtr)
    symLowerBand = symClose - (multiplier * symAtr)
    symVolumeSpike = symVolume > symVolumeMa * volumeSpikeMult
    symEmaBullish = symEmaFast > symEmaSlow
    symEmaBearish = symEmaFast < symEmaSlow

    // Buy/Sell signals (Chandelier Exit logic)
    symBuySignal = symDir == 1 and symDir[1] == -1
    symSellSignal = symDir == -1 and symDir[1] == 1

    // Long/Short signals (CrackOS logic)
    symLongSignal = symClose > symUpperBand[1] and symRsi < rsiOverbought and (symEmaBullish or symClose > symCurrentHighest) and (symVolumeSpike or symVolume > symVolumeMa)
    symShortSignal = symClose < symLowerBand[1] and symRsi > rsiOversold and (symEmaBearish or symClose < symCurrentLowest) and (symVolumeSpike or symVolume > symVolumeMa)

    // Calculate stop levels
    symLongStop = symLowerBand
    symShortStop = symUpperBand

    [symBuySignal, symSellSignal, symLongSignal, symShortSignal, symAtr, symRsi, symClose, symLongStop, symShortStop]
`;

    // Generate signal variables for each symbol
    const signalVariables = limitedPairs.map((_, index) =>
        `[buy${index + 1}, sell${index + 1}, long${index + 1}, short${index + 1}, atr${index + 1}, rsi${index + 1}, price${index + 1}, longStop${index + 1}, shortStop${index + 1}] = f_getCrackOsSignals(symbol${index + 1})`
    ).join('\n');

    // Alert message function
    const alertMessageFunction = `
// === Compact alert message function ===
f_alertMessage(sym, signalType, price, atr_val, rsi_val, longStop, shortStop) =>
    symStr = str.replace(str.tostring(sym), ".P", "")
    priceStr = str.tostring(price, format.mintick)
    atrStr = str.tostring(atr_val, format.mintick)
    rsiStr = str.tostring(rsi_val, format.mintick)
    longStopStr = str.tostring(longStop, format.mintick)
    shortStopStr = str.tostring(shortStop, format.mintick)

    line1 = symStr + " | " + signalType + " Signal"
    line2 = "P: " + priceStr + "  ATR: " + atrStr + "  RSI: " + rsiStr
    line3 = "LongStop: " + longStopStr + "  ShortStop: " + shortStopStr

    line1 + "\\n" + line2 + "\\n" + line3
`;

    // Check if all 4 signal types are selected (define once)
    const allSignalsSelectedCheck = `
// === Check if all 4 signal types are selected ===
allSignalsSelected = showBuy and showSell and showLong and showShort`;

    // Generate alert conditions for each symbol with CONDITIONAL LOGIC
    const alertConditions = limitedPairs.map((_, index) => `
// === Conditional Alerts for Symbol ${index + 1} ===
// When ALL 4 signals are selected - only alert on REALISTIC combinations
if allSignalsSelected
    // Alert only when logical bullish/bearish pairs occur together
    if (buy${index + 1} and long${index + 1})
        alert(f_alertMessage(symbol${index + 1}, "BUY+LONG", price${index + 1}, atr${index + 1}, rsi${index + 1}, longStop${index + 1}, shortStop${index + 1}), ${alertFreqStr})
    if (sell${index + 1} and short${index + 1})
        alert(f_alertMessage(symbol${index + 1}, "SELL+SHORT", price${index + 1}, atr${index + 1}, rsi${index + 1}, longStop${index + 1}, shortStop${index + 1}), ${alertFreqStr})

// When specific signals are selected - alert individually
else
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
    const script = `${baseScript}

// === MULTIPLE SYMBOL INPUTS ===
${symbolInputs}

${getSignalsFunction}

// === Get signals & indicators for all symbols ===
${signalVariables}

${alertMessageFunction}

${allSignalsSelectedCheck}

// === MULTIPLE ALERTS ===
${alertConditions}
`;

    // If there are more symbols than the limit, add instructions for additional scripts
    if (hasMoreSymbols) {
        const remainingSymbols = tradingPairs.slice(MAX_SYMBOLS_PER_SCRIPT);
        const additionalBatches = Math.ceil(remainingSymbols.length / MAX_SYMBOLS_PER_SCRIPT);

        const instructions = `

/*
⚠️ IMPORTANT: You have ${tradingPairs.length} symbols but this script only monitors the first ${MAX_SYMBOLS_PER_SCRIPT}.

REMAINING SYMBOLS (${remainingSymbols.length}):
${remainingSymbols.map((pair, index) => `${index + 1}. ${pair}`).join('\n')}

TO MONITOR ALL SYMBOLS:
1. Create ${additionalBatches} additional Pine Script(s)
2. Copy this script and replace the symbol inputs with the remaining symbols
3. For the next batch, use symbols ${MAX_SYMBOLS_PER_SCRIPT + 1}-${Math.min(MAX_SYMBOLS_PER_SCRIPT * 2, tradingPairs.length)}

TradingView Limitation: Each script can only make 40 security requests.
Each symbol requires ~1 request, so maximum 35 symbols per script.
*/`;

        return script + instructions;
    }

    return script;
};

// Helper function to generate multiple scripts for large symbol lists
export const generateMultiplePineScripts = (
    tradingPairs: string[],
    signalTypes: string[] | SignalType = ['buy_only'],
    alertFrequency: AlertFrequency = 'once_per_bar'
): { scripts: string[], totalScripts: number, symbolsPerScript: number } => {
    const MAX_SYMBOLS_PER_SCRIPT = 35;
    const totalScripts = Math.ceil(tradingPairs.length / MAX_SYMBOLS_PER_SCRIPT);
    const scripts: string[] = [];

    for (let i = 0; i < totalScripts; i++) {
        const startIndex = i * MAX_SYMBOLS_PER_SCRIPT;
        const endIndex = Math.min(startIndex + MAX_SYMBOLS_PER_SCRIPT, tradingPairs.length);
        const batchSymbols = tradingPairs.slice(startIndex, endIndex);

        const script = generatePineScript(batchSymbols, signalTypes, alertFrequency);
        scripts.push(script);
    }

    return {
        scripts,
        totalScripts,
        symbolsPerScript: MAX_SYMBOLS_PER_SCRIPT
    };
};