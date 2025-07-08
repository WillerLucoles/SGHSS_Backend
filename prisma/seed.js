// prisma/seed.js

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log('A iniciar o processo de seeding...');

  // 1. Lê as credenciais seguras do ambiente
  const adminEmail = process.env.SEED_ADMIN_EMAIL;
  const adminSenha = process.env.SEED_ADMIN_SENHA;

  if (!adminEmail || !adminSenha) {
    throw new Error(
      'As variáveis de ambiente SEED_ADMIN_EMAIL e SEED_ADMIN_SENHA devem ser definidas.'
    );
  }

  // 2. Verifica se o administrador já existe para não criar duplicatas
  const adminExistente = await prisma.usuario.findUnique({
    where: { email: adminEmail },
  });

  if (adminExistente) {
    console.log('O utilizador administrador já existe. Seeding ignorado.');
    return;
  }

  // 3. Criptografa a senha
  const senhaHash = await bcrypt.hash(adminSenha, 8);

  // 4. Cria o utilizador e o perfil de administrador
  const adminUser = await prisma.usuario.create({
    data: {
      email: adminEmail,
      senha: senhaHash,
      role: 'ADMINISTRADOR',
      administrador: {
        create: {
          nome: 'Administrador Padrão',
          cargo: 'SysAdmin',
        },
      },
    },
    // Inclui os dados do administrador criado na resposta
    include: {
      administrador: true,
    },
  });

  console.log(
    `Utilizador Administrador criado: ${adminUser.email} com o nome '${adminUser.administrador.nome}'`
  );
  console.log('Seeding concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error('Ocorreu um erro durante o seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });