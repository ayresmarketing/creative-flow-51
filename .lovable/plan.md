

## Correcao dos dois bugs

### Bug 1: Produto nao e criado apos preencher formulario

**Problema**: O `CreateProductDialog` apenas faz `console.log` quando o usuario clica em "Criar Produto". Nao insere nada no banco de dados e nao atualiza a lista.

**Solucao**:
- Atualizar `CreateProductDialog` para receber uma prop `clientId` (para saber a qual cliente o produto pertence) e uma callback `onCreated`
- Ao clicar em "Criar Produto", inserir o registro na tabela `products` do banco de dados com `name`, `acronym`, `category` e `client_id`
- Apos a insercao, chamar `onCreated()` para atualizar a lista de produtos
- Para o caso "Infoproduto" (que abre Google Form), adicionar um botao "Concluir" apos o formulario para tambem salvar o produto
- Atualizar o `Dashboard` para buscar produtos do banco de dados em vez de usar dados mock

### Bug 2: Erro 404 ao clicar em cliente (gestor)

**Problema**: A pagina `Clients.tsx` navega para `/clients/:clientId`, mas essa rota nao existe no `App.tsx`. So existem rotas para `/clients` (lista).

**Solucao**:
- Criar uma nova pagina `ClientProducts.tsx` que exibe os produtos de um cliente especifico
- Essa pagina recebe o `clientId` da URL, busca os produtos daquele cliente no banco de dados e exibe em cards (reutilizando o mesmo layout do Dashboard)
- O gestor pode criar novos produtos para aquele cliente a partir dessa pagina
- Adicionar a rota `/clients/:clientId` no `App.tsx` apontando para `ClientProducts`

---

### Detalhes tecnicos

**Arquivos modificados:**
- `src/components/CreateProductDialog.tsx` -- adicionar props `clientId` e `onCreated`, inserir no banco via `supabase.from("products").insert(...)`
- `src/pages/Dashboard.tsx` -- buscar produtos reais do banco (filtrados por `client_id` do usuario logado se for CLIENTE)
- `src/pages/ClientProducts.tsx` (novo) -- pagina para gestor ver produtos de um cliente especifico
- `src/App.tsx` -- adicionar rota `/clients/:clientId`

**Fluxo corrigido do produto:**
1. Cliente ou gestor clica em "Novo Produto"
2. Preenche nome + sigla (min 3 chars), clica "Proximo"
3. Seleciona categoria
4. Se nao for Infoproduto: clica "Criar Produto" -> insere no banco -> fecha dialog -> atualiza lista
5. Se for Infoproduto: abre Google Form -> ao fechar o form, produto e salvo -> atualiza lista

**Fluxo corrigido do gestor -> cliente:**
1. Gestor clica em um card de cliente na pagina `/clients`
2. Navega para `/clients/:clientId`
3. `ClientProducts` carrega e busca produtos daquele `client_id` no banco
4. Exibe os produtos em cards, com opcao de criar novos produtos para aquele cliente

