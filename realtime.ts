// websocketUpdater.ts
import { fetchTickers } from './fetch_tickers';

async function get_fast(prisma:any, exchange: any, tickers: string[], epoch: any) {

  try {
    const results = await Promise.all(
      tickers.map(async (tickerSymbol) => {
        const modifiedTicker = tickerSymbol.slice(0, -4) + '/USDT:USDT';
        const OIDataPromise = exchange.fetchOpenInterestHistory(modifiedTicker, '5m', epoch, 1);
        const tickerDataPromise = exchange.fetchOHLCV(modifiedTicker, '5m', epoch, 1);
        const [OIData, tickerData] = await Promise.all([OIDataPromise, tickerDataPromise]);

        const dataToSave = []
        const oi = parseInt(OIData[0].info.sumOpenInterestValue)
        const timestamp = tickerData[0][0]
        const o = tickerData[0][1]
        const h = tickerData[0][2]
        const l = tickerData[0][3]
        const c = tickerData[0][4]

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

          await prisma.price_oi_data.createMany({
            data: dataToSave,
          });
        } catch (error) {
          console.error('Error fetching data:', (error as Error).message);

        }
        // Save data for the current ticker

        console.log(`Fetched and saved data for ${modifiedTicker}`);

      })
    );
  }
  catch (error) {
    console.error('Error fetching data:', (error as Error).message);
  }
}
async function make_latest(){

}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
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
  }

}
