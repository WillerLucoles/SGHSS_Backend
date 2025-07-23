
Este documento descreve todos os endpoints disponíveis na API do Sistema de Gestão Hospitalar e de Serviços de Saúde (SGHSS).

## **Módulo de Autenticação (`/api/usuarios`)**

---

### **1. Login de Utilizador**
* **Endpoint:** `POST /api/usuarios/login`
* **Descrição:** Autentica um utilizador (paciente, profissional ou administrador) e retorna um token JWT.
* **Proteção:** Pública.
* **Corpo (Body):**
    ```json
    {
      "email": "exemplo@email.com",
      "senha": "sua_senha"
    }
    ```

## **Módulo de Pacientes (`/api/pacientes`)**

---

### **1. Registar Novo Paciente**
* **Endpoint:** `POST /api/pacientes/register`
* **Descrição:** Rota pública para um novo paciente criar a sua conta e perfil.
* **Proteção:** Pública.

### **2. Perfil do Paciente Logado (`/me`)**
* **Endpoint:** `GET /api/pacientes/me`
    * **Descrição:** Retorna os dados do perfil do paciente autenticado.
    * **Proteção:** Autenticado | **Role:** `PACIENTE`.

* **Endpoint:** `PUT /api/pacientes/me`
    * **Descrição:** Permite ao paciente autenticado atualizar os seus próprios dados.
    * **Proteção:** Autenticado | **Role:** `PACIENTE`.

* **Endpoint:** `GET /api/pacientes/me/consultas`
    * **Descrição:** Retorna o histórico de consultas do paciente autenticado, incluindo detalhes do registo clínico para consultas realizadas.
    * **Proteção:** Autenticado | **Role:** `PACIENTE`.

### **3. Gestão de Pacientes (Visão do Profissional/Admin)**
* **Endpoint:** `GET /api/pacientes/:id/historico-clinico`
    * **Descrição:** Retorna a "linha do tempo" clínica completa de um paciente, com todas as suas consultas realizadas e registos associados.
    * **Proteção:** Autenticado | **Roles:** `PROFISSIONAL`, `ADMINISTRADOR`.

## **Módulo de Profissionais (`/api/profissionais`)**

---

### **1. Criar Novo Profissional**
* **Endpoint:** `POST /api/profissionais`
* **Descrição:** Cria um novo `Usuario` e `Profissional` associado. Ação administrativa.
* **Proteção:** Autenticado | **Role:** `ADMINISTRADOR`.

### **2. Perfil do Profissional Logado (`/me`)**
* **Endpoint:** `GET /api/profissionais/me`
* **Descrição:** Retorna os dados do perfil do profissional autenticado.
* **Proteção:** Autenticado | **Role:** `PROFISSIONAL`.

* **Endpoint:** `PUT /api/profissionais/me`
* **Descrição:** Permite ao profissional autenticado atualizar o seu próprio perfil.
* **Proteção:** Autenticado | **Role:** `PROFISSIONAL`.

### **3. Disponibilidade de um Profissional**
* **Endpoint:** `GET /api/profissionais/:id/disponibilidade`
* **Descrição:** Retorna os horários livres para um profissional numa data específica.
* **Proteção:** Pública.
* **Parâmetros de Query:** `?data=YYYY-MM-DD` (obrigatório).

## **Módulo de Horários (`/api/horarios`)**

---

### **1. Definir Grade Horária Semanal**
* **Endpoint:** `POST /api/horarios/grade-semanal`
* **Descrição:** Permite a um profissional definir (ou substituir) a sua agenda de trabalho semanal completa numa única chamada.
* **Proteção:** Autenticado | **Role:** `PROFISSIONAL`.
* **Corpo (Body):** Um array de objetos de grade horária.
    ```json
    [
      { "diaDaSemana": 1, "horaInicio": "09:00", "horaFim": "18:00" },
      { "diaDaSemana": 2, "horaInicio": "09:00", "horaFim": "12:00" }
    ]
    ```

