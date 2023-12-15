import { Prisma, PrismaClient, price_oi_data } from "@prisma/client";
import * as tests from '../build_latest';

const prisma = new PrismaClient();

// async function main(){
    
//     const ticker = 'IMXUSDT'
//     const latest_data = await tests.getLatestData(prisma, ticker)
//     const latest_stamp = await tests.getLatestTimestamp(prisma, ticker)

//     const monthly_open = tests.calculateOpenTimestamp(latest_stamp + 300000, '1M');
//     const weekly_open = tests.calculateOpenTimestamp(latest_stamp + 300000, '1W');
//     const daily_open = tests.calculateOpenTimestamp(latest_stamp + 300000, '1D');
//     const four_hour_open = tests.calculateOpenTimestamp(latest_stamp + 300000, '4h');
//     const one_hour_open = tests.calculateOpenTimestamp(latest_stamp + 300000, '1h');
//     const fifteen_minute_open = tests.calculateOpenTimestamp(latest_stamp + 300000, '15m');
//     const fifteen_minutes_ago_calc = 1000 * 60 * 15

//     const one_hour_ago_calc = fifteen_minutes_ago_calc * 4
//     const four_hours_ago_calc = one_hour_ago_calc * 4
//     const day_ago_calc = 1000 * 60 * 60 * 24
//     const week_ago_calc = day_ago_calc * 7
//     const month_ago_calc = day_ago_calc * 30
    
//     const fifteen_minutes_ago = latest_stamp - fifteen_minutes_ago_calc
//     const one_hour_ago = latest_stamp - one_hour_ago_calc
//     const four_hours_ago = latest_stamp - four_hours_ago_calc
//     const day_ago = latest_stamp - day_ago_calc
//     const week_ago = latest_stamp - week_ago_calc
//     const month_ago = latest_stamp - month_ago_calc


//     // const rolling_mothly_high = await tests.fetch_calculate_extreme_change(prisma,ticker,latest_stamp,month_ago,latest_data,true) || null
//     const data_old = await tests.get_row(prisma,ticker,day_ago)
//     const data_now = await tests.get_row(prisma,ticker,latest_stamp)
    
//     if (data_now != null && data_now['c'] != null && data_old){
//     const change = tests.calculateChange(data_now['c'],data_old['c'])
//     console.log(change)
//     }

//     const test_case = await tests.getHighestValue(prisma,ticker,day_ago,latest_stamp)
//     const test_case2 = await tests.getLowestValue(prisma,ticker,day_ago,latest_stamp)
//     // const test_case = await tests.fetch_calculate_extreme_change(prisma,ticker,latest_stamp,day_ago,latest_data,true)
//     // const test_case2 = await tests.fetch_calculate_extreme_change(prisma,ticker,latest_stamp,day_ago,latest_data,false)
//     if (test_case && test_case2){
//         console.log(test_case['c'])
//         console.log(test_case2['c'])
//     }

//     console.log(await tests.fetch_calculate_extreme_change(prisma,ticker,day_ago,latest_stamp,latest_data,true))
//     console.log(await tests.fetch_calculate_extreme_change(prisma,ticker,day_ago,latest_stamp,latest_data,false))
// }

// tests.main()