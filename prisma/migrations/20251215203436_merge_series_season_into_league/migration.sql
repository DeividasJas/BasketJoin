/*
  Warnings:

  - You are about to drop the column `series_id` on the `Games` table. All the data in the column will be lost.
  - You are about to drop the column `season_id` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `season_id` on the `PaymentSchedule` table. All the data in the column will be lost.
  - You are about to drop the `Season` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Series` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SeriesMembership` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `league_id` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `league_id` to the `PaymentSchedule` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "LeagueStatus" AS ENUM ('UPCOMING', 'ACTIVE', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ScheduleType" AS ENUM ('RECURRING', 'CUSTOM');

-- DropForeignKey
ALTER TABLE "Games" DROP CONSTRAINT "Games_series_id_fkey";

-- DropForeignKey
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_membership_id_fkey";

-- DropForeignKey
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_season_id_fkey";

-- DropForeignKey
ALTER TABLE "PaymentSchedule" DROP CONSTRAINT "PaymentSchedule_membership_id_fkey";

-- DropForeignKey
ALTER TABLE "PaymentSchedule" DROP CONSTRAINT "PaymentSchedule_season_id_fkey";

-- DropForeignKey
ALTER TABLE "Season" DROP CONSTRAINT "Season_series_id_fkey";

-- DropForeignKey
ALTER TABLE "SeriesMembership" DROP CONSTRAINT "SeriesMembership_season_id_fkey";

-- DropForeignKey
ALTER TABLE "SeriesMembership" DROP CONSTRAINT "SeriesMembership_series_id_fkey";

-- DropForeignKey
ALTER TABLE "SeriesMembership" DROP CONSTRAINT "SeriesMembership_user_id_fkey";

-- DropIndex
DROP INDEX "Games_series_id_idx";

-- DropIndex
DROP INDEX "Payment_season_id_idx";

-- DropIndex
DROP INDEX "PaymentSchedule_season_id_idx";

-- AlterTable
ALTER TABLE "Games" DROP COLUMN "series_id",
ADD COLUMN     "league_id" TEXT;

-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "season_id",
ADD COLUMN     "league_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "PaymentSchedule" DROP COLUMN "season_id",
ADD COLUMN     "league_id" TEXT NOT NULL;

-- DropTable
DROP TABLE "Season";

-- DropTable
DROP TABLE "Series";

-- DropTable
DROP TABLE "SeriesMembership";

-- DropEnum
DROP TYPE "SeasonStatus";

-- CreateTable
CREATE TABLE "League" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "location_id" INTEGER NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "status" "LeagueStatus" NOT NULL DEFAULT 'UPCOMING',
    "gym_rental_cost" INTEGER NOT NULL,
    "guest_fee_per_game" INTEGER NOT NULL,
    "payment_due_dates" TEXT NOT NULL,
    "min_players" INTEGER NOT NULL DEFAULT 10,
    "max_players" INTEGER,
    "game_type" TEXT,
    "game_description" TEXT,
    "schedule_type" "ScheduleType" NOT NULL DEFAULT 'CUSTOM',
    "recurring_pattern" TEXT,
    "custom_dates" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modified_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "League_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeagueMembership" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "league_id" TEXT NOT NULL,
    "status" "MembershipStatus" NOT NULL DEFAULT 'ACTIVE',
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pro_rated_amount" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modified_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LeagueMembership_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "League_location_id_idx" ON "League"("location_id");

-- CreateIndex
CREATE INDEX "League_status_idx" ON "League"("status");

-- CreateIndex
CREATE INDEX "League_start_date_idx" ON "League"("start_date");

-- CreateIndex
CREATE INDEX "League_end_date_idx" ON "League"("end_date");

-- CreateIndex
CREATE INDEX "LeagueMembership_user_id_idx" ON "LeagueMembership"("user_id");

-- CreateIndex
CREATE INDEX "LeagueMembership_league_id_idx" ON "LeagueMembership"("league_id");

-- CreateIndex
CREATE INDEX "LeagueMembership_status_idx" ON "LeagueMembership"("status");

-- CreateIndex
CREATE UNIQUE INDEX "LeagueMembership_user_id_league_id_key" ON "LeagueMembership"("user_id", "league_id");

-- CreateIndex
CREATE INDEX "Games_league_id_idx" ON "Games"("league_id");

-- CreateIndex
CREATE INDEX "Payment_league_id_idx" ON "Payment"("league_id");

-- CreateIndex
CREATE INDEX "PaymentSchedule_league_id_idx" ON "PaymentSchedule"("league_id");

-- AddForeignKey
ALTER TABLE "Games" ADD CONSTRAINT "Games_league_id_fkey" FOREIGN KEY ("league_id") REFERENCES "League"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "League" ADD CONSTRAINT "League_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "Locations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeagueMembership" ADD CONSTRAINT "LeagueMembership_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeagueMembership" ADD CONSTRAINT "LeagueMembership_league_id_fkey" FOREIGN KEY ("league_id") REFERENCES "League"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentSchedule" ADD CONSTRAINT "PaymentSchedule_league_id_fkey" FOREIGN KEY ("league_id") REFERENCES "League"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentSchedule" ADD CONSTRAINT "PaymentSchedule_membership_id_fkey" FOREIGN KEY ("membership_id") REFERENCES "LeagueMembership"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_league_id_fkey" FOREIGN KEY ("league_id") REFERENCES "League"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_membership_id_fkey" FOREIGN KEY ("membership_id") REFERENCES "LeagueMembership"("id") ON DELETE SET NULL ON UPDATE CASCADE;
