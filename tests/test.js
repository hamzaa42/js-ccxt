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
const client_1 = require("@prisma/client");
function getIndexesForChangeCalculation(prisma, tickerName, minutes) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Fetch the most recent timestamp
            const mostRecentTimestamp = yield prisma.price_oi_data.findFirst({
                where: {
                    ticker_name: tickerName,
                },
                orderBy: {
                    timestamp: 'desc',
                },
            });
            if (!mostRecentTimestamp) {
                console.log(`No data found for ticker ${tickerName}`);
                return [null];
            }
            // Calculate the timestamp exactly 'minutes' ago
            const timestampAgo = mostRecentTimestamp.timestamp - BigInt(minutes * 60 * 1000);
            // Fetch data from the database for the specified ticker and timestamp
            const price_oi_data = yield prisma.price_oi_data.findFirst({
                where: {
                    timestamp: timestampAgo,
                    ticker_name: tickerName,
                },
            });
            return [mostRecentTimestamp, price_oi_data];
        }
        catch (error) {
            console.error('Error getting indexes for change calculation:', error);
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
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const prisma = new client_1.PrismaClient();
        try {
            const data = yield getIndexesForChangeCalculation(prisma, '1000BONKUSDT', 15);
            console.log(data);
            const highest = yield getHighestValue(prisma, 'BTCUSDT', BigInt(1701475200000), BigInt(1702140130000));
            console.log(highest);
        }
        catch (error) {
            console.error('Error in main function:', error);
        }
        finally {
            yield prisma.$disconnect();
        }
    });
}
main();
