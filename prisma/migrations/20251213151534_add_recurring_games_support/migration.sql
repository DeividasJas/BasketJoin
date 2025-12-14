-- AlterTable
ALTER TABLE "Games" ADD COLUMN     "series_id" TEXT;

-- CreateIndex
CREATE INDEX "Games_series_id_idx" ON "Games"("series_id");
