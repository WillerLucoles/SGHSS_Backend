/*
  Warnings:

  - The primary key for the `Paciente` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `contato` on the `Paciente` table. All the data in the column will be lost.
  - You are about to drop the column `endereco` on the `Paciente` table. All the data in the column will be lost.
  - You are about to drop the column `historicoClinico` on the `Paciente` table. All the data in the column will be lost.
  - You are about to drop the `Teste` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[usuarioId]` on the table `Paciente` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `bairro` to the `Paciente` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cep` to the `Paciente` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cidade` to the `Paciente` table without a default value. This is not possible if the table is not empty.
  - Added the required column `estado` to the `Paciente` table without a default value. This is not possible if the table is not empty.
  - Added the required column `genero` to the `Paciente` table without a default value. This is not possible if the table is not empty.
  - Added the required column `logradouro` to the `Paciente` table without a default value. This is not possible if the table is not empty.
  - Added the required column `numero` to the `Paciente` table without a default value. This is not possible if the table is not empty.
  - Added the required column `telefonePrincipal` to the `Paciente` table without a default value. This is not possible if the table is not empty.
  - Added the required column `usuarioId` to the `Paciente` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('PACIENTE', 'PROFISSIONAL', 'ADMINISTRADOR');

-- CreateEnum
CREATE TYPE "Genero" AS ENUM ('MASCULINO', 'FEMININO', 'OUTRO');

-- CreateEnum
CREATE TYPE "EstadoCivil" AS ENUM ('SOLTEIRO', 'CASADO', 'DIVORCIADO', 'VIUVO', 'UNIAO_ESTAVEL');

-- CreateEnum
CREATE TYPE "TipoCliente" AS ENUM ('PARTICULAR', 'CONVENIO');

-- CreateEnum
CREATE TYPE "TipoQuarto" AS ENUM ('UTI', 'PARTICULAR', 'ENFERMARIA', 'APARTAMENTO');

-- CreateEnum
CREATE TYPE "StatusLeito" AS ENUM ('LIVRE', 'OCUPADO', 'MANUTENCAO', 'HIGIENIZACAO');

-- CreateEnum
CREATE TYPE "StatusJanelaAtendimento" AS ENUM ('LIVRE', 'AGENDADO', 'BLOQUEADO');

-- CreateEnum
CREATE TYPE "StatusConsulta" AS ENUM ('AGENDADA', 'REALIZADA', 'CANCELADA_PACIENTE', 'CANCELADA_PROFISSIONAL', 'NAO_COMPARECEU');

-- CreateEnum
CREATE TYPE "StatusInternacao" AS ENUM ('ATIVA', 'CONCLUIDA_ALTA', 'CONCLUIDA_OBITO');

-- CreateEnum
CREATE TYPE "TipoDocumento" AS ENUM ('EXAME_LABORATORIAL', 'EXAME_IMAGEM', 'LAUDO_MEDICO', 'TERMO_ALTA', 'RECEITA', 'OUTRO');

-- AlterTable
ALTER TABLE "Paciente" DROP CONSTRAINT "Paciente_pkey",
DROP COLUMN "contato",
DROP COLUMN "endereco",
DROP COLUMN "historicoClinico",
ADD COLUMN     "bairro" TEXT NOT NULL,
ADD COLUMN     "cep" TEXT NOT NULL,
ADD COLUMN     "cidade" TEXT NOT NULL,
ADD COLUMN     "complemento" TEXT,
ADD COLUMN     "estado" TEXT NOT NULL,
ADD COLUMN     "estadoCivil" "EstadoCivil",
ADD COLUMN     "genero" "Genero" NOT NULL,
ADD COLUMN     "logradouro" TEXT NOT NULL,
ADD COLUMN     "nomeContatoEmergencia" TEXT,
ADD COLUMN     "nomeConvenio" TEXT,
ADD COLUMN     "numero" TEXT NOT NULL,
ADD COLUMN     "numeroCarteirinha" TEXT,
ADD COLUMN     "planoConvenio" TEXT,
ADD COLUMN     "telefoneContatoEmergencia" TEXT,
ADD COLUMN     "telefonePrincipal" TEXT NOT NULL,
ADD COLUMN     "telefoneSecundario" TEXT,
ADD COLUMN     "tipoCliente" "TipoCliente" NOT NULL DEFAULT 'PARTICULAR',
ADD COLUMN     "usuarioId" TEXT NOT NULL,
ADD COLUMN     "validadeCarteirinha" TIMESTAMP(3),
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Paciente_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Paciente_id_seq";

-- DropTable
DROP TABLE "Teste";

-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "ultimoLogin" TIMESTAMP(3),
    "dataCriacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataUpdate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Profissional" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "crm" TEXT NOT NULL,
    "ufCrm" TEXT NOT NULL,
    "especialidadePrincipal" TEXT NOT NULL,
    "especialidadesSecundarias" TEXT[],
    "telefone" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,

    CONSTRAINT "Profissional_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Administrador" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cargo" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,

    CONSTRAINT "Administrador_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HorarioPadrao" (
    "id" TEXT NOT NULL,
    "diaDaSemana" INTEGER NOT NULL,
    "horaInicio" TEXT NOT NULL,
    "horaFim" TEXT NOT NULL,
    "duracaoConsultaMinutos" INTEGER NOT NULL DEFAULT 30,
    "profissionalId" TEXT NOT NULL,

    CONSTRAINT "HorarioPadrao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JanelaDeAtendimento" (
    "id" TEXT NOT NULL,
    "dataHoraInicio" TIMESTAMP(3) NOT NULL,
    "dataHoraFim" TIMESTAMP(3) NOT NULL,
    "status" "StatusJanelaAtendimento" NOT NULL DEFAULT 'LIVRE',
    "profissionalId" TEXT NOT NULL,

    CONSTRAINT "JanelaDeAtendimento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Consultas" (
    "id" TEXT NOT NULL,
    "statusConsulta" "StatusConsulta" NOT NULL DEFAULT 'AGENDADA',
    "dataCriacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataUpdate" TIMESTAMP(3) NOT NULL,
    "pacienteId" TEXT NOT NULL,
    "profissionalId" TEXT NOT NULL,
    "janelaDeAtendimentoId" TEXT NOT NULL,

    CONSTRAINT "Consultas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BloqueioHorario" (
    "id" TEXT NOT NULL,
    "inicio" TIMESTAMP(3) NOT NULL,
    "fim" TIMESTAMP(3) NOT NULL,
    "motivo" TEXT,
    "profissionalId" TEXT NOT NULL,

    CONSTRAINT "BloqueioHorario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Quarto" (
    "id" TEXT NOT NULL,
    "numeroQuarto" TEXT NOT NULL,
    "tipo" "TipoQuarto" NOT NULL,
    "capacidade" INTEGER NOT NULL,

    CONSTRAINT "Quarto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Leito" (
    "id" TEXT NOT NULL,
    "identificacaoLeito" TEXT NOT NULL,
    "status" "StatusLeito" NOT NULL DEFAULT 'LIVRE',
    "quartoId" TEXT NOT NULL,

    CONSTRAINT "Leito_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Internacao" (
    "id" TEXT NOT NULL,
    "dataEntrada" TIMESTAMP(3) NOT NULL,
    "dataPrevistaAlta" TIMESTAMP(3),
    "dataEfetivaAlta" TIMESTAMP(3),
    "status" "StatusInternacao" NOT NULL DEFAULT 'ATIVA',
    "pacienteId" TEXT NOT NULL,
    "leitoId" TEXT NOT NULL,
    "profissionalId" TEXT NOT NULL,

    CONSTRAINT "Internacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Prontuario" (
    "id" TEXT NOT NULL,
    "dataCriacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pacienteId" TEXT NOT NULL,

    CONSTRAINT "Prontuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EntradaProntuario" (
    "id" TEXT NOT NULL,
    "dataHora" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "prontuarioId" TEXT NOT NULL,
    "profissionalId" TEXT NOT NULL,
    "consultaId" TEXT,
    "internacaoId" TEXT,

    CONSTRAINT "EntradaProntuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentoAnexado" (
    "id" TEXT NOT NULL,
    "nomeArquivo" TEXT NOT NULL,
    "tipoDocumento" "TipoDocumento" NOT NULL,
    "urlArquivo" TEXT NOT NULL,
    "dataUpload" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "entradaProntuarioId" TEXT NOT NULL,

    CONSTRAINT "DocumentoAnexado_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Profissional_cpf_key" ON "Profissional"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "Profissional_crm_key" ON "Profissional"("crm");

-- CreateIndex
CREATE UNIQUE INDEX "Profissional_usuarioId_key" ON "Profissional"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "Administrador_usuarioId_key" ON "Administrador"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "JanelaDeAtendimento_profissionalId_dataHoraInicio_key" ON "JanelaDeAtendimento"("profissionalId", "dataHoraInicio");

-- CreateIndex
CREATE UNIQUE INDEX "Consultas_janelaDeAtendimentoId_key" ON "Consultas"("janelaDeAtendimentoId");

-- CreateIndex
CREATE UNIQUE INDEX "Quarto_numeroQuarto_key" ON "Quarto"("numeroQuarto");

-- CreateIndex
CREATE UNIQUE INDEX "Leito_quartoId_identificacaoLeito_key" ON "Leito"("quartoId", "identificacaoLeito");

-- CreateIndex
CREATE UNIQUE INDEX "Internacao_pacienteId_key" ON "Internacao"("pacienteId");

-- CreateIndex
CREATE UNIQUE INDEX "Internacao_leitoId_key" ON "Internacao"("leitoId");

-- CreateIndex
CREATE UNIQUE INDEX "Prontuario_pacienteId_key" ON "Prontuario"("pacienteId");

-- CreateIndex
CREATE UNIQUE INDEX "EntradaProntuario_consultaId_key" ON "EntradaProntuario"("consultaId");

-- CreateIndex
CREATE UNIQUE INDEX "Paciente_usuarioId_key" ON "Paciente"("usuarioId");

-- AddForeignKey
ALTER TABLE "Paciente" ADD CONSTRAINT "Paciente_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Profissional" ADD CONSTRAINT "Profissional_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Administrador" ADD CONSTRAINT "Administrador_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HorarioPadrao" ADD CONSTRAINT "HorarioPadrao_profissionalId_fkey" FOREIGN KEY ("profissionalId") REFERENCES "Profissional"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JanelaDeAtendimento" ADD CONSTRAINT "JanelaDeAtendimento_profissionalId_fkey" FOREIGN KEY ("profissionalId") REFERENCES "Profissional"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Consultas" ADD CONSTRAINT "Consultas_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "Paciente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Consultas" ADD CONSTRAINT "Consultas_profissionalId_fkey" FOREIGN KEY ("profissionalId") REFERENCES "Profissional"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Consultas" ADD CONSTRAINT "Consultas_janelaDeAtendimentoId_fkey" FOREIGN KEY ("janelaDeAtendimentoId") REFERENCES "JanelaDeAtendimento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BloqueioHorario" ADD CONSTRAINT "BloqueioHorario_profissionalId_fkey" FOREIGN KEY ("profissionalId") REFERENCES "Profissional"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Leito" ADD CONSTRAINT "Leito_quartoId_fkey" FOREIGN KEY ("quartoId") REFERENCES "Quarto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Internacao" ADD CONSTRAINT "Internacao_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "Paciente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Internacao" ADD CONSTRAINT "Internacao_leitoId_fkey" FOREIGN KEY ("leitoId") REFERENCES "Leito"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Internacao" ADD CONSTRAINT "Internacao_profissionalId_fkey" FOREIGN KEY ("profissionalId") REFERENCES "Profissional"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prontuario" ADD CONSTRAINT "Prontuario_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "Paciente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EntradaProntuario" ADD CONSTRAINT "EntradaProntuario_prontuarioId_fkey" FOREIGN KEY ("prontuarioId") REFERENCES "Prontuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EntradaProntuario" ADD CONSTRAINT "EntradaProntuario_profissionalId_fkey" FOREIGN KEY ("profissionalId") REFERENCES "Profissional"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EntradaProntuario" ADD CONSTRAINT "EntradaProntuario_consultaId_fkey" FOREIGN KEY ("consultaId") REFERENCES "Consultas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EntradaProntuario" ADD CONSTRAINT "EntradaProntuario_internacaoId_fkey" FOREIGN KEY ("internacaoId") REFERENCES "Internacao"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentoAnexado" ADD CONSTRAINT "DocumentoAnexado_entradaProntuarioId_fkey" FOREIGN KEY ("entradaProntuarioId") REFERENCES "EntradaProntuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
