import { Prisma, PrismaClient, price_oi_data } from "@prisma/client";

async function getIndexesForChangeCalculation(
  prisma: PrismaClient,
  tickerName: string,
  minutes: number
): Promise<Array<price_oi_data | null >> {
  try {
    // Fetch the most recent timestamp
    const mostRecentTimestamp = await prisma.price_oi_data.findFirst({
      where: {
        ticker_name: tickerName,
      },
      orderBy: {
        timestamp: 'desc',
      },
    });

    if (!mostRecentTimestamp) {
      console.log(`No data found for ticker ${tickerName}`);
      return [null];
    }

    // Calculate the timestamp exactly 'minutes' ago
    const timestampAgo = mostRecentTimestamp.timestamp - BigInt(minutes * 60 * 1000);

    // Fetch data from the database for the specified ticker and timestamp
    const price_oi_data = await prisma.price_oi_data.findFirst({
      where: {
        timestamp: timestampAgo,
        ticker_name: tickerName,
      },
    });

    return [mostRecentTimestamp,price_oi_data];
  } catch (error) {
    console.error('Error getting indexes for change calculation:', error);
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
  
async function main() {
  const prisma = new PrismaClient();
  try {
    const data = await getIndexesForChangeCalculation(prisma, '1000BONKUSDT', 15);
    console.log(data);

    const highest = await getHighestValue(prisma,'BTCUSDT',BigInt(1701475200000),BigInt(1702140130000))
    console.log(highest)

  } catch (error) {
    console.error('Error in main function:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
