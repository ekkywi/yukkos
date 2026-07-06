-- Add multi-image support for listings
ALTER TABLE "listings"
ADD COLUMN "images" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
