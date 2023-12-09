import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function deleteAllRecords() {
  try {
    // Delete all records from the PriceOpenInterestData table
    await prisma.price_oi_data.deleteMany({
      where: {},
    });

    console.log('All records deleted successfully');
  } catch (error) {
    console.error('Error deleting records:', (error as Error).message);
  } finally {
    await prisma.$disconnect();
  }
}

// Call the function to delete all records
deleteAllRecords();