### **2. Criar Indisponibilidade (Bloqueio)**
* **Endpoint:** `POST /api/horarios/indisponibilidades`
* **Descrição:** Permite a um profissional bloquear um ou mais períodos na sua agenda.
* **Proteção:** Autenticado | **Role:** `PROFISSIONAL`.
* **Corpo (Body):** Um array de objetos de indisponibilidade.
    ```json
    [
      {
        "inicio": "2025-07-20T15:00:00.000Z",
        "fim": "2025-07-20T16:00:00.000Z",
        "motivo": "Almoço"
      }
    ]
    ```

### **3. Ver a Própria Agenda Completa**
* **Endpoint:** `GET /api/horarios/minha-agenda`
* **Descrição:** Retorna a agenda completa de um profissional para um período, com o status de cada `slot` (Livre, Agendado, Bloqueado).
* **Proteção:** Autenticado | **Role:** `PROFISSIONAL`.
* **Parâmetros de Query:** `?dataInicio=YYYY-MM-DD` e `?dataFim=YYYY-MM-DD` (obrigatórios).

## **Módulo de Consultas e Registos (`/api/consultas` e `/api/registros`)**

---

### **1. Agendar Nova Consulta**
* **Endpoint:** `POST /api/consultas` (pelo paciente)
* **Endpoint:** `POST /api/consultas/agendar-pelo-profissional`
* **Descrição:** Agenda uma nova consulta num horário livre.
* **Proteção:** Autenticado | **Roles:** `PACIENTE` ou `PROFISSIONAL`.

### **2. Cancelar Consulta**
* **Endpoint:** `PATCH /api/consultas/:id/cancelar-paciente`
* **Endpoint:** `PATCH /api/consultas/:id/cancelar-profissional`
* **Descrição:** Cancela uma consulta agendada, libertando o horário.
* **Proteção:** Autenticado | **Roles:** `PACIENTE` ou `PROFISSIONAL` (cada um na sua rota).

### **3. Salvar Registo Clínico de uma Consulta**
* **Endpoint:** `PUT /api/consultas/:id/registro-clinico`
* **Descrição:** Cria ou atualiza o registo clínico de uma consulta. Ao ser salvo, o status da consulta muda para `REALIZADA`.
* **Proteção:** Autenticado | **Role:** `PROFISSIONAL`.

## **Módulo de Administração Hospitalar (`/api/quartos`, `/api/leitos`, `/api/internacoes`)**

---

### **1. Gestão de Quartos**
* **Endpoints:** `POST, GET, PATCH, DELETE /api/quartos`
* **Descrição:** CRUD completo para a gestão de quartos do hospital.
* **Proteção:** Autenticado | **Role:** `ADMINISTRADOR`.

### **2. Gestão de Leitos**
* **Endpoints:** `POST, GET, PATCH, DELETE /api/leitos`
* **Descrição:** CRUD completo para a gestão de leitos.
* **Endpoint:** `GET /api/leitos/status`
    * **Descrição:** Retorna um painel completo com o status de todos os leitos, incluindo detalhes de internações ativas.
    * **Proteção:** Autenticado | **Roles:** `ADMINISTRADOR`, `PROFISSIONAL`.

### **3. Gestão de Internações**
* **Endpoint:** `POST /api/internacoes`
* **Descrição:** Admite um paciente, criando uma nova internação e ocupando um leito.
* **Proteção:** Autenticado | **Roles:** `ADMINISTRADOR`, `PROFISSIONAL`.

* **Endpoint:** `POST /api/internacoes/:id/registros`
* **Descrição:** Adiciona uma nova anotação clínica a uma internação ativa.
* **Proteção:** Autenticado | **Role:** `PROFISSIONAL`.

* **Endpoint:** `PATCH /api/internacoes/:id/alta`
* **Descrição:** Finaliza uma internação, dando alta ao paciente e libertando o leito.
* **Proteção:** Autenticado | **Roles:** `ADMINISTRADOR`, `PROFISSIONAL`.