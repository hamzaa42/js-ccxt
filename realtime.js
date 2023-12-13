"use strict";
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
exports.get_latest = void 0;
// websocketUpdater.ts
const fetch_tickers_1 = require("./fetch_tickers");
function get_fast(prisma, exchange, tickers, epoch) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const results = yield Promise.all(tickers.map((tickerSymbol) => __awaiter(this, void 0, void 0, function* () {
                const modifiedTicker = tickerSymbol.slice(0, -4) + '/USDT:USDT';
                //querying OI data at open of last candle and current candle
                // saving it as oi data at "close"
                const OIDataPromise = exchange.fetchOpenInterestHistory(modifiedTicker, '5m', epoch, 1);
                const tickerDataPromise = exchange.fetchOHLCV(modifiedTicker, '5m', epoch, 1);
                const [OIData, tickerData] = yield Promise.all([OIDataPromise, tickerDataPromise]);
                const dataToSave = [];
                const oi = parseInt(OIData[0].info.sumOpenInterestValue);
                const timestamp = tickerData[0][0];
                const o = tickerData[0][1];
                const h = tickerData[0][2];
                const l = tickerData[0][3];
                const c = tickerData[0][4];
                dataToSave.push({
                    ticker_name: tickerSymbol,
                    timestamp,
                    o,
                    h,
                    l,
                    c,
                    oi,
                });
                try {
                    yield prisma.price_oi_data.createMany({
                        data: dataToSave,
                    });
                }
                catch (error) {
                    console.error('Error saving data:', error.message);
                    try {
                        yield prisma.price_oi_data.upsert({
                            where: {
                                stampTicker: {
                                    timestamp: tickerData[0][0],
                                    ticker_name: tickerSymbol,
                                },
                            },
                            update: {
                                o,
                                h,
                                l,
                                c,
                                oi,
                            },
                            create: {
                                ticker_name: tickerSymbol,
                                timestamp: timestamp,
                                o: o,
                                h: h,
                                l: l,
                                c: c,
                                oi: oi,
                            },
                        });
                    }
                    catch (error) {
                        console.error('Error updating data', error.message);
                    }
                }
                // Save data for the current ticker
                console.log(`Fetched and saved data for ${modifiedTicker}`);
            })));
        }
        catch (error) {
            console.error('Error fetching data:', error.message);
        }
    });
}
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
function get_latest(prisma, exchange) {
    return __awaiter(this, void 0, void 0, function* () {
        while (true) {
            const tickers = yield (0, fetch_tickers_1.fetchTickers)(prisma);
            let epochTime = Math.floor(new Date().getTime() / 1000) * 1000;
            // Calculate the time until the next 5th minute plus 1 second
            const seconds_until_next_run = (300 - (new Date().getSeconds() + 60 * new Date().getMinutes()) % 300) + 1;
            console.log(seconds_until_next_run);
            epochTime = epochTime + seconds_until_next_run * 1000 - 301000;
            console.log(epochTime);
            yield sleep(seconds_until_next_run * 1000);
            yield get_fast(prisma, exchange, tickers, epochTime);
        }
    });
}
exports.get_latest = get_latest;
