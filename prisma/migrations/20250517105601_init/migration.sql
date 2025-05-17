-- CreateEnum
CREATE TYPE "CompanyStatus" AS ENUM ('pending', 'active', 'reject', 'denied');

-- CreateEnum
CREATE TYPE "Level" AS ENUM ('MOHHEAD', 'REGION');

-- CreateTable
CREATE TABLE "Company" (
    "id" SERIAL NOT NULL,
    "status" "CompanyStatus" NOT NULL DEFAULT 'pending',
    "organizationName" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "password" TEXT,
    "role" TEXT NOT NULL DEFAULT 'companyAdmin',
    "companyCode" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "level" "Level",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);
