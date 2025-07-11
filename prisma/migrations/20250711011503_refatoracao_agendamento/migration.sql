/*
  Warnings:

  - You are about to drop the column `janelaDeAtendimentoId` on the `Consultas` table. All the data in the column will be lost.
  - You are about to drop the `BloqueioHorario` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `HorarioPadrao` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `JanelaDeAtendimento` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[profissionalId,dataHoraInicio]` on the table `Consultas` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `dataHoraFim` to the `Consultas` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dataHoraInicio` to the `Consultas` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "BloqueioHorario" DROP CONSTRAINT "BloqueioHorario_profissionalId_fkey";

-- DropForeignKey
ALTER TABLE "Consultas" DROP CONSTRAINT "Consultas_janelaDeAtendimentoId_fkey";

-- DropForeignKey
ALTER TABLE "HorarioPadrao" DROP CONSTRAINT "HorarioPadrao_profissionalId_fkey";

-- DropForeignKey
ALTER TABLE "JanelaDeAtendimento" DROP CONSTRAINT "JanelaDeAtendimento_profissionalId_fkey";

-- DropIndex
DROP INDEX "Consultas_janelaDeAtendimentoId_key";

-- AlterTable
ALTER TABLE "Consultas" DROP COLUMN "janelaDeAtendimentoId",
ADD COLUMN     "dataHoraFim" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "dataHoraInicio" TIMESTAMP(3) NOT NULL;

-- DropTable
DROP TABLE "BloqueioHorario";

-- DropTable
DROP TABLE "HorarioPadrao";

-- DropTable
DROP TABLE "JanelaDeAtendimento";

-- CreateTable
CREATE TABLE "GradeHoraria" (
    "id" TEXT NOT NULL,
    "diaDaSemana" INTEGER NOT NULL,
    "horaInicio" TEXT NOT NULL,
    "horaFim" TEXT NOT NULL,
    "duracaoConsultaMinutos" INTEGER NOT NULL DEFAULT 30,
    "profissionalId" TEXT NOT NULL,

    CONSTRAINT "GradeHoraria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Indisponibilidade" (
    "id" TEXT NOT NULL,
    "inicio" TIMESTAMP(3) NOT NULL,
    "fim" TIMESTAMP(3) NOT NULL,
    "motivo" TEXT,
    "profissionalId" TEXT NOT NULL,

    CONSTRAINT "Indisponibilidade_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Consultas_profissionalId_dataHoraInicio_key" ON "Consultas"("profissionalId", "dataHoraInicio");

-- AddForeignKey
ALTER TABLE "GradeHoraria" ADD CONSTRAINT "GradeHoraria_profissionalId_fkey" FOREIGN KEY ("profissionalId") REFERENCES "Profissional"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Indisponibilidade" ADD CONSTRAINT "Indisponibilidade_profissionalId_fkey" FOREIGN KEY ("profissionalId") REFERENCES "Profissional"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
