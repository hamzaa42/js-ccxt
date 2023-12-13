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
exports.build_latest = void 0;
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
// to test
function get_row_ago(prisma, tickerName, mostRecentTimestamp, ms) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const oldstamp = mostRecentTimestamp - ms;
            // console.log(oldstamp)
            const price_oi_data = yield prisma.price_oi_data.findFirst({
                where: {
                    timestamp: oldstamp,
                    ticker_name: tickerName,
                },
            });
            return price_oi_data;
        }
        catch (error) {
            console.error('Error getting indexes for change calculation:', error);
            throw error;
        }
    });
}
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
//todo
function getTickersMcap(prisma) {
    return __awaiter(this, void 0, void 0, function* () {
    });
}
function calculateChange(recent_val, old_val) {
    //maybe not multiple with 100 and keep percent, lets see
    return Math.round(((recent_val - old_val) / old_val) * 10000) / 100;
}
function fetchDataAndCalculateChanges(prisma, ticker, latestData, latestOi, timestamp, delay) {
    return __awaiter(this, void 0, void 0, function* () {
        if (delay == false) {
            const openHelper = yield get_row(prisma, ticker, timestamp);
            // console.log(timestamp)
            // console.log(openHelper)
            if (openHelper === null) {
                console.log(`Data is null for timestamp ${timestamp}`);
                return null;
            }
            const oiData = openHelper['oi'];
            const oiChange = oiData !== null ? calculateChange(latestOi, oiData) : null;
            const priceChange = calculateChange(latestData['c'], openHelper['c']);
            return { priceChange, oiChange };
        }
        else {
            const delayHelper = yield get_row(prisma, ticker, timestamp);
            if (delayHelper === null) {
                console.log(`Data is null for timestamp ${timestamp}`);
                return null;
            }
            const oiData = delayHelper['oi'];
            const oiChange = oiData !== null ? calculateChange(latestOi, oiData) : null;
            const priceChange = calculateChange(latestData['c'], delayHelper['c']);
            return { priceChange, oiChange };
        }
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
        try {
            const monthly_open = calculateOpenTimestamp(latest_stamp + 300000, '1M');
            // console.log(monthly_open)
            const weekly_open = calculateOpenTimestamp(latest_stamp + 300000, '1W');
            // console.log(weekly_open)
            const daily_open = calculateOpenTimestamp(latest_stamp + 300000, '1D');
            // console.log(daily_open)
            const four_hour_open = calculateOpenTimestamp(latest_stamp + 300000, '4h');
            // console.log(four_hour_open)
            const one_hour_open = calculateOpenTimestamp(latest_stamp + 300000, '1h');
            // console.log(one_hour_open)
            const fifteen_minute_open = calculateOpenTimestamp(latest_stamp + 300000, '15m');
            // console.log(fifteen_minute_open)
            const monthlyData = (yield fetchDataAndCalculateChanges(prisma, ticker, latest_data, latest_oi, monthly_open - 300000, false)) || { priceChange: null, oiChange: null };
            console.log('Monthly Open Price Change:', monthlyData.priceChange !== null ? monthlyData.priceChange : 'Data is null');
            console.log('Monthly Open OI Change:', monthlyData.oiChange !== null ? monthlyData.oiChange : 'Data is null');
            const weeklyData = (yield fetchDataAndCalculateChanges(prisma, ticker, latest_data, latest_oi, weekly_open - 300000, false)) || { priceChange: null, oiChange: null };
            console.log('Weekly Open Price Change:', weeklyData.priceChange !== null ? weeklyData.priceChange : 'Data is null');
            console.log('Weekly Open OI Change:', weeklyData.oiChange !== null ? weeklyData.oiChange : 'Data is null');
            const dailyData = (yield fetchDataAndCalculateChanges(prisma, ticker, latest_data, latest_oi, daily_open - 300000, false)) || { priceChange: null, oiChange: null };
            console.log('Daily Open Price Change:', dailyData.priceChange !== null ? dailyData.priceChange : 'Data is null');
            console.log('Daily Open OI Change:', dailyData.oiChange !== null ? dailyData.oiChange : 'Data is null');
            const fourHourData = (yield fetchDataAndCalculateChanges(prisma, ticker, latest_data, latest_oi, four_hour_open - 300000, false)) || { priceChange: null, oiChange: null };
            console.log('Four-Hour Open Price Change:', fourHourData.priceChange !== null ? fourHourData.priceChange : 'Data is null');
            console.log('Four-Hour Open OI Change:', fourHourData.oiChange !== null ? fourHourData.oiChange : 'Data is null');
            const oneHourData = (yield fetchDataAndCalculateChanges(prisma, ticker, latest_data, latest_oi, one_hour_open - 300000, false)) || { priceChange: null, oiChange: null };
            console.log('One-Hour Open Price Change:', oneHourData.priceChange !== null ? oneHourData.priceChange : 'Data is null');
            console.log('One-Hour Open OI Change:', oneHourData.oiChange !== null ? oneHourData.oiChange : 'Data is null');
            const fifteenMinuteData = (yield fetchDataAndCalculateChanges(prisma, ticker, latest_data, latest_oi, fifteen_minute_open - 300000, false)) || { priceChange: null, oiChange: null };
            console.log('Fifteen-Minute Open Price Change:', fifteenMinuteData.priceChange !== null ? fifteenMinuteData.priceChange : 'Data is null');
            console.log('Fifteen-Minute Open OI Change:', fifteenMinuteData.oiChange !== null ? fifteenMinuteData.oiChange : 'Data is null');
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
            const fifteenMinutesAgoData = (yield fetchDataAndCalculateChanges(prisma, ticker, latest_data, latest_oi, fifteen_minutes_ago, true)) || { priceChange: null, oiChange: null };
            const oneHourAgoData = (yield fetchDataAndCalculateChanges(prisma, ticker, latest_data, latest_oi, one_hour_ago, true)) || { priceChange: null, oiChange: null };
            const fourHoursAgoData = (yield fetchDataAndCalculateChanges(prisma, ticker, latest_data, latest_oi, four_hours_ago, true)) || { priceChange: null, oiChange: null };
            const dayAgoData = (yield fetchDataAndCalculateChanges(prisma, ticker, latest_data, latest_oi, day_ago, true)) || { priceChange: null, oiChange: null };
            const weekAgoData = (yield fetchDataAndCalculateChanges(prisma, ticker, latest_data, latest_oi, week_ago, true)) || { priceChange: null, oiChange: null };
            const monthAgoData = (yield fetchDataAndCalculateChanges(prisma, ticker, latest_data, latest_oi, month_ago, true)) || { priceChange: null, oiChange: null };
            // Console log statements
            console.log('Month Ago Price Change:', monthAgoData.priceChange !== null ? monthAgoData.priceChange : 'Data is null');
            console.log('Month Ago OI Change:', monthAgoData.oiChange !== null ? monthAgoData.oiChange : 'Data is null');
            console.log('Week Ago Price Change:', weekAgoData.priceChange !== null ? weekAgoData.priceChange : 'Data is null');
            console.log('Week Ago OI Change:', weekAgoData.oiChange !== null ? weekAgoData.oiChange : 'Data is null');
            console.log('Day Ago Price Change:', dayAgoData.priceChange !== null ? dayAgoData.priceChange : 'Data is null');
            console.log('Day Ago OI Change:', dayAgoData.oiChange !== null ? dayAgoData.oiChange : 'Data is null');
            console.log('Four Hours Ago Price Change:', fourHoursAgoData.priceChange !== null ? fourHoursAgoData.priceChange : 'Data is null');
            console.log('Four Hours Ago OI Change:', fourHoursAgoData.oiChange !== null ? fourHoursAgoData.oiChange : 'Data is null');
            console.log('One Hour Ago Price Change:', oneHourAgoData.priceChange !== null ? oneHourAgoData.priceChange : 'Data is null');
            console.log('One Hour Ago OI Change:', oneHourAgoData.oiChange !== null ? oneHourAgoData.oiChange : 'Data is null');
            console.log('Fifteen Minutes Ago Price Change:', fifteenMinutesAgoData.priceChange !== null ? fifteenMinutesAgoData.priceChange : 'Data is null');
            console.log('Fifteen Minutes Ago OI Change:', fifteenMinutesAgoData.oiChange !== null ? fifteenMinutesAgoData.oiChange : 'Data is null');
        }
        catch (error) {
            console.error('Error in main function:', error);
        }
    });
}
exports.build_latest = build_latest;
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const prisma = new client_1.PrismaClient();
        const binance = new ccxt_1.default.pro.binance();
        const startTime = Date.now(); // Record start time
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
main();
