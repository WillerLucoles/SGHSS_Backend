# VIDAPLUS
## SGHSS - Sistema de Gestão Hospitalar e Saúde Suplementar

## 📋 Sobre o Projeto

O SGHSS é um sistema completo de gestão hospitalar desenvolvido em Node.js, projetado para facilitar o gerenciamento de pacientes, profissionais de saúde, consultas e prontuários médicos.

## 🚀 Tecnologias Utilizadas

- **Backend**: Node.js + Express.js
- **Banco de Dados**: PostgreSQL
- **ORM**: Prisma
- **Autenticação**: JWT (JSON Web Tokens)
- **Validação**: Express Validator + Zod
- **Segurança**: Helmet, CORS, Rate Limiting
- **Documentação**: Swagger/OpenAPI (em desenvolvimento)

## 📁 Estrutura do Projeto

```
src/
├── config/          # Configurações (banco, etc.)
├── controllers/     # Controladores das rotas
├── middleware/      # Middlewares customizados
├── routes/          # Definição das rotas
├── utils/           # Utilitários e helpers
└── server.js        # Arquivo principal do servidor

prisma/
├── schema.prisma    # Schema do banco de dados
└── migrations/      # Migrações do banco
```

## 🔧 Instalação e Configuração

### Pré-requisitos

- Node.js (versão 18 ou superior)
- PostgreSQL
- npm ou yarn

### Passos para instalação

1. **Clone o repositório**
```bash
git clone <url-do-repositorio>
cd sghss-api
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**
```bash
cp .env.example .env
```
Edite o arquivo `.env` com suas configurações.

4. **Configure o banco de dados**
```bash
# Gerar o cliente Prisma
npm run db:generate

# Executar migrações
npm run db:migrate

# (Opcional) Popular banco com dados de teste
npm run db:seed
```

5. **Inicie o servidor**
```bash
# Desenvolvimento
npm run dev

# Produção
npm start
```

## 📊 Modelo de Dados

### Entidades Principais

- **Usuario**: Dados básicos de autenticação
- **Paciente**: Informações específicas dos pacientes
- **Profissional**: Dados dos profissionais de saúde
- **Consulta**: Agendamentos e consultas médicas
- **Prontuario**: Histórico médico dos pacientes
- **HorarioAtendimento**: Disponibilidade dos profissionais

### Tipos de Usuário

- **PACIENTE**: Pode agendar consultas e visualizar seu histórico
- **PROFISSIONAL**: Pode gerenciar consultas e prontuários
- **ADMINISTRADOR**: Acesso completo ao sistema

## 🔐 Autenticação e Autorização

O sistema utiliza JWT para autenticação e implementa controle de acesso baseado em roles:

- Tokens JWT com expiração configurável
- Middleware de autenticação para rotas protegidas
- Autorização baseada no tipo de usuário
- Logs de acesso para auditoria

## 📡 API Endpoints

### Autenticação
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Registro
- `GET /api/auth/me` - Perfil do usuário
- `POST /api/auth/logout` - Logout

### Usuários
- `GET /api/usuarios` - Listar usuários (Admin)
- `GET /api/usuarios/:id` - Obter usuário
- `PUT /api/usuarios/:id` - Atualizar usuário

### Pacientes
- `GET /api/pacientes` - Listar pacientes
- `POST /api/pacientes` - Criar perfil de paciente
- `GET /api/pacientes/:id` - Obter paciente
- `PUT /api/pacientes/:id` - Atualizar paciente

### Profissionais
- `GET /api/profissionais` - Listar profissionais
- `POST /api/profissionais` - Criar perfil de profissional
- `GET /api/profissionais/:id/horarios` - Horários de atendimento

### Consultas
- `GET /api/consultas` - Listar consultas
- `POST /api/consultas` - Agendar consulta
- `PUT /api/consultas/:id` - Atualizar consulta
- `PUT /api/consultas/:id/confirmar` - Confirmar consulta

## 🛡️ Segurança

- Senhas criptografadas com bcrypt
- Rate limiting para prevenir ataques
- Validação rigorosa de dados de entrada
- Headers de segurança com Helmet
- Logs de auditoria

## 🧪 Testes

```bash
# Executar testes
npm test

# Executar testes em modo watch
npm run test:watch
```

## 📈 Monitoramento

- Health check endpoint: `GET /health`
- Logs estruturados com Morgan
- Métricas de performance (em desenvolvimento)

## 🚀 Deploy

### Desenvolvimento
```bash
npm run dev
```

### Produção
```bash
npm start
```

## 📝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 👥 Equipe

- **Willer Lucoles** - Desenvolvedor Principal

## 📞 Suporte

Para suporte, entre em contato através do email: suporte@sghss.com

---

**SGHSS** - Sistema de Gestão Hospitalar e Saúde Suplementar
```
