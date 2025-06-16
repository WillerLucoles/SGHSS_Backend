-- CreateTable
CREATE TABLE "Paciente" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "dataNascimento" TIMESTAMP(3) NOT NULL,
    "endereco" TEXT NOT NULL,
    "contato" TEXT NOT NULL,
    "historicoClinico" TEXT,

    CONSTRAINT "Paciente_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Paciente_cpf_key" ON "Paciente"("cpf");
