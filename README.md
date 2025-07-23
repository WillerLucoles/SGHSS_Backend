# SGHSS - Sistema de Gestão Hospitalar e de Serviços de Saúde

> API Backend para um sistema de gestão hospitalar completo, desenvolvido como parte do projeto de programação do curso.

## 📜 Sobre o Projeto

O SGHSS é uma API RESTful robusta, desenvolvida em Node.js, que serve como a espinha dorsal para um sistema de gestão de saúde. A aplicação foi construída seguindo as melhores práticas de arquitetura de software, incluindo uma estrutura em camadas, autenticação baseada em tokens (JWT), e um sistema de agendamento dinâmico. O objetivo principal é fornecer uma base segura e escalável para a gestão de pacientes, profissionais, agendamentos, prontuários e infraestrutura hospitalar.

## ✨ Funcionalidades Principais

* **Autenticação e Autorização:** Sistema seguro de login com JWT e controlo de acesso baseado em papéis (Admin, Profissional, Paciente).
* **Gestão de Pacientes:** CRUD completo para pacientes, incluindo um portal para o próprio paciente gerir o seu perfil e ver o seu histórico.
* **Gestão de Profissionais:** CRUD completo para profissionais, gerido por administradores, e um portal para o profissional gerir o seu perfil.
* **Sistema de Agenda Inteligente:**
    * Profissionais podem definir a sua grade de trabalho semanal.
    * A API calcula a disponibilidade em tempo real, considerando consultas já agendadas e bloqueios.
    * Profissionais podem bloquear períodos (indisponibilidades) para almoço, reuniões, etc.
* **Ciclo de Consultas Completo:** Pacientes podem agendar consultas em horários livres, e tanto pacientes como profissionais podem cancelar agendamentos.
* **Módulo de Prontuários:** Profissionais podem criar registos clínicos detalhados para consultas e internações, com suporte para anexos (simulados).
* **Módulo de Administração Hospitalar:** CRUD completo para gestão de quartos e leitos, e um fluxo para admissão e alta de pacientes em internações.

## 🛠️ Tecnologias Utilizadas

* **Backend:** Node.js, Express.js
* **Base de Dados:** PostgreSQL
* **ORM:** Prisma
* **Validação:** Zod
* **Autenticação:** JWT (JSON Web Tokens), bcryptjs
* **Ambiente:** ES Modules

## 🚀 Como Executar o Projeto Localmente

Siga os passos abaixo para configurar e executar o projeto na sua máquina.

### **Pré-requisitos**

* [Node.js](https://nodejs.org/) (versão 20.x ou superior)
* [PostgreSQL](https://www.postgresql.org/)
* Um cliente de API como o [Postman](https://www.postman.com/) ou [Insomnia](https://insomnia.rest/)

### **Instalação**

1.  **Clone o repositório:**
    ```bash
    git clone [https://github.com/WillerLucoles/SGHSS_Backend.git](https://github.com/WillerLucoles/SGHSS_Backend.git)
    cd SGHSS_Backend
    ```

2.  **Instale as dependências:**
    ```bash
    npm install
    ```

3.  **Configure as Variáveis de Ambiente:**
    * Crie uma cópia do ficheiro `.env.example` (se não existir, crie um `.env`) na raiz do projeto.
    * Preencha as variáveis, especialmente a `DATABASE_URL`:
        ```
        DATABASE_URL="postgresql://SEU_USER:SUA_SENHA@localhost:5432/sghss_db?schema=public"
        JWT_SECRET="SUA_CHAVE_SECRETA_AQUI"
        SEED_ADMIN_EMAIL="admin@sghss.com"
        SEED_ADMIN_SENHA="SuaSenhaDeAdminAqui"
        ```

4.  **Aplique as Migrações da Base de Dados:**
    Este comando irá criar as tabelas na sua base de dados com base no `schema.prisma`.
    ```bash
    npx prisma migrate dev
    ```

5.  **"Semeie" a Base de Dados (Crie o Admin):**
    Este comando irá executar o nosso script de seeding para criar o utilizador administrador padrão.
    ```bash
    npx prisma db seed
    ```

6.  **Inicie o Servidor:**
    ```bash
    npm run dev
    ```
    O servidor estará a ser executado em `http://localhost:3000`.

## 📚 Endpoints da API

A documentação completa de todos os endpoints, com exemplos de requisição e resposta, pode ser encontrada no ficheiro [API_DOCUMENTATION.md](API_DOCUMENTATION.md).