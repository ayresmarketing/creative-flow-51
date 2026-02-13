

## Controle de Acesso: Gestor cadastra Clientes (versao mock)

### Resumo

O Gestor tera uma nova aba "Clientes" na navegacao lateral, onde pode cadastrar novos clientes informando nome e email. Cada cliente recebe uma senha gerada automaticamente. Ao fazer login como Cliente, o usuario ve apenas sua propria pasta com seus produtos.

---

### O que muda para o Gestor

- Nova aba **"Clientes"** no menu lateral (visivel apenas para Gestores)
- Pagina `/clients` com lista de clientes cadastrados em cards
- Botao "Novo Cliente" abre um dialog pedindo:
  - **Nome do cliente** (obrigatorio)
  - **Email do cliente** (obrigatorio)
- Ao confirmar, o sistema gera uma **senha aleatoria de 8 caracteres** e exibe na tela para o gestor copiar e enviar ao cliente
- O gestor pode clicar em qualquer cliente para ver os produtos daquele cliente

### O que muda para o Cliente

- Ao fazer login com email/senha de cliente, o sistema redireciona para `/dashboard`
- O Cliente ve **apenas seus proprios produtos** (filtrados pelo `clientId`)
- O menu lateral **nao mostra** a aba "Clientes"
- O Cliente pode criar novos produtos normalmente dentro da sua pasta

### Fluxo de Login

- Na tela de login, o sistema verifica o email informado contra a lista de contas mock
- Se for um Gestor, redireciona para `/dashboard` com visao global
- Se for um Cliente, redireciona para `/dashboard` com visao filtrada apenas para os produtos dele

---

### Detalhes Tecnicos

**1. Contexto de autenticacao global** (`src/contexts/AuthContext.tsx` - novo arquivo)

- Cria um React Context com estado global do usuario logado
- Armazena: `{ id, name, email, role, clientId? }`
- Lista mock de usuarios (gestor + clientes cadastrados dinamicamente)
- Funcoes: `login(email, password)`, `logout()`, `addClient(name, email)`
- A funcao `addClient` gera senha aleatoria e adiciona ao array de usuarios mock

**2. Navegacao condicional** (`src/components/Layout.tsx`)

- Consome o `AuthContext` para saber o role do usuario
- Se `role === "GESTOR"`: mostra aba "Clientes" com icone `Users` no menu
- Se `role === "CLIENTE"`: esconde aba "Clientes"

**3. Pagina de Clientes** (`src/pages/Clients.tsx` - novo arquivo)

- Acessivel apenas por Gestores
- Lista de clientes em cards com nome, email e quantidade de produtos
- Botao "Novo Cliente" abre `CreateClientDialog`
- Clicar em um cliente navega para `/clients/:clientId` mostrando os produtos dele

**4. Dialog de cadastro** (`src/components/CreateClientDialog.tsx` - novo arquivo)

- Formulario com campos Nome e Email
- Ao confirmar: gera senha aleatoria, adiciona usuario ao contexto
- Exibe modal de confirmacao com a senha gerada e botao para copiar

**5. Login real por contexto** (`src/pages/Login.tsx`)

- Usa `AuthContext.login()` para validar email/senha
- Contas demo atualizadas para usar o contexto
- Redireciona para `/dashboard` em caso de sucesso

**6. Dashboard filtrado** (`src/pages/Dashboard.tsx`)

- Consome `AuthContext`
- Se Gestor: mostra todos os produtos (comportamento atual)
- Se Cliente: filtra `mockProducts` pelo `clientId` do usuario logado

**7. Rotas** (`src/App.tsx`)

- Adiciona rota `/clients` -> `Clients`
- Adiciona rota `/clients/:clientId` -> `ClientProducts` (reutiliza Dashboard filtrado)

### Arquivos modificados
- `src/contexts/AuthContext.tsx` (novo)
- `src/components/CreateClientDialog.tsx` (novo)
- `src/pages/Clients.tsx` (novo)
- `src/components/Layout.tsx` (aba condicional)
- `src/pages/Login.tsx` (usa contexto)
- `src/pages/Dashboard.tsx` (filtro por clientId)
- `src/App.tsx` (novas rotas + AuthProvider)

