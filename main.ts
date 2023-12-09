// main.ts
import { get_latest } from './realtime';
import { startSync } from './fetchDataForTickers';
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