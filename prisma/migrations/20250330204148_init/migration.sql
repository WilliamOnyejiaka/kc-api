/*
  Warnings:

  - The `oAuthDetails` column on the `Member` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Member" ALTER COLUMN "password" DROP NOT NULL,
DROP COLUMN "oAuthDetails",
ADD COLUMN     "oAuthDetails" JSONB;
