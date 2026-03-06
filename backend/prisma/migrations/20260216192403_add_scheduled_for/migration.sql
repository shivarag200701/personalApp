-- AlterTable
ALTER TABLE "Notifications" ADD COLUMN     "schedulesFor" TIMESTAMP(3),
ALTER COLUMN "status" SET DEFAULT 'SCHEDULED';
