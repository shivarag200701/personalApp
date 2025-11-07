/*
  Warnings:

  - The `completeAt` column on the `Todo` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Todo" DROP COLUMN "completeAt",
ADD COLUMN     "completeAt" TIMESTAMP(3);
