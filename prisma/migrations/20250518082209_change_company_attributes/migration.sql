/*
  Warnings:

  - You are about to drop the column `level` on the `Company` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `Company` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `Company` table. All the data in the column will be lost.
  - You are about to drop the column `username` on the `Company` table. All the data in the column will be lost.
  - Added the required column `email` to the `Company` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Company" DROP COLUMN "level",
DROP COLUMN "password",
DROP COLUMN "role",
DROP COLUMN "username",
ADD COLUMN     "email" TEXT NOT NULL;

-- DropEnum
DROP TYPE "Level";
