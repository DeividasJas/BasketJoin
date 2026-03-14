-- AlterTable
ALTER TABLE "Users" ADD COLUMN "is_demo" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Games" ADD COLUMN "is_demo" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Game_registrations" ADD COLUMN "is_demo" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Locations" ADD COLUMN "is_demo" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Notification" ADD COLUMN "is_demo" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "League" ADD COLUMN "is_demo" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "LeagueMembership" ADD COLUMN "is_demo" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "PaymentSchedule" ADD COLUMN "is_demo" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN "is_demo" BOOLEAN NOT NULL DEFAULT false;

-- DropIndex
DROP INDEX "Games_game_date_location_id_key";

-- CreateIndex
CREATE UNIQUE INDEX "Games_game_date_location_id_is_demo_key" ON "Games"("game_date", "location_id", "is_demo");
