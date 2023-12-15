// fetchDataForTickers.ts

import { fetchTickers } from './fetch_tickers';

async function fetchUpdate(prisma:any, start: number, exchange: any, tickers: string[], step: number) {
  console.log(`Start: ${start}`);

  try {
    // Map tickers to an array of promises for fetching and saving data
    const promises = tickers.map(async (tickerSymbol) => {
      const modifiedTicker = tickerSymbol.slice(0, -4) + '/USDT:USDT';

      try {
        const [tickerData, OIData] = await Promise.all([
          exchange.fetchOHLCV(modifiedTicker, '5m', start, step),
          exchange.fetchOpenInterestHistory(modifiedTicker, '5m', start, step).catch((oiError:Error) => {
            console.error('OI Fuckery');
            return [];
          }),
        ]);

        const dataToSave = [];

        for (let i = 0; i < tickerData.length; i++) {
          const ticker_name: string = tickerSymbol;
          const timestamp: number = Number(tickerData[i][0] || NaN);

          const price_data = tickerData[i];
          const o: number = parseFloat(price_data[1]); // Open
          const h: number = parseFloat(price_data[2]); // High
          const l: number = parseFloat(price_data[3]); // Low
          const c: number = parseFloat(price_data[4]); // Close
          

          const oiInfo = OIData[i]?.info;
          const oi: number | null = oiInfo ? parseInt(oiInfo.sumOpenInterestValue) : null;

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
        await prisma.price_oi_data.createMany({
          data: dataToSave,
        });

        console.log(`Fetched and saved data for ${modifiedTicker}`);
      } catch (error) {
        console.error(`Error fetching or saving data for ${modifiedTicker}:`, (error as Error).message);
      }
    });

    // Wait for all promises to complete
    await Promise.all(promises);

    console.log('Data fetching and saving completed!');
  } catch (error) {
    console.error('Error fetching data:', (error as Error).message);
  }
}

function getCurrentUtcMidnightTimestamp() {
  const now = new Date();
  const utcMidnight = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  );

  return utcMidnight.getTime();
}


export async function startSync(prisma:any, exchange:any) {
  // Read the master_data.json file
  const tickers = await fetchTickers(prisma)
  const step = 288

  const currentUtcMidnightTimestamp = getCurrentUtcMidnightTimestamp();
  const increment = 5 * 60 * step * 1000; // 5 minutes * step in milliseconds
  const fiveMinutes = 5 * 60 * 1000; // 5 minutes in milliseconds 
  const singleDay = fiveMinutes*288

  // let timestamp = currentUtcMidnightTimestamp - singleDay*4 
  //set start point here
  let timestamp = currentUtcMidnightTimestamp - singleDay*32
  while (Date.now() - timestamp > 0) {
    await fetchUpdate(prisma, timestamp, exchange, tickers, step);

    timestamp = timestamp + increment

  }
  
}

