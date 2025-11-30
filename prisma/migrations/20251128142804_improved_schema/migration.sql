/*
  Warnings:

  - You are about to drop the column `email` on the `Game_registrations` table. All the data in the column will be lost.
  - You are about to drop the column `family_name` on the `Game_registrations` table. All the data in the column will be lost.
  - You are about to drop the column `given_name` on the `Game_registrations` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `Locations` table. All the data in the column will be lost.
  - You are about to drop the `Post` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[game_date,location_id]` on the table `Games` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('PLAYER', 'ADMIN', 'ORGANIZER');

-- CreateEnum
CREATE TYPE "GameStatus" AS ENUM ('SCHEDULED', 'CANCELLED', 'COMPLETED', 'IN_PROGRESS');

-- CreateEnum
CREATE TYPE "RegistrationStatus" AS ENUM ('CONFIRMED', 'CANCELLED', 'WAITLIST');

-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "Post_user_id_fkey";

-- DropIndex
DROP INDEX "Games_game_date_key";

-- AlterTable
ALTER TABLE "Game_registrations" DROP COLUMN "email",
DROP COLUMN "family_name",
DROP COLUMN "given_name",
ADD COLUMN     "status" "RegistrationStatus" NOT NULL DEFAULT 'CONFIRMED',
ALTER COLUMN "modified_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Games" ADD COLUMN     "description" TEXT,
ADD COLUMN     "game_type" TEXT,
ADD COLUMN     "max_players" INTEGER,
ADD COLUMN     "min_players" INTEGER NOT NULL DEFAULT 10,
ADD COLUMN     "organizer_id" TEXT,
ADD COLUMN     "status" "GameStatus" NOT NULL DEFAULT 'SCHEDULED';

-- AlterTable
ALTER TABLE "Locations" DROP COLUMN "price",
ADD COLUMN     "capacity" INTEGER,
ADD COLUMN     "court_count" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "image_url" TEXT,
ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "price_per_game" INTEGER,
ALTER COLUMN "modified_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Users" ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'PLAYER',
ALTER COLUMN "email" DROP DEFAULT,
ALTER COLUMN "modified_at" DROP DEFAULT;

-- DropTable
DROP TABLE "Post";

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "game_id" INTEGER,
    "type" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Games_game_date_location_id_key" ON "Games"("game_date", "location_id");

-- AddForeignKey
ALTER TABLE "Games" ADD CONSTRAINT "Games_organizer_id_fkey" FOREIGN KEY ("organizer_id") REFERENCES "Users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "Games"("id") ON DELETE SET NULL ON UPDATE CASCADE;
