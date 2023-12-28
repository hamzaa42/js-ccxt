// websocketUpdater.ts
import { fetchTickers } from './fetch_tickers';
import { build_latest } from './build_latest';

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}


async function fetchWithRetry(fetchFunction : any, maxRetries = 3, retryDelay = 1000) {
  let retries = 0;

  while (retries < maxRetries) {
    try {
      return await fetchFunction();
    } catch (error) {
      console.error(`Error: ${(error as Error).message}. Retrying in ${retryDelay}ms...`);
      await new Promise(resolve => setTimeout(resolve, retryDelay));
      retries++;
    }
  }

  throw new Error(`Max retries (${maxRetries}) reached. Unable to fetch data.`);
}

async function fetchOIDataWithRetry(exchange : any, modifiedTicker: string, epoch : number) {
  const fetchFunction = () => exchange.fetchOpenInterestHistory(modifiedTicker, '5m', epoch, 1);
  return fetchWithRetry(fetchFunction);
}

async function fetchTickerDataWithRetry(exchange : any, modifiedTicker: string, epoch : number) {
  const fetchFunction = () => exchange.fetchOHLCV(modifiedTicker, '5m', epoch, 1);
  return fetchWithRetry(fetchFunction);
}

async function saveData(prisma : any, tickerSymbol : string, timestamp : number, o : number, h : number, l : number, c : number, oi : number) {
  const dataToSave = [{
    ticker_name: tickerSymbol,
    timestamp,
    o,
    h,
    l,
    c,
    oi,
  }];

  try {
    await prisma.price_oi_data.createMany({
      data: dataToSave,
    });
  } catch (error) {
    console.error('Error saving data:', (error as Error).message);
    try {
      await prisma.price_oi_data.upsert({
        where: {
          stampTicker: {
            timestamp,
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
          timestamp,
          o,
          h,
          l,
          c,
          oi,
        },
      });
    } catch (error) {
      console.error('Error updating data', (error as Error).message);
    }
  }
}

export async function get_fast(prisma : any, exchange: any, tickers: string[], epoch : number) {
  try {
    const results = await Promise.all(
      tickers.map(async (tickerSymbol) => {
        const modifiedTicker = tickerSymbol.slice(0, -4) + '/USDT:USDT';
        const OIDataPromise = fetchOIDataWithRetry(exchange, modifiedTicker, epoch);
        const tickerDataPromise = fetchTickerDataWithRetry(exchange, modifiedTicker, epoch);
        const [OIData, tickerData] = await Promise.all([OIDataPromise, tickerDataPromise]);

        const oi = parseInt(OIData[0].info.sumOpenInterestValue);
        const timestamp = tickerData[0][0];
        const o = tickerData[0][1];
        const h = tickerData[0][2];
        const l = tickerData[0][3];
        const c = tickerData[0][4];

        await saveData(prisma, tickerSymbol, timestamp, o, h, l, c, oi);

        console.log(`Fetched and saved data for ${modifiedTicker}`);
      })
    );
  } catch (error) {
    console.error('Error fetching data:', (error as Error).message);
  }
}

export async function get_latest(prisma:any, exchange: any) {
  while (true) {
    const tickers = await fetchTickers(prisma)

    let epochTime = Math.floor(new Date().getTime() / 1000) * 1000
    // Calculate the time until the next 5th minute plus 1 second
    const seconds_until_next_run = (300 - (new Date().getSeconds() + 60 * new Date().getMinutes()) % 300) + 1;
    console.log(seconds_until_next_run)
    epochTime = epochTime + seconds_until_next_run * 1000 - 301000
    console.log(epochTime)
    await sleep(seconds_until_next_run * 1000);
    await get_fast(prisma, exchange, tickers, epochTime);
    await build_latest(prisma,exchange,tickers)
    
  }

}
