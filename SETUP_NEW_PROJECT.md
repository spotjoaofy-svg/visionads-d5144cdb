# 💾 Migração do Banco de Dados - Instruções Passo-a-Passo

## 📍 Seu novo projeto
- **URL**: https://mxutidghlefnvjgskbbu.supabase.co
- **Project Ref**: mxutidghlefnvjgskbbu

---

## 🎯 3 Opções de Migração (escolha uma)

### ✨ OPÇÃO 1: Mais Fácil - SQL Editor do Supabase Dashboard

**Ideal para**: Usuários que preferem interface visual

#### Passo 1: Obter as credenciais
1. Acesse [app.supabase.com](https://app.supabase.com)
2. Selecione o projeto `mxutidghlefnvjgskbbu`
3. Vá para **Settings** → **API**
4. Copie e salve:
   - ✅ **Project URL**: https://mxutidghlefnvjgskbbu.supabase.co
   - ✅ **anon public key** (VITE_SUPABASE_PUBLISHABLE_KEY)
   - ✅ **service_role key** (para operações admin)

#### Passo 2: Executar o SQL
1. No Supabase Dashboard, vá para **SQL Editor**
2. Clique em **+ New query**
3. Copie todo o SQL do arquivo: [supabase/migrations/20260321165728_f84749fb-30b6-41a2-a264-8c7a4f10fcdb.sql](./supabase/migrations/20260321165728_f84749fb-30b6-41a2-a264-8c7a4f10fcdb.sql)
4. Cole no editor SQL
5. Clique em **Run** (ou Ctrl+Enter)
6. Aguarde até ver ✅ no final da execução

#### Passo 3: Verificar tabelas
1. Vá para **Database** → **Tables**
2. Você deve ver estas tabelas:
   - ✅ profiles
   - ✅ workspaces
   - ✅ workspace_members
   - ✅ ad_accounts
   - ✅ campaigns
   - ✅ daily_metrics
   - ✅ creatives
   - ✅ creative_audits
   - ✅ alerts
   - ✅ alert_rules
   - ✅ ai_chat_messages

---

### 🚀 OPÇÃO 2: Automática - Script Bash

**Ideal para**: Linha de comando (macOS/Linux)

```bash
# 1. Dê permissão de execução
chmod +x migrate.sh

# 2. Execute o script
./migrate.sh

# Ele irá pedir:
# - URL do novo projeto: https://mxutidghlefnvjgskbbu.supabase.co
# - Project Reference: mxutidghlefnvjgskbbu
# - Access Token: (gere em Account → Tokens no Supabase Dashboard)
```

**Como obter Access Token:**
1. Vá para [app.supabase.com](https://app.supabase.com)
2. Clique na sua foto (canto superior direito)
3. **Account** → **Tokens**
4. Clique em **Generate** (Nova token)
5. Copie e use no script

---

### 🐍 OPÇÃO 3: Python - Script Programático

**Ideal para**: Integração com CI/CD ou automação

```bash
# 1. Instale requests (se não tiver)
pip install requests

# 2. Execute o script
python3 migrate_db.py

# Ele irá pedir:
# - URL do novo projeto
# - Service Role Key (Settings → API → service_role)
```

**Ou com argumentos:**
```bash
python3 migrate_db.py \
  --url "https://mxutidghlefnvjgskbbu.supabase.co" \
  --key "sua_service_role_key_aqui" \
  --sql "supabase/migrations/20260321165728_f84749fb-30b6-41a2-a264-8c7a4f10fcdb.sql"
```

---

## 🔄 IMPORTANTE: Atualizar o arquivo .env

Após escolher uma das opções acima e executar:

### Passo 1: Abrir arquivo .env
```bash
nano .env
```

### Passo 2: Atualizar os valores

**ANTES:**
```env
VITE_SUPABASE_PROJECT_ID="btklpccneknufyqiwnaf"
VITE_SUPABASE_URL="https://btklpccneknufyqiwnaf.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0a2xwY2NuZWtudWZ5cWl3bmFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxMDA1NjcsImV4cCI6MjA4OTY3NjU2N30.LgxmNu9IW72Xw2nFczb4bYpuNTstkUV_5X3s6fA3NWM"
```

**DEPOIS:**
```env
VITE_SUPABASE_PROJECT_ID="mxutidghlefnvjgskbbu"
VITE_SUPABASE_URL="https://mxutidghlefnvjgskbbu.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="SEU_ANON_KEY_AQUI"
```

### Passo 3: Salvar (Ctrl+S ou Ctrl+O em nano)

---

## 🧪 Testes Pós-Migração

### 1. Reiniciar servidor
```bash
bun run dev
```

### 2. Testar login
1. Acesse http://localhost:5173/login
2. Crie uma conta com email/senha
3. Verifique se entrou no dashboard

### 3. Verificar dados no Supabase
1. Acesse [app.supabase.com](https://app.supabase.com)
2. No seu novo projeto, vá para **SQL Editor**
3. Execute:
```sql
SELECT * FROM profiles;
SELECT * FROM workspaces;
```
4. Você deve ver os dados da conta que criou

---

## 🆘 Se algo der errado

| Erro | Solução |
|------|---------|
| "Cannot create extension" | Você precisa de permissões de admin no Supabase |
| "policy already exists" | Normal - aquele comando que criou a policy já existe |
| "relation doesn't exist" | A tabela não foi criada - execute o SQL novamente |
| Credenciais inválidas | Copie novamente as keys do Supabase Dashboard |
| "Table not found" no app | Seu .env ainda aponta para o projeto antigo |

---

## 📋 Checklist Final

- [ ] 1. Escolhi uma opção de migração (SQL Editor / Bash / Python)
- [ ] 2. Coletei as credenciais do novo projeto Supabase
- [ ] 3. Executei a migração sem erros
- [ ] 4. Verifiquei que as 11 tabelas foram criadas
- [ ] 5. Atualizei o arquivo .env
- [ ] 6. Reiniciei o servidor (bun run dev)
- [ ] 7. Testei o login no http://localhost:5173/login
- [ ] 8. Criei uma conta de teste
- [ ] 9. Verifiquei os dados no Supabase Dashboard

---

## ✅ Pronto!

Após completar todos os itens do checklist, seu app estará rodando no novo projeto Supabase.

**Próximas ações (opcionais):**
- [ ] Deletar o projeto Supabase antigo (se não precisar de backup)
- [ ] Configurar Facebook OAuth no novo projeto (copie as credenciais do antigo)
- [ ] Fazer nova configuração de Google OAuth

---

## 📞 Precisa de ajuda?

1. Confira a documentação: [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)
2. Veja os logs do Supabase em **Logs** no Dashboard
3. Procure o erro específico no terminal/console

**Bom sorte! 🚀**
