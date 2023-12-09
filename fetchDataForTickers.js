"use strict";
// fetchDataForTickers.ts
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startSync = void 0;
const fetch_tickers_1 = require("./fetch_tickers");
function fetchUpdate(prisma, start, exchange, tickers, step) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(`Start: ${start}`);
        try {
            // Map tickers to an array of promises for fetching and saving data
            const promises = tickers.map((tickerSymbol) => __awaiter(this, void 0, void 0, function* () {
                var _a;
                const modifiedTicker = tickerSymbol.slice(0, -4) + '/USDT:USDT';
                try {
                    const [tickerData, OIData] = yield Promise.all([
                        exchange.fetchOHLCV(modifiedTicker, '5m', start, step),
                        exchange.fetchOpenInterestHistory(modifiedTicker, '5m', start, step).catch((oiError) => {
                            console.error('OI Fuckery');
                            return [];
                        }),
                    ]);
                    const dataToSave = [];
                    for (let i = 0; i < tickerData.length; i++) {
                        const ticker_name = tickerSymbol;
                        const timestamp = Number(tickerData[i][0] || NaN);
                        const price_data = tickerData[i];
                        const o = parseFloat(price_data[1]); // Open
                        const h = parseFloat(price_data[2]); // High
                        const l = parseFloat(price_data[3]); // Low
                        const c = parseFloat(price_data[4]); // Close
                        const oiInfo = (_a = OIData[i]) === null || _a === void 0 ? void 0 : _a.info;
                        const oi = oiInfo ? parseInt(oiInfo.sumOpenInterestValue) : null;
                        dataToSave.push({
                            ticker_name,
                            timestamp,
                            o,
                            h,
                            l,
                            c,
                            oi
                        });
                    }
                    // Save data for the current ticker
                    yield prisma.price_oi_data.createMany({
                        data: dataToSave,
                    });
                    console.log(`Fetched and saved data for ${modifiedTicker}`);
                }
                catch (error) {
                    console.error(`Error fetching or saving data for ${modifiedTicker}:`, error.message);
                }
            }));
            // Wait for all promises to complete
            yield Promise.all(promises);
            console.log('Data fetching and saving completed!');
        }
        catch (error) {
            console.error('Error fetching data:', error.message);
        }
    });
}
function getCurrentUtcMidnightTimestamp() {
    const now = new Date();
    const utcMidnight = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    return utcMidnight.getTime();
}
function startSync(prisma, exchange) {
    return __awaiter(this, void 0, void 0, function* () {
        // Read the master_data.json file
        const tickers = yield (0, fetch_tickers_1.fetchTickers)(prisma);
        const step = 288;
        const currentUtcMidnightTimestamp = getCurrentUtcMidnightTimestamp();
        const increment = 5 * 60 * step * 1000; // 5 minutes * step in milliseconds
        const fiveMinutes = 5 * 60 * 1000; // 5 minutes in milliseconds 
        const singleDay = fiveMinutes * 288;
        // let timestamp = currentUtcMidnightTimestamp - singleDay*4 
        let timestamp = currentUtcMidnightTimestamp - singleDay * 7;
        while (Date.now() - timestamp > 0) {
            yield fetchUpdate(prisma, timestamp, exchange, tickers, step - 1);
            timestamp = timestamp + increment;
        }
    });
}
exports.startSync = startSync;
