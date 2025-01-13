/*
  Warnings:

  - Added the required column `abi` to the `Token` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Token" ADD COLUMN     "abi" JSONB NOT NULL;
