import { PrismaClient, price_oi_data } from "@prisma/client";


async function get_row(
  prisma: PrismaClient,
  tickerName: string,
  timestamp: number
): Promise<price_oi_data | null> {


  try {

    const row = await prisma.price_oi_data.findFirst({
      where: {
        timestamp: timestamp,
        ticker_name: tickerName,
      },
    });

    return row;
  } catch (error) {
    console.error('Error getting indexes for change calculation:', error);
    throw error;
  }
}

async function getLowestValue(
  prisma: PrismaClient,
  tickerName: string,
  startTimestamp: number,
  endTimestamp: number
): Promise<price_oi_data | null> {
  try {
    const lowestValueRow = await prisma.price_oi_data.findFirst({
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
  } catch (error) {
    console.error('Error getting lowest value:', error);
    throw error;
  }
}

async function getHighestValue(
  prisma: PrismaClient,
  tickerName: string,
  startTimestamp: number,
  endTimestamp: number
): Promise<price_oi_data | null> {
  try {
    const highestValueRow = await prisma.price_oi_data.findFirst({
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
  } catch (error) {
    console.error('Error getting highest value:', error);
    throw error;
  }
}
export async function fetch_calculate_extreme_change(
  prisma: PrismaClient,
  ticker: string,
  startTimestamp: number,
  endTimestamp: number,
  latestData: any,
  isHighest: boolean
): Promise<number | null> {
  try {
    const extremeValueRow = isHighest
      ? await getHighestValue(prisma, ticker, startTimestamp, endTimestamp)
      : await getLowestValue(prisma, ticker, startTimestamp, endTimestamp);

    if (!extremeValueRow) {
      console.log(`Data is null for ticker ${ticker} between ${startTimestamp} and ${endTimestamp}`);
      return null;
    }

    const change = calculateChange(latestData['c'], extremeValueRow['c']);
    return change;
  } catch (error) {
    console.error('Error fetching and calculating extreme change:', error);
    throw error;
  }
}
export function calculateOpenTimestamp(currentTimestamp: number, timeframe: string): number {
  const currentUTCDayStart = new Date(
    Date.UTC(
      new Date(currentTimestamp).getUTCFullYear(),
      new Date(currentTimestamp).getUTCMonth(),
      new Date(currentTimestamp).getUTCDate(),
      0, 0, 0, 0
    )
  );
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
export async function getLatestTimestamp(prisma: PrismaClient, tickerName: string): Promise<number> {
  try {
    const latestData = await prisma.price_oi_data.findFirst({
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

    return Number(latestData?.timestamp);
  } catch (error) {
    console.error('Error getting latest timestamp:', (error as Error).message);
    throw error;
  }
}
export async function getLatestData(prisma: PrismaClient, tickerName: string): Promise<price_oi_data | null> {
  try {
    const latestData = await prisma.price_oi_data.findFirst({
      where: {
        ticker_name: tickerName,
      },
      orderBy: {
        timestamp: 'desc',
      }
    });

    return latestData;
  } catch (error) {
    console.error('Error getting latest data:', (error as Error).message);
    throw error;
  }
}
export const getTickerSupply = async (prisma: any, tickerName: string) => {
  try {
    const ticker = await prisma.tickers.findUnique({
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
  } catch (error) {
    console.error(`Error fetching supply for ${tickerName}:`, error);
    throw error;
  }
};
function calculateChange(recent_val: number, old_val: number): any {

  //maybe not multiple with 100 and keep percent, lets see
  return Math.round(((recent_val - old_val) / old_val) * 10000) / 100;


}
export async function fetch_calculate_change(prisma: any, ticker: string, latestData: any, latestOi: number, timestamp: number) {



  const helper = await get_row(prisma, ticker, timestamp);
  // console.log(timestamp)
  // console.log(openHelper)
  if (helper === null) {

    console.log(`Data is null for timestamp ${timestamp} and ${ticker}`);
    return null;
  }
  const oiData = helper['oi'];
  const oiChange = oiData !== null ? calculateChange(latestOi, oiData) : null;
  const priceChange = calculateChange(latestData['c'], helper['c']);

  return { priceChange, oiChange };


}
export async function fetchCurrentOI(exchange: any, ticker: string, epoch: any) {
  const modifierTicker = ticker.slice(0, -4) + '/USDT:USDT';
  const oiData = await exchange.fetchOpenInterestHistory(modifierTicker, '5m', epoch);
  // console.log(oiData)
  return parseInt(oiData[oiData.length - 1].info.sumOpenInterestValue);

}
