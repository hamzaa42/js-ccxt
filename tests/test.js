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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.main = exports.build_latest = exports.calculateChange = exports.getLatestData = exports.getLatestTimestamp = exports.calculateOpenTimestamp = exports.fetch_calculate_extreme_change = exports.getHighestValue = exports.getLowestValue = exports.get_row = void 0;
const client_1 = require("@prisma/client");
const ccxt_1 = __importDefault(require("ccxt"));
const fetch_tickers_1 = require("../fetch_tickers");
function get_row(prisma, tickerName, timestamp) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const row = yield prisma.price_oi_data.findFirst({
                where: {
                    timestamp: timestamp,
                    ticker_name: tickerName,
                },
            });
            return row;
        }
        catch (error) {
            console.error('Error getting indexes for change calculation:', error);
            throw error;
        }
    });
}
exports.get_row = get_row;
// // to test
// async function get_row_ago(
//   prisma: PrismaClient,
//   tickerName: string,
//   mostRecentTimestamp: number,
//   ms: number
// ): Promise<price_oi_data | null> {
//   try {
//     const oldstamp = mostRecentTimestamp - ms
//     // console.log(oldstamp)
//     const price_oi_data = await prisma.price_oi_data.findFirst({
//       where: {
//         timestamp: oldstamp,
//         ticker_name: tickerName,
//       },
//     });
//     return price_oi_data;
//   } catch (error) {
//     console.error('Error getting indexes for change calculation:', error);
//     throw error;
//   }
// }
function getLowestValue(prisma, tickerName, startTimestamp, endTimestamp) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const lowestValueRow = yield prisma.price_oi_data.findFirst({
                where: {
                    ticker_name: tickerName,
                    timestamp: {
                        gte: startTimestamp,
                        lte: endTimestamp,
                    },
                },
                orderBy: {
                    l: 'asc',
                },
            });
            return lowestValueRow;
        }
        catch (error) {
            console.error('Error getting lowest value:', error);
            throw error;
        }
    });
}
exports.getLowestValue = getLowestValue;
function getHighestValue(prisma, tickerName, startTimestamp, endTimestamp) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const highestValueRow = yield prisma.price_oi_data.findFirst({
                where: {
                    ticker_name: tickerName,
                    timestamp: {
                        gte: startTimestamp,
                        lte: endTimestamp,
                    },
                },
                orderBy: {
                    h: 'desc',
                },
            });
            return highestValueRow;
        }
        catch (error) {
            console.error('Error getting highest value:', error);
            throw error;
        }
    });
}
exports.getHighestValue = getHighestValue;
function fetch_calculate_extreme_change(prisma, ticker, startTimestamp, endTimestamp, latestData, isHighest) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const extremeValueRow = isHighest
                ? yield getHighestValue(prisma, ticker, startTimestamp, endTimestamp)
                : yield getLowestValue(prisma, ticker, startTimestamp, endTimestamp);
            if (!extremeValueRow) {
                console.log(`Data is null for ticker ${ticker} between ${startTimestamp} and ${endTimestamp}`);
                return null;
            }
            const change = calculateChange(latestData['c'], extremeValueRow['c']);
            return change;
        }
        catch (error) {
            console.error('Error fetching and calculating extreme change:', error);
            throw error;
        }
    });
}
exports.fetch_calculate_extreme_change = fetch_calculate_extreme_change;
function calculateOpenTimestamp(currentTimestamp, timeframe) {
    const currentUTCDayStart = new Date(Date.UTC(new Date(currentTimestamp).getUTCFullYear(), new Date(currentTimestamp).getUTCMonth(), new Date(currentTimestamp).getUTCDate(), 0, 0, 0, 0));
    const dailyOpen = currentUTCDayStart.getTime();
    const timeFromDailyOpen = currentTimestamp - dailyOpen;
    switch (timeframe) {
        case '1M':
            return (Date.UTC(new Date(currentTimestamp).getUTCFullYear(), new Date(currentTimestamp).getUTCMonth(), 1));
        case '1W':
            const daysUntilMonday = new Date(currentTimestamp).getUTCDay() === 0 ? 6 : new Date(currentTimestamp).getUTCDay() - 1;
            return (dailyOpen - daysUntilMonday * 24 * 60 * 60 * 1000);
        case '1D':
            return (dailyOpen);
        case '4h':
            const closest4hOpen = dailyOpen + Math.floor(timeFromDailyOpen / (4 * 60 * 60 * 1000)) * (4 * 60 * 60 * 1000);
            return (closest4hOpen);
        case '1h':
            const closest1hOpen = dailyOpen + Math.floor(timeFromDailyOpen / (60 * 60 * 1000)) * (60 * 60 * 1000);
            return (closest1hOpen);
        case '15m':
            const closest15minOpen = dailyOpen + Math.floor(timeFromDailyOpen / (15 * 60 * 1000)) * (15 * 60 * 1000);
            return (closest15minOpen);
        default:
            throw new Error('Invalid timeframe');
    }
}
exports.calculateOpenTimestamp = calculateOpenTimestamp;
function getLatestTimestamp(prisma, tickerName) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const latestData = yield prisma.price_oi_data.findFirst({
                where: {
                    ticker_name: tickerName,
                },
                orderBy: {
                    timestamp: 'desc',
                },
                select: {
                    timestamp: true,
                },
            });
            return Number(latestData === null || latestData === void 0 ? void 0 : latestData.timestamp);
        }
        catch (error) {
            console.error('Error getting latest timestamp:', error.message);
            throw error;
        }
    });
}
exports.getLatestTimestamp = getLatestTimestamp;
function getLatestData(prisma, tickerName) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const latestData = yield prisma.price_oi_data.findFirst({
                where: {
                    ticker_name: tickerName,
                },
                orderBy: {
                    timestamp: 'desc',
                }
            });
            return latestData;
        }
        catch (error) {
            console.error('Error getting latest data:', error.message);
            throw error;
        }
    });
}
exports.getLatestData = getLatestData;
const getTickerSupply = (prisma, tickerName) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const ticker = yield prisma.tickers.findUnique({
            where: {
                ticker_name: tickerName,
            },
            select: {
                circ_supply: true,
            },
        });
        if (!ticker) {
            console.error(`Ticker with name ${tickerName} not found.`);
            return null;
        }
        return ticker.circ_supply;
    }
    catch (error) {
        console.error(`Error fetching supply for ${tickerName}:`, error);
        throw error;
    }
});
function calculateChange(recent_val, old_val) {
    //maybe not multiple with 100 and keep percent, lets see
    return Math.round(((recent_val - old_val) / old_val) * 10000) / 100;
}
exports.calculateChange = calculateChange;
function fetch_calculate_change(prisma, ticker, latestData, latestOi, timestamp) {
    return __awaiter(this, void 0, void 0, function* () {
        const helper = yield get_row(prisma, ticker, timestamp);
        // console.log(timestamp)
        // console.log(openHelper)
        if (helper === null) {
            console.log(`Data is null for timestamp ${timestamp}`);
            return null;
        }
        const oiData = helper['oi'];
        const oiChange = oiData !== null ? calculateChange(latestOi, oiData) : null;
        const priceChange = calculateChange(latestData['c'], helper['c']);
        return { priceChange, oiChange };
    });
}
function fetchCurrentOI(exchange, ticker, epoch) {
    return __awaiter(this, void 0, void 0, function* () {
        const modifierTicker = ticker.slice(0, -4) + '/USDT:USDT';
        const oiData = yield exchange.fetchOpenInterestHistory(modifierTicker, '5m', epoch);
        // console.log(oiData)
        return parseInt(oiData[oiData.length - 1].info.sumOpenInterestValue);
    });
}
function build_latest(prisma, exchange, ticker) {
    return __awaiter(this, void 0, void 0, function* () {
        const latest_data = yield getLatestData(prisma, ticker);
        const latest_stamp = yield getLatestTimestamp(prisma, ticker);
        const latest_oi = yield fetchCurrentOI(exchange, ticker, latest_stamp);
        if (latest_data != null && latest_stamp != null && latest_oi != null) {
            const circ = yield getTickerSupply(prisma, ticker);
            let mcap = circ * latest_data['c'];
            if (ticker.slice(0, 4) === '1000') {
                // If true, divide mcap by 1000
                mcap = mcap / 1000;
            }
            const oi_over_mcap_percentage = Math.round((latest_oi / mcap) * 10000) / 100;
            try {
                const monthly_open = calculateOpenTimestamp(latest_stamp + 300000, '1M');
                const weekly_open = calculateOpenTimestamp(latest_stamp + 300000, '1W');
                const daily_open = calculateOpenTimestamp(latest_stamp + 300000, '1D');
                const four_hour_open = calculateOpenTimestamp(latest_stamp + 300000, '4h');
                const one_hour_open = calculateOpenTimestamp(latest_stamp + 300000, '1h');
                const fifteen_minute_open = calculateOpenTimestamp(latest_stamp + 300000, '15m');
                const fifteen_minutes_ago_calc = 1000 * 60 * 15;
                const one_hour_ago_calc = fifteen_minutes_ago_calc * 4;
                const four_hours_ago_calc = one_hour_ago_calc * 4;
                const day_ago_calc = 1000 * 60 * 60 * 24;
                const week_ago_calc = day_ago_calc * 7;
                const month_ago_calc = day_ago_calc * 30;
                const fifteen_minutes_ago = latest_stamp - fifteen_minutes_ago_calc;
                const one_hour_ago = latest_stamp - one_hour_ago_calc;
                const four_hours_ago = latest_stamp - four_hours_ago_calc;
                const day_ago = latest_stamp - day_ago_calc;
                const week_ago = latest_stamp - week_ago_calc;
                const month_ago = latest_stamp - month_ago_calc;
                const fifteenMinutes_rolling_data = (yield fetch_calculate_change(prisma, ticker, latest_data, latest_oi, fifteen_minutes_ago)) || { priceChange: null, oiChange: null };
                const oneHour_rolling_data = (yield fetch_calculate_change(prisma, ticker, latest_data, latest_oi, one_hour_ago)) || { priceChange: null, oiChange: null };
                const fourHours_rolling_data = (yield fetch_calculate_change(prisma, ticker, latest_data, latest_oi, four_hours_ago)) || { priceChange: null, oiChange: null };
                const day_rolling_data = (yield fetch_calculate_change(prisma, ticker, latest_data, latest_oi, day_ago)) || { priceChange: null, oiChange: null };
                const week_rolling_data = (yield fetch_calculate_change(prisma, ticker, latest_data, latest_oi, week_ago)) || { priceChange: null, oiChange: null };
                const month_rolling_data = (yield fetch_calculate_change(prisma, ticker, latest_data, latest_oi, month_ago)) || { priceChange: null, oiChange: null };
                const monthly_data = (yield fetch_calculate_change(prisma, ticker, latest_data, latest_oi, monthly_open - 300000)) || { priceChange: null, oiChange: null };
                const weekly_data = (yield fetch_calculate_change(prisma, ticker, latest_data, latest_oi, weekly_open - 300000)) || { priceChange: null, oiChange: null };
                const daily_data = (yield fetch_calculate_change(prisma, ticker, latest_data, latest_oi, daily_open - 300000)) || { priceChange: null, oiChange: null };
                const fourHour_data = (yield fetch_calculate_change(prisma, ticker, latest_data, latest_oi, four_hour_open - 300000)) || { priceChange: null, oiChange: null };
                const oneHour_data = (yield fetch_calculate_change(prisma, ticker, latest_data, latest_oi, one_hour_open - 300000)) || { priceChange: null, oiChange: null };
                const fifteenMinute_data = (yield fetch_calculate_change(prisma, ticker, latest_data, latest_oi, fifteen_minute_open - 300000)) || { priceChange: null, oiChange: null };
                const rolling_mothly_high = (yield fetch_calculate_extreme_change(prisma, ticker, month_ago, latest_stamp, latest_data, true)) || null;
                const rolling_weekly_high = (yield fetch_calculate_extreme_change(prisma, ticker, week_ago, latest_stamp, latest_data, true)) || null;
                const rolling_daily_high = yield fetch_calculate_extreme_change(prisma, ticker, day_ago, latest_stamp, latest_data, true);
                const rolling_mothly_low = (yield fetch_calculate_extreme_change(prisma, ticker, month_ago, latest_stamp, latest_data, false)) || null;
                const rolling_weekly_low = (yield fetch_calculate_extreme_change(prisma, ticker, week_ago, latest_stamp, latest_data, false)) || null;
                const rolling_daily_low = yield fetch_calculate_extreme_change(prisma, ticker, day_ago, latest_stamp, latest_data, false);
                const open_mothly_high = (yield fetch_calculate_extreme_change(prisma, ticker, monthly_open, latest_stamp, latest_data, true)) || null;
                const open_weekly_high = (yield fetch_calculate_extreme_change(prisma, ticker, weekly_open, latest_stamp, latest_data, true)) || null;
                const open_daily_high = yield fetch_calculate_extreme_change(prisma, ticker, daily_open, latest_stamp, latest_data, true);
                const open_mothly_low = (yield fetch_calculate_extreme_change(prisma, ticker, monthly_open, latest_stamp, latest_data, false)) || null;
                const open_weekly_low = (yield fetch_calculate_extreme_change(prisma, ticker, weekly_open, latest_stamp, latest_data, false)) || null;
                const open_daily_low = yield fetch_calculate_extreme_change(prisma, ticker, daily_open, latest_stamp, latest_data, false);
                const prismaCreateCommand = yield prisma.latest_insights.create({
                    data: {
                        ticker_name: ticker,
                        timestamp: (latest_stamp + 3000),
                        mcap: mcap,
                        oi_mcap: oi_over_mcap_percentage,
                        o: latest_data['c'],
                        oi: latest_oi,
                        // Rolling price and open interest data
                        r_p_15m: fifteenMinutes_rolling_data.priceChange,
                        r_p_1h: oneHour_rolling_data.priceChange,
                        r_p_4h: fourHours_rolling_data.priceChange,
                        r_p_1W: week_rolling_data.priceChange,
                        r_p_1D: day_rolling_data.priceChange || null,
                        r_p_1M: month_rolling_data.priceChange || null,
                        r_oi_15m: fifteenMinutes_rolling_data.oiChange,
                        r_oi_1h: oneHour_rolling_data.oiChange,
                        r_oi_4h: fourHours_rolling_data.oiChange,
                        r_oi_1D: day_rolling_data.oiChange,
                        r_oi_1W: week_rolling_data.oiChange || null,
                        r_oi_1M: month_rolling_data.oiChange || null,
                        r_MH: rolling_mothly_high || null,
                        r_WH: rolling_weekly_high || null,
                        r_DH: rolling_daily_high,
                        r_ML: rolling_mothly_low || null,
                        r_WL: rolling_weekly_low || null,
                        r_DL: rolling_daily_low,
                        // Opening price and open interest data
                        o_p_15m: fifteenMinute_data.priceChange,
                        o_p_1h: oneHour_data.priceChange,
                        o_p_4h: fourHour_data.priceChange,
                        o_p_1D: daily_data.priceChange,
                        o_p_1W: weekly_data.priceChange,
                        o_p_1M: monthly_data.priceChange,
                        o_oi_15m: fifteenMinute_data.oiChange,
                        o_oi_1h: oneHour_data.oiChange,
                        o_oi_4h: fourHour_data.oiChange,
                        o_oi_1D: daily_data.oiChange,
                        o_oi_1W: weekly_data.oiChange || null,
                        o_oi_1M: monthly_data.oiChange || null,
                        o_MH: open_mothly_high || null,
                        o_WH: open_weekly_high || null,
                        o_DH: open_daily_high,
                        o_ML: open_mothly_low || null,
                        o_WL: open_weekly_low || null,
                        o_DL: open_daily_low,
                    }
                });
            }
            catch (error) {
                console.error('Error in main function:', error);
            }
        }
        else {
            console.log('shrekt');
        }
    });
}
exports.build_latest = build_latest;
//uncomment after testing
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const prisma = new client_1.PrismaClient();
        const binance = new ccxt_1.default.pro.binance();
        const startTime = Date.now(); // Record start time
        const testTicker = 'BTCUSDT';
        try {
            // Delete all records from the PriceOpenInterestData table
            yield prisma.latest_insights.deleteMany({
                where: {},
            });
            console.log('All records deleted successfully');
        }
        catch (error) {
            console.error('Error deleting records:', error.message);
        }
        try {
            const tickers = yield (0, fetch_tickers_1.fetchTickers)(prisma);
            yield Promise.all(tickers.map((ticker) => __awaiter(this, void 0, void 0, function* () {
                yield build_latest(prisma, binance, ticker);
            })));
        }
        catch (error) {
            console.error('Error in main function:', error);
        }
        finally {
            const endTime = Date.now(); // Record end time
            const timeDifference = endTime - startTime;
            console.log(`Total time taken: ${timeDifference} ms`);
            yield prisma.$disconnect();
            yield binance.close();
        }
    });
}
exports.main = main;
// main();
