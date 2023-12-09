"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
function deleteAllRecords() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Delete all records from the PriceOpenInterestData table
            yield prisma.price_oi_data.deleteMany({
                where: {},
            });
            console.log('All records deleted successfully');
        }
        catch (error) {
            console.error('Error deleting records:', error.message);
        }
        finally {
            yield prisma.$disconnect();
        }
    });
}
// Call the function to delete all records
deleteAllRecords();
