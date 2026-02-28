-- CreateEnum
CREATE TYPE "SeasonStatus" AS ENUM ('UPCOMING', 'ACTIVE', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "MembershipStatus" AS ENUM ('ACTIVE', 'PENDING_PAYMENT', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentScheduleStatus" AS ENUM ('PENDING', 'PAID', 'OVERDUE', 'PARTIALLY_PAID');

-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('MEMBERSHIP_FEE', 'GUEST_FEE', 'REBATE');

-- CreateEnum
CREATE TYPE "RegistrationType" AS ENUM ('MEMBER', 'GUEST');

-- AlterTable
ALTER TABLE "Game_registrations" ADD COLUMN     "guest_fee_paid" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "registration_type" "RegistrationType" NOT NULL DEFAULT 'GUEST';

-- AlterTable
ALTER TABLE "Series" ADD COLUMN     "description" TEXT;

-- CreateTable
CREATE TABLE "Season" (
    "id" TEXT NOT NULL,
    "series_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "gym_rental_cost" INTEGER NOT NULL,
    "guest_fee_per_game" INTEGER NOT NULL,
    "payment_due_dates" TEXT NOT NULL,
    "status" "SeasonStatus" NOT NULL DEFAULT 'UPCOMING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modified_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Season_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SeriesMembership" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "series_id" TEXT NOT NULL,
    "season_id" TEXT NOT NULL,
    "status" "MembershipStatus" NOT NULL DEFAULT 'ACTIVE',
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pro_rated_amount" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modified_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SeriesMembership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentSchedule" (
    "id" TEXT NOT NULL,
    "season_id" TEXT NOT NULL,
    "membership_id" TEXT NOT NULL,
    "due_date" TIMESTAMP(3) NOT NULL,
    "amount_due" INTEGER NOT NULL,
    "amount_paid" INTEGER NOT NULL DEFAULT 0,
    "status" "PaymentScheduleStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modified_at" TIMESTAMP(3) NOT NULL,
    "paid_at" TIMESTAMP(3),

    CONSTRAINT "PaymentSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "season_id" TEXT NOT NULL,
    "membership_id" TEXT,
    "payment_schedule_id" TEXT,
    "payment_type" "PaymentType" NOT NULL,
    "amount" INTEGER NOT NULL,
    "payment_method" TEXT,
    "payment_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Season_series_id_idx" ON "Season"("series_id");

-- CreateIndex
CREATE INDEX "Season_status_idx" ON "Season"("status");

-- CreateIndex
CREATE INDEX "Season_start_date_idx" ON "Season"("start_date");

-- CreateIndex
CREATE INDEX "Season_end_date_idx" ON "Season"("end_date");

-- CreateIndex
CREATE INDEX "SeriesMembership_user_id_idx" ON "SeriesMembership"("user_id");

-- CreateIndex
CREATE INDEX "SeriesMembership_series_id_idx" ON "SeriesMembership"("series_id");

-- CreateIndex
CREATE INDEX "SeriesMembership_season_id_idx" ON "SeriesMembership"("season_id");

-- CreateIndex
CREATE INDEX "SeriesMembership_status_idx" ON "SeriesMembership"("status");

-- CreateIndex
CREATE UNIQUE INDEX "SeriesMembership_user_id_series_id_season_id_key" ON "SeriesMembership"("user_id", "series_id", "season_id");

-- CreateIndex
CREATE INDEX "PaymentSchedule_season_id_idx" ON "PaymentSchedule"("season_id");

-- CreateIndex
CREATE INDEX "PaymentSchedule_membership_id_idx" ON "PaymentSchedule"("membership_id");

-- CreateIndex
CREATE INDEX "PaymentSchedule_due_date_idx" ON "PaymentSchedule"("due_date");

-- CreateIndex
CREATE INDEX "PaymentSchedule_status_idx" ON "PaymentSchedule"("status");

-- CreateIndex
CREATE INDEX "Payment_user_id_idx" ON "Payment"("user_id");

-- CreateIndex
CREATE INDEX "Payment_season_id_idx" ON "Payment"("season_id");

-- CreateIndex
CREATE INDEX "Payment_membership_id_idx" ON "Payment"("membership_id");

-- CreateIndex
CREATE INDEX "Payment_payment_type_idx" ON "Payment"("payment_type");

-- CreateIndex
CREATE INDEX "Payment_payment_date_idx" ON "Payment"("payment_date");

-- AddForeignKey
ALTER TABLE "Season" ADD CONSTRAINT "Season_series_id_fkey" FOREIGN KEY ("series_id") REFERENCES "Series"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeriesMembership" ADD CONSTRAINT "SeriesMembership_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeriesMembership" ADD CONSTRAINT "SeriesMembership_series_id_fkey" FOREIGN KEY ("series_id") REFERENCES "Series"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeriesMembership" ADD CONSTRAINT "SeriesMembership_season_id_fkey" FOREIGN KEY ("season_id") REFERENCES "Season"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentSchedule" ADD CONSTRAINT "PaymentSchedule_season_id_fkey" FOREIGN KEY ("season_id") REFERENCES "Season"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentSchedule" ADD CONSTRAINT "PaymentSchedule_membership_id_fkey" FOREIGN KEY ("membership_id") REFERENCES "SeriesMembership"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_season_id_fkey" FOREIGN KEY ("season_id") REFERENCES "Season"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_membership_id_fkey" FOREIGN KEY ("membership_id") REFERENCES "SeriesMembership"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_payment_schedule_id_fkey" FOREIGN KEY ("payment_schedule_id") REFERENCES "PaymentSchedule"("id") ON DELETE SET NULL ON UPDATE CASCADE;
