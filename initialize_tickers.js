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
exports.initializeTickers = void 0;
const fs_1 = require("fs");
function initializeTickers(prisma) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Read the master_data.json file
            const masterData = yield fs_1.promises.readFile('master_data.json', 'utf-8');
            const tickerData = JSON.parse(masterData);
            try {
                yield prisma.tickers.deleteMany({
                    where: {},
                });
            }
            catch (error) {
                console.log('probably no tickers');
            }
            // Create or update tickers in the database
            const createTickerPromises = Object.entries(tickerData).map(([tickerSymbol, data]) => __awaiter(this, void 0, void 0, function* () {
                return prisma.tickers.upsert({
                    where: { ticker_name: tickerSymbol },
                    create: {
                        ticker_name: tickerSymbol,
                        circ_supply: data.circ_supply,
                        tags: { set: data.tags }
                    },
                    update: {
                        circ_supply: data.circ_supply,
                        tags: { set: data.tags },
                    },
                });
            }));
            yield Promise.all(createTickerPromises);
            console.log('Ticker list initialized successfully!');
        }
        catch (error) {
            console.error('Error initializing tickers:', error);
        }
    });
}
exports.initializeTickers = initializeTickers;
