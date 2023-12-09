interface Ticker {
    ticker_name: string;
    circ_supply?: number | null;
    tags: string[];
  }
  
  export async function fetchTickers(prisma:any): Promise<string[]> {
    try {
      const tickers: Ticker[] = await prisma.tickers.findMany();
      const tickerNames: string[] = tickers.map((ticker) => ticker.ticker_name);
      return tickerNames;
    } catch (error) {
      console.error('Error fetching tickers:', error);
      throw error; // Re-throw the error to handle it at a higher level if needed
    }
  }