/*
  Warnings:

  - You are about to drop the column `tipo` on the `Quarto` table. All the data in the column will be lost.
  - Added the required column `categoria` to the `Quarto` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "CategoriaQuarto" AS ENUM ('MASCULINO', 'FEMININO', 'PEDIATRICO', 'ISOLAMENTO', 'UTI_GERAL');

-- DropForeignKey
ALTER TABLE "RegistroClinico" DROP CONSTRAINT "RegistroClinico_consultaId_fkey";

-- AlterTable
ALTER TABLE "Quarto" DROP COLUMN "tipo",
ADD COLUMN     "categoria" "CategoriaQuarto" NOT NULL;

-- AlterTable
ALTER TABLE "RegistroClinico" ADD COLUMN     "internacaoId" TEXT,
ALTER COLUMN "consultaId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "RegistroClinico" ADD CONSTRAINT "RegistroClinico_consultaId_fkey" FOREIGN KEY ("consultaId") REFERENCES "Consultas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegistroClinico" ADD CONSTRAINT "RegistroClinico_internacaoId_fkey" FOREIGN KEY ("internacaoId") REFERENCES "Internacao"("id") ON DELETE SET NULL ON UPDATE CASCADE;
