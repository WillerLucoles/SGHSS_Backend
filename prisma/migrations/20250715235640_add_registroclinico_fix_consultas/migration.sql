/*
  Warnings:

  - You are about to drop the `DocumentoAnexado` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `EntradaProntuario` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Prontuario` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "DocumentoAnexado" DROP CONSTRAINT "DocumentoAnexado_entradaProntuarioId_fkey";

-- DropForeignKey
ALTER TABLE "EntradaProntuario" DROP CONSTRAINT "EntradaProntuario_consultaId_fkey";

-- DropForeignKey
ALTER TABLE "EntradaProntuario" DROP CONSTRAINT "EntradaProntuario_internacaoId_fkey";

-- DropForeignKey
ALTER TABLE "EntradaProntuario" DROP CONSTRAINT "EntradaProntuario_profissionalId_fkey";

-- DropForeignKey
ALTER TABLE "EntradaProntuario" DROP CONSTRAINT "EntradaProntuario_prontuarioId_fkey";

-- DropForeignKey
ALTER TABLE "Prontuario" DROP CONSTRAINT "Prontuario_pacienteId_fkey";

-- AlterTable
ALTER TABLE "Paciente" ADD COLUMN     "alergias" TEXT[],
ADD COLUMN     "antecedentesPessoais" TEXT,
ADD COLUMN     "medicacoesUsoContinuo" TEXT[];

-- DropTable
DROP TABLE "DocumentoAnexado";

-- DropTable
DROP TABLE "EntradaProntuario";

-- DropTable
DROP TABLE "Prontuario";

-- DropEnum
DROP TYPE "StatusJanelaAtendimento";

-- DropEnum
DROP TYPE "TipoDocumento";

-- CreateTable
CREATE TABLE "RegistroClinico" (
    "id" TEXT NOT NULL,
    "consultaId" TEXT NOT NULL,
    "profissionalId" TEXT NOT NULL,
    "queixa" TEXT NOT NULL,
    "exameFisico" TEXT,
    "hipotesesDiagnosticas" TEXT,
    "conduta" TEXT,
    "observacoesAdicionais" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RegistroClinico_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnexoClinico" (
    "id" TEXT NOT NULL,
    "nomeArquivo" TEXT NOT NULL,
    "tipoDocumento" TEXT NOT NULL,
    "urlArquivoSimulado" TEXT NOT NULL,
    "registroClinicoId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnexoClinico_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RegistroClinico_consultaId_key" ON "RegistroClinico"("consultaId");

-- AddForeignKey
ALTER TABLE "RegistroClinico" ADD CONSTRAINT "RegistroClinico_consultaId_fkey" FOREIGN KEY ("consultaId") REFERENCES "Consultas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegistroClinico" ADD CONSTRAINT "RegistroClinico_profissionalId_fkey" FOREIGN KEY ("profissionalId") REFERENCES "Profissional"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnexoClinico" ADD CONSTRAINT "AnexoClinico_registroClinicoId_fkey" FOREIGN KEY ("registroClinicoId") REFERENCES "RegistroClinico"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
