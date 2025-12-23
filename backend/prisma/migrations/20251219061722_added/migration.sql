/*
  Warnings:

  - You are about to drop the column `completeAt` on the `Todo` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Todo" DROP COLUMN "completeAt",
ADD COLUMN     "dueAt" TIME,
ADD COLUMN     "dueOn" DATE,
ADD COLUMN     "isAllDay" BOOLEAN NOT NULL DEFAULT false;
