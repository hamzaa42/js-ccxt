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
// main.ts
const realtime_1 = require("./realtime");
const fetchDataForTickers_1 = require("./fetchDataForTickers");
const initialize_tickers_1 = require("./initialize_tickers");
const client_1 = require("@prisma/client");
const ccxt_1 = __importDefault(require("ccxt"));
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const prisma = new client_1.PrismaClient();
        const binance = new ccxt_1.default.pro.binance();
        yield (0, initialize_tickers_1.initializeTickers)(prisma);
        yield (0, fetchDataForTickers_1.startSync)(prisma, binance);
        yield (0, realtime_1.get_latest)(prisma, binance);
        yield binance.close();
        yield prisma.$disconnect();
    });
}
main();
