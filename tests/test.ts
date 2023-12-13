import { Prisma, PrismaClient, price_oi_data } from "@prisma/client";
import ccxt from 'ccxt';
import { timeStamp } from "console";
import { fetchTickers } from "../fetch_tickers";

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

// to test
async function get_row_ago(
  prisma: PrismaClient,
  tickerName: string,
  mostRecentTimestamp: number,
  ms: number
): Promise<price_oi_data | null> {
  try {
    const oldstamp = mostRecentTimestamp - ms
    // console.log(oldstamp)
    const price_oi_data = await prisma.price_oi_data.findFirst({
      where: {
        timestamp: oldstamp,
        ticker_name: tickerName,
      },
    });

    return price_oi_data;
  } catch (error) {
    console.error('Error getting indexes for change calculation:', error);
    throw error;
  }
}

async function getLowestValue(
  prisma: PrismaClient,
  tickerName: string,
  startTimestamp: bigint,
  endTimestamp: bigint
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
  startTimestamp: bigint,
  endTimestamp: bigint
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


function calculateOpenTimestamp(currentTimestamp: number, timeframe: string): number {
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


async function getLatestTimestamp(prisma: PrismaClient, tickerName: string): Promise<number> {
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


async function getLatestData(prisma: PrismaClient, tickerName: string): Promise<price_oi_data | null> {
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


//todo
async function getTickersMcap(prisma: PrismaClient) {

}


function calculateChange(recent_val: number, old_val: number): any {

  //maybe not multiple with 100 and keep percent, lets see
  return Math.round(((recent_val - old_val) / old_val) * 10000) / 100


}

async function fetchDataAndCalculateChanges(prisma: any, ticker: string, latestData: any, latestOi: number, timestamp: number, delay: boolean) {

  if (delay == false) {

    const openHelper = await get_row(prisma, ticker, timestamp);
    // console.log(timestamp)
    // console.log(openHelper)
    if (openHelper === null) {

      console.log(`Data is null for timestamp ${timestamp}`);
      return null;
    }
    const oiData = openHelper['oi'];
    const oiChange = oiData !== null ? calculateChange(latestOi, oiData,) : null;
    const priceChange = calculateChange(latestData['c'], openHelper['c']);

    return { priceChange, oiChange };

  } else {

    const delayHelper = await get_row(prisma, ticker, timestamp)
    if (delayHelper === null) {

      console.log(`Data is null for timestamp ${timestamp}`);
      return null;
    }
    const oiData = delayHelper['oi'];
    const oiChange = oiData !== null ? calculateChange(latestOi, oiData,) : null;
    const priceChange = calculateChange(latestData['c'], delayHelper['c']);

    return { priceChange, oiChange };
  }
}


async function fetchCurrentOI(exchange: any, ticker: string, epoch: any) {
  const modifierTicker = ticker.slice(0, -4) + '/USDT:USDT'
  const oiData = await exchange.fetchOpenInterestHistory(modifierTicker, '5m', epoch)
  // console.log(oiData)
  return parseInt(oiData[oiData.length - 1].info.sumOpenInterestValue)

}


export async function build_latest(prisma: any, exchange: any, ticker: string) {
  const latest_data = await getLatestData(prisma, ticker)
  const latest_stamp = await getLatestTimestamp(prisma, ticker)
  const latest_oi = await fetchCurrentOI(exchange, ticker, latest_stamp)

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



    const monthlyData = await fetchDataAndCalculateChanges(prisma, ticker, latest_data, latest_oi, monthly_open - 300000, false) || { priceChange: null, oiChange: null };
    console.log('Monthly Open Price Change:', monthlyData.priceChange !== null ? monthlyData.priceChange : 'Data is null');
    console.log('Monthly Open OI Change:', monthlyData.oiChange !== null ? monthlyData.oiChange : 'Data is null');

    const weeklyData = await fetchDataAndCalculateChanges(prisma, ticker, latest_data, latest_oi, weekly_open - 300000, false) || { priceChange: null, oiChange: null };
    console.log('Weekly Open Price Change:', weeklyData.priceChange !== null ? weeklyData.priceChange : 'Data is null');
    console.log('Weekly Open OI Change:', weeklyData.oiChange !== null ? weeklyData.oiChange : 'Data is null');

    const dailyData = await fetchDataAndCalculateChanges(prisma, ticker, latest_data, latest_oi, daily_open - 300000, false) || { priceChange: null, oiChange: null };
    console.log('Daily Open Price Change:', dailyData.priceChange !== null ? dailyData.priceChange : 'Data is null');
    console.log('Daily Open OI Change:', dailyData.oiChange !== null ? dailyData.oiChange : 'Data is null');

    const fourHourData = await fetchDataAndCalculateChanges(prisma, ticker, latest_data, latest_oi, four_hour_open - 300000, false) || { priceChange: null, oiChange: null };
    console.log('Four-Hour Open Price Change:', fourHourData.priceChange !== null ? fourHourData.priceChange : 'Data is null');
    console.log('Four-Hour Open OI Change:', fourHourData.oiChange !== null ? fourHourData.oiChange : 'Data is null');

    const oneHourData = await fetchDataAndCalculateChanges(prisma, ticker, latest_data, latest_oi, one_hour_open - 300000, false) || { priceChange: null, oiChange: null };
    console.log('One-Hour Open Price Change:', oneHourData.priceChange !== null ? oneHourData.priceChange : 'Data is null');
    console.log('One-Hour Open OI Change:', oneHourData.oiChange !== null ? oneHourData.oiChange : 'Data is null');

    const fifteenMinuteData = await fetchDataAndCalculateChanges(prisma, ticker, latest_data, latest_oi, fifteen_minute_open - 300000, false) || { priceChange: null, oiChange: null };
    console.log('Fifteen-Minute Open Price Change:', fifteenMinuteData.priceChange !== null ? fifteenMinuteData.priceChange : 'Data is null');
    console.log('Fifteen-Minute Open OI Change:', fifteenMinuteData.oiChange !== null ? fifteenMinuteData.oiChange : 'Data is null');

    const fifteen_minutes_ago_calc = 1000 * 60 * 15

    const one_hour_ago_calc = fifteen_minutes_ago_calc * 4
    const four_hours_ago_calc = one_hour_ago_calc * 4
    const day_ago_calc = 1000 * 60 * 60 * 24
    const week_ago_calc = day_ago_calc * 7
    const month_ago_calc = day_ago_calc * 30

    const fifteen_minutes_ago = latest_stamp - fifteen_minutes_ago_calc
    const one_hour_ago = latest_stamp - one_hour_ago_calc
    const four_hours_ago = latest_stamp - four_hours_ago_calc
    const day_ago = latest_stamp - day_ago_calc
    const week_ago = latest_stamp - week_ago_calc
    const month_ago = latest_stamp - month_ago_calc

    const fifteenMinutesAgoData = await fetchDataAndCalculateChanges(prisma, ticker, latest_data, latest_oi, fifteen_minutes_ago, true) || { priceChange: null, oiChange: null };
    const oneHourAgoData = await fetchDataAndCalculateChanges(prisma, ticker, latest_data, latest_oi, one_hour_ago, true) || { priceChange: null, oiChange: null };
    const fourHoursAgoData = await fetchDataAndCalculateChanges(prisma, ticker, latest_data, latest_oi, four_hours_ago, true) || { priceChange: null, oiChange: null };
    const dayAgoData = await fetchDataAndCalculateChanges(prisma, ticker, latest_data, latest_oi, day_ago, true) || { priceChange: null, oiChange: null };
    const weekAgoData = await fetchDataAndCalculateChanges(prisma, ticker, latest_data, latest_oi, week_ago, true) || { priceChange: null, oiChange: null };
    const monthAgoData = await fetchDataAndCalculateChanges(prisma, ticker, latest_data, latest_oi, month_ago, true) || { priceChange: null, oiChange: null };

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





  } catch (error) {
    console.error('Error in main function:', error);
  }


}


async function main() {
  const prisma = new PrismaClient();
  const binance = new ccxt.pro.binance();
  const startTime = Date.now(); // Record start time

  try {
    const tickers = await fetchTickers(prisma);

    await Promise.all(tickers.map(async ticker => {
      await build_latest(prisma, binance, ticker);
    }));

  } catch (error) {
    console.error('Error in main function:', error);
  } finally {
    const endTime = Date.now(); // Record end time
    const timeDifference = endTime - startTime;
    console.log(`Total time taken: ${timeDifference} ms`);

    await prisma.$disconnect();
    await binance.close();
  }
}

main();
