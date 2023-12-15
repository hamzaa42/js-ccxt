import { PrismaClient } from "@prisma/client";
import ccxt from 'ccxt';
import { fetchTickers } from "./fetch_tickers";
import { getLatestData, getLatestTimestamp, fetchCurrentOI, getTickerSupply, calculateOpenTimestamp, fetch_calculate_change, fetch_calculate_extreme_change } from "./build_latest_ops";

export async function build_latest(prisma: any, exchange: any, tickers: string[]) {



  try {
    // Delete all records from the PriceOpenInterestData table
    await prisma.latest_insights.deleteMany({
      where: {},
    });

    console.log('All records deleted successfully');
  } catch (error) {
    console.error('Error deleting records:', (error as Error).message);
  }

  await Promise.all(tickers.map(async ticker => {




    const latest_data = await getLatestData(prisma, ticker)
    const latest_stamp = await getLatestTimestamp(prisma, ticker)
    const latest_oi = await fetchCurrentOI(exchange, ticker, latest_stamp)

    if (latest_data != null && latest_stamp != null && latest_oi != null) {
      const circ = await getTickerSupply(prisma, ticker)
      let mcap = circ * latest_data['c']
      if (ticker.slice(0, 4) === '1000') {
        // If true, divide mcap by 1000
        mcap = mcap / 1000;
      }
      const oi_over_mcap_percentage = Math.round((latest_oi / mcap) * 10000) / 100

      try {

        const monthly_open = calculateOpenTimestamp(latest_stamp + 300000, '1M');
        const weekly_open = calculateOpenTimestamp(latest_stamp + 300000, '1W');
        const daily_open = calculateOpenTimestamp(latest_stamp + 300000, '1D');
        const four_hour_open = calculateOpenTimestamp(latest_stamp + 300000, '4h');
        const one_hour_open = calculateOpenTimestamp(latest_stamp + 300000, '1h');
        const fifteen_minute_open = calculateOpenTimestamp(latest_stamp + 300000, '15m');

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

        const fifteenMinutes_rolling_data = await fetch_calculate_change(prisma, ticker, latest_data, latest_oi, fifteen_minutes_ago) || { priceChange: null, oiChange: null };
        const oneHour_rolling_data = await fetch_calculate_change(prisma, ticker, latest_data, latest_oi, one_hour_ago) || { priceChange: null, oiChange: null };
        const fourHours_rolling_data = await fetch_calculate_change(prisma, ticker, latest_data, latest_oi, four_hours_ago) || { priceChange: null, oiChange: null };
        const day_rolling_data = await fetch_calculate_change(prisma, ticker, latest_data, latest_oi, day_ago) || { priceChange: null, oiChange: null };
        const week_rolling_data = await fetch_calculate_change(prisma, ticker, latest_data, latest_oi, week_ago) || { priceChange: null, oiChange: null };
        const month_rolling_data = await fetch_calculate_change(prisma, ticker, latest_data, latest_oi, month_ago) || { priceChange: null, oiChange: null };


        const monthly_data = await fetch_calculate_change(prisma, ticker, latest_data, latest_oi, monthly_open - 300000) || { priceChange: null, oiChange: null };
        const weekly_data = await fetch_calculate_change(prisma, ticker, latest_data, latest_oi, weekly_open - 300000) || { priceChange: null, oiChange: null };
        const daily_data = await fetch_calculate_change(prisma, ticker, latest_data, latest_oi, daily_open - 300000) || { priceChange: null, oiChange: null };
        const fourHour_data = await fetch_calculate_change(prisma, ticker, latest_data, latest_oi, four_hour_open - 300000) || { priceChange: null, oiChange: null };
        const oneHour_data = await fetch_calculate_change(prisma, ticker, latest_data, latest_oi, one_hour_open - 300000) || { priceChange: null, oiChange: null };
        const fifteenMinute_data = await fetch_calculate_change(prisma, ticker, latest_data, latest_oi, fifteen_minute_open - 300000) || { priceChange: null, oiChange: null };

        const rolling_mothly_high = await fetch_calculate_extreme_change(prisma, ticker, month_ago, latest_stamp, latest_data, true) || null
        const rolling_weekly_high = await fetch_calculate_extreme_change(prisma, ticker, week_ago, latest_stamp, latest_data, true) || null
        const rolling_daily_high = await fetch_calculate_extreme_change(prisma, ticker, day_ago, latest_stamp, latest_data, true)


        const rolling_mothly_low = await fetch_calculate_extreme_change(prisma, ticker, month_ago, latest_stamp, latest_data, false) || null
        const rolling_weekly_low = await fetch_calculate_extreme_change(prisma, ticker, week_ago, latest_stamp, latest_data, false) || null
        const rolling_daily_low = await fetch_calculate_extreme_change(prisma, ticker, day_ago, latest_stamp, latest_data, false)

        const open_mothly_high = await fetch_calculate_extreme_change(prisma, ticker, monthly_open, latest_stamp, latest_data, true) || null
        const open_weekly_high = await fetch_calculate_extreme_change(prisma, ticker, weekly_open, latest_stamp, latest_data, true) || null
        const open_daily_high = await fetch_calculate_extreme_change(prisma, ticker, daily_open, latest_stamp, latest_data, true)

        const open_mothly_low = await fetch_calculate_extreme_change(prisma, ticker, monthly_open, latest_stamp, latest_data, false) || null
        const open_weekly_low = await fetch_calculate_extreme_change(prisma, ticker, weekly_open, latest_stamp, latest_data, false) || null
        const open_daily_low = await fetch_calculate_extreme_change(prisma, ticker, daily_open, latest_stamp, latest_data, false)



        const prismaCreateCommand = await prisma.latest_insights.create({
          data: {
            ticker_name: ticker,
            timestamp: (latest_stamp + 3000),
            mcap: mcap,
            oi_mcap: oi_over_mcap_percentage,
            o: latest_data['c'],
            oi: latest_oi,

            // Rolling price and open interest data
            r_p_15m: fifteenMinutes_rolling_data.priceChange,
            r_p_1h: oneHour_rolling_data.priceChange,
            r_p_4h: fourHours_rolling_data.priceChange,
            r_p_1W: week_rolling_data.priceChange,
            r_p_1D: day_rolling_data.priceChange || null,
            r_p_1M: month_rolling_data.priceChange || null,

            r_oi_15m: fifteenMinutes_rolling_data.oiChange,
            r_oi_1h: oneHour_rolling_data.oiChange,
            r_oi_4h: fourHours_rolling_data.oiChange,
            r_oi_1D: day_rolling_data.oiChange,
            r_oi_1W: week_rolling_data.oiChange || null,
            r_oi_1M: month_rolling_data.oiChange || null,

            r_MH: rolling_mothly_high || null,
            r_WH: rolling_weekly_high || null,
            r_DH: rolling_daily_high,

            r_ML: rolling_mothly_low || null,
            r_WL: rolling_weekly_low || null,
            r_DL: rolling_daily_low,

            // Opening price and open interest data
            o_p_15m: fifteenMinute_data.priceChange,
            o_p_1h: oneHour_data.priceChange,
            o_p_4h: fourHour_data.priceChange,
            o_p_1D: daily_data.priceChange,
            o_p_1W: weekly_data.priceChange,
            o_p_1M: monthly_data.priceChange,

            o_oi_15m: fifteenMinute_data.oiChange,
            o_oi_1h: oneHour_data.oiChange,
            o_oi_4h: fourHour_data.oiChange,
            o_oi_1D: daily_data.oiChange,
            o_oi_1W: weekly_data.oiChange || null,
            o_oi_1M: monthly_data.oiChange || null,

            o_MH: open_mothly_high || null,
            o_WH: open_weekly_high || null,
            o_DH: open_daily_high,

            o_ML: open_mothly_low || null,
            o_WL: open_weekly_low || null,
            o_DL: open_daily_low,
          }
        });
      } catch (error) {
        console.error('Error in main function:', error);
      }
    }
    else {
      console.log('shrekt')
    }
  }));
}

// async function main() {
//   const prisma = new PrismaClient();
//   const binance = new ccxt.pro.binance();
//   const startTime = Date.now(); // Record start time

//   // try {
//   //   // Delete all records from the PriceOpenInterestData table
//   //   await prisma.latest_insights.deleteMany({
//   //     where: {},
//   //   });

//   //   console.log('All records deleted successfully');
//   // } catch (error) {
//   //   console.error('Error deleting records:', (error as Error).message);
//   // }

//   try {
//     const tickers = await fetchTickers(prisma);



//   } catch (error) {
//     console.error('Error in main function:', error);
//   } finally {
//     const endTime = Date.now(); // Record end time
//     const timeDifference = endTime - startTime;
//     console.log(`Total time taken: ${timeDifference} ms`);

//     await prisma.$disconnect();
//     await binance.close();
//   }
// }

