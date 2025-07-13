# Documentação da API SGHSS (Versão Visual)

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
* **Resposta de Sucesso (200 OK):**
    ```json
    {
      "token": "seu_token_jwt...",
      "usuario": { "id": "...", "email": "...", "role": "..." }
    }
    ```

<br>

## **Módulo de Pacientes (`/api/pacientes`)**

---

### **1. Registar Novo Paciente**
* **Endpoint:** `POST /api/pacientes/register`
* **Descrição:** Rota pública para um novo paciente criar a sua conta de utilizador e o seu perfil de paciente.
* **Proteção:** Pública.
* **Corpo (Body):** Requer os dados completos do paciente, incluindo `email` e `senha`.

### **2. Perfil do Paciente Logado (`/me`)**
* **Endpoint:** `GET /api/pacientes/me`
    * **Descrição:** Retorna os dados completos do perfil do paciente que está autenticado.
    * **Proteção:** Autenticado | **Role:** `PACIENTE`.

* **Endpoint:** `PUT /api/pacientes/me`
    * **Descrição:** Permite ao paciente autenticado atualizar os seus próprios dados.
    * **Proteção:** Autenticado | **Role:** `PACIENTE`.

* **Endpoint:** `GET /api/pacientes/me/consultas`
    * **Descrição:** Retorna o histórico de consultas do paciente autenticado.
    * **Proteção:** Autenticado | **Role:** `PACIENTE`.

### **3. Gestão Administrativa de Pacientes**
* **Endpoint:** `GET /api/pacientes`
    * **Descrição:** Lista todos os pacientes cadastrados.
    * **Proteção:** Autenticado | **Roles:** `ADMINISTRADOR`, `PROFISSIONAL`.

* **Endpoint:** `GET /api/pacientes/:id`
    * **Descrição:** Busca os detalhes de um paciente específico pelo ID.
    * **Proteção:** Autenticado | **Roles:** `ADMINISTRADOR`, `PROFISSIONAL`.

<br>


## **Módulo de Profissionais (`/api/profissionais`)**

---

### **1. Criar Novo Profissional**
* **Endpoint:** `POST /api/profissionais`
* **Descrição:** Cria um novo `Usuario` e `Profissional` associado.
* **Proteção:** Autenticado | **Role:** `ADMINISTRADOR`.
* **Corpo (Body):** Requer dados completos do profissional, incluindo `email` e `senha`.

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

<br>

## **Módulo de Horários (`/api/horarios`)**

---

### **1. Definir Grade Horária Padrão**
* **Endpoint:** `POST /api/horarios/padrao`
* **Descrição:** Permite a um profissional definir o seu horário de trabalho semanal recorrente.
* **Proteção:** Autenticado | **Role:** `PROFISSIONAL`.
* **Corpo (Body):**
    ```json
    {
      "diaDaSemana": 1,
      "horaInicio": "09:00",
      "horaFim": "18:00"
    }
    ```

### **2. Criar Indisponibilidade (Bloqueio)**
* **Endpoint:** `POST /api/horarios/indisponibilidades`
* **Descrição:** Permite a um profissional bloquear um período na sua agenda.
* **Proteção:** Autenticado | **Role:** `PROFISSIONAL`.
* **Corpo (Body):**
    ```json
    {
      "inicio": "2025-07-20T15:00:00.000Z",
      "fim": "2025-07-20T16:00:00.000Z",
      "motivo": "Almoço"
    }
    ```

<br>

## **Módulo de Consultas (`/api/consultas`)**

---

### **1. Agendar Nova Consulta**
* **Endpoint:** `POST /api/consultas`
* **Descrição:** Permite a um paciente agendar uma consulta num horário livre.
* **Proteção:** Autenticado | **Role:** `PACIENTE`.
* **Corpo (Body) - Proposta:**
    ```json
    {
      "profissionalId": "uuid-do-profissional",
      "dataHoraInicio": "2025-07-20T10:30:00.000Z"
    }
    ```