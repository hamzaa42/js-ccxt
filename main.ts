// main.ts
import { get_latest } from './fetch_realtime';
import { startSync } from './fetch_historical';
import { initializeTickers } from './initialize_tickers';

import { PrismaClient } from '@prisma/client';
import ccxt from 'ccxt';


async function main() {
    
    const prisma = new PrismaClient();
    const binance = new ccxt.pro.binance();
    await initializeTickers(prisma)
    await startSync(prisma,binance)    
    await get_latest(prisma, binance);
    await binance.close()
    await prisma.$disconnect();

}

main()