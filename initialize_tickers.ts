import { promises as fsPromises } from 'fs';


interface TickerData {
  coin: string;
  ticker: string;
  tv: string;
  circ_supply: number;
  tags: string[];
}

export async function initializeTickers(prisma: any): Promise<void> {
  try {
    // Read the master_data.json file
    const masterData = await fsPromises.readFile('master_data.json', 'utf-8');
    const tickerData: Record<string, TickerData> = JSON.parse(masterData);
    try {
      
      await prisma.tickers.deleteMany({
        where: {},
      });
    } catch (error) {
      console.log('probably no tickers')
    }

    // Create or update tickers in the database
    const createTickerPromises = Object.entries(tickerData).map(async ([tickerSymbol, data]) => {
      return prisma.tickers.upsert({
        where: { ticker_name: tickerSymbol },
        create: {
          ticker_name: tickerSymbol,
          circ_supply: data.circ_supply,
          tags: { set: data.tags }
          
        },
        update: {
          circ_supply: data.circ_supply,
          tags: { set: data.tags },
        },
      });
    });

    await Promise.all(createTickerPromises);

    console.log('Ticker list initialized successfully!');
  } catch (error) {
    console.error('Error initializing tickers:', error);
  } 
}


