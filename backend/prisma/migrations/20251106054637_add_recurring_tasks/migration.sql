-- AlterTable
ALTER TABLE "Todo" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "isRecurring" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "nextOccurrence" TIMESTAMP(3),
ADD COLUMN     "parentRecurringId" INTEGER,
ADD COLUMN     "recurrenceEndDate" TIMESTAMP(3),
ADD COLUMN     "recurrenceInterval" INTEGER DEFAULT 1,
ADD COLUMN     "recurrencePattern" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3);
