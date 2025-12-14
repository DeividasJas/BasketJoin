-- CreateTable
CREATE TABLE "Series" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Series_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Series_name_idx" ON "Series"("name");

-- AddForeignKey
ALTER TABLE "Games" ADD CONSTRAINT "Games_series_id_fkey" FOREIGN KEY ("series_id") REFERENCES "Series"("id") ON DELETE SET NULL ON UPDATE CASCADE;
