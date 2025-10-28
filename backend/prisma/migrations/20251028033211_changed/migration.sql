/*
  Warnings:

  - The `priority` column on the `Todo` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `completeAt` column on the `Todo` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Todo" DROP COLUMN "priority",
ADD COLUMN     "priority" TEXT NOT NULL DEFAULT 'low',
DROP COLUMN "completeAt",
ADD COLUMN     "completeAt" TEXT NOT NULL DEFAULT 'Today';

-- DropEnum
DROP TYPE "public"."CompleteAt";

-- DropEnum
DROP TYPE "public"."Priority";
