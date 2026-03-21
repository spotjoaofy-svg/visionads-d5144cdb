# 📊 Guia de Migração do Banco de Dados Supabase

## 🎯 Objetivo
Migrar toda a estrutura do banco de dados do projeto antigo para o novo projeto Supabase:
- **Projeto Antigo**: https://btklpccneknufyqiwnaf.supabase.co
- **Novo Projeto**: https://mxutidghlefnvjgskbbu.supabase.co

## 📋 Conteúdo da Migração

### Tipos de Dados (ENUMs)
- `platform_type` (meta, google, tiktok)
- `campaign_status_type` (active, paused, ended)
- `alert_severity_type` (danger, warning, success, info)
- `team_role_type` (admin, editor, viewer)
- `billing_plan_type` (starter, pro, agency)

### Tabelas
1. **profiles** - Perfis de usuários
2. **workspaces** - Espaços de trabalho
3. **workspace_members** - Membros dos espaços
4. **ad_accounts** - Contas de anúncios
5. **campaigns** - Campanhas de publicidade
6. **daily_metrics** - Métricas diárias
7. **creatives** - Criativos e assets
8. **creative_audits** - Auditorias de criativos
9. **alerts** - Alertas do sistema
10. **alert_rules** - Regras de alertas
11. **ai_chat_messages** - Mensagens do chat IA

### Funções e Triggers
- `handle_new_user()` - Cria perfil ao registrar novo usuário
- `seed_workspace_defaults()` - Inicializa regras de alerta padrão
- `update_updated_at_column()` - Atualiza timestamp automaticamente

### RLS (Row Level Security)
- Políticas para garantir segurança de dados
- Isolamento por workspace e usuário

## 🚀 Opção 1: SQL Editor do Supabase (Mais Fácil)

### Passo 1: Obtenha as Credenciais do Novo Projeto
1. Acesse [app.supabase.com](https://app.supabase.com)
2. Selecione o projeto `mxutidghlefnvjgskbbu`
3. Nota as credenciais:
   - **Project URL**: https://mxutidghlefnvjgskbbu.supabase.co
   - **Anon Public Key**: Salve para depois
   - **Service Role Key**: Salve para depois

### Passo 2: Execute o SQL
1. No Supabase Dashboard do novo projeto, vá para **SQL Editor**
2. Clique em **New query**
3. Copie todo o conteúdo do arquivo [supabase/migrations/20260321165728_f84749fb-30b6-41a2-a264-8c7a4f10fcdb.sql](../supabase/migrations/20260321165728_f84749fb-30b6-41a2-a264-8c7a4f10fcdb.sql)
4. Cole no SQL Editor do Supabase
5. Clique em **Run** ou pressione `Ctrl+Enter`

### Passo 3: Verifique a Estrutura
1. Vá para **Database** → **Tables**
2. Você deve ver 11 tabelas criadas:
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

## 🚀 Opção 2: CLI do Supabase (Automático)

Se você tem a CLI instalada e quer fazer push direto:

```bash
# 1. Fazer login
supabase login

# 2. Link o projeto novo
supabase link --project-ref mxutidghlefnvjgskbbu

# 3. Fazer push das migrations
supabase db push

# 4. Verificar status
supabase status
```

## 🚀 Opção 3: Usar Script Bash com curl

Se preferir usar curl direto (requer credenciais de API):

```bash
#!/bin/bash

# Credenciais (substitua pelas suas)
NEW_PROJECT_URL="https://mxutidghlefnvjgskbbu.supabase.co"
SERVICE_ROLE_KEY="seu_service_role_key_aqui"

# Arquivo SQL
SQL_FILE="supabase/migrations/20260321165728_f84749fb-30b6-41a2-a264-8c7a4f10fcdb.sql"

# Ler arquivo SQL
SQL_CONTENT=$(cat $SQL_FILE)

# Executar SQL via API
curl -X POST \
  "${NEW_PROJECT_URL}/rest/v1/rpc/exec_sql" \
  -H "Authorization: Bearer ${SERVICE_ROLE_KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"sql\": \"$(echo "$SQL_CONTENT" | jq -Rs .)\"}"
```

## 🔄 Passo 4: Atualize as Credenciais do Projeto

Após a migração, atualize o arquivo `.env`:

```env
VITE_SUPABASE_PROJECT_ID="mxutidghlefnvjgskbbu"
VITE_SUPABASE_URL="https://mxutidghlefnvjgskbbu.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="seu_anon_key_aqui"
```

## 📊 Passo 5: Verifique a Aplicação

1. Reinicie o servidor de desenvolvimento:
   ```bash
   bun run dev
   ```

2. Teste o login em http://localhost:5173/login

3. Verifique se você consegue:
   - ✅ Fazer signup
   - ✅ Acessar o dashboard
   - ✅ Visualizar workspaces

## ⚠️ Notas Importantes

### Segurança
- **Nunca** compartilhe a Service Role Key
- Use Anon Key apenas no frontend
- Service Role Key deve ser mantida em secreto no backend

### Dados Existentes
- Esta migração cria apenas **estrutura** (tabelas, funções, políticas)
- Dados existentes no projeto antigo **NÃO** serão copiados automaticamente
- Se precisar copiar dados, será necessário fazer backup e restore

### RLS (Row Level Security)
- Todas as tabelas têm RLS habilitada
- Sem RLS, qualquer usuário autenticado poderia acessar todos os dados
- Com RLS, os usuários só veem seus próprios dados ou dados de seus workspaces

## 🆘 Troubleshooting

### Erro: "Cannot create extension"
Significa que você não tem permissões de admin. Verifique se está usando uma conta de admin no Supabase.

### Erro: "Relation already exists"
As tabelas já foram criadas. Isso é seguro porque temos `IF NOT EXISTS` no SQL.

### Erro: "policy already exists"
As políticas já foram criadas. Ignorar é seguro.

## 📞 Precisa de Ajuda?

1. Verifique o Supabase Dashboard → **Logs** para mensagens de erro específicas
2. Confirme que tem as credenciais corretas
3. Tente executar em partes pequenas se houver erros

## ✅ Checklist de Pós-Migração

- [ ] SQL executado sem erros no Supabase Dashboard
- [ ] 11 tabelas criadas visíveis em Database → Tables
- [ ] Arquivo `.env` atualizado com credenciais do novo projeto
- [ ] Bun serve dev rodando sem erros
- [ ] Teste de login funcionando
- [ ] Teste de criação de workspace funcionando
- [ ] Dados aparecem no Supabase SQL Editor

---

**Próximo passo**: Após completar a migração, você pode deletar o projeto antigo ou mantê-lo como backup.
