# 🔐 Configuração do Facebook OAuth no Supabase

## 📱 Suas Credenciais Meta

| Campo | Valor |
|-------|-------|
| **App ID** | 773214428548471 |
| **App Secret** | cef279e2788b354f8fca7be6774b7e40 |
| **Projeto Supabase** | mxutidghlefnvjgskbbu |
| **URL do Projeto** | https://mxutidghlefnvjgskbbu.supabase.co |

---

## 🚀 Configurar no Supabase Dashboard

### Passo 1: Acessar Supabase
1. Vá para [app.supabase.com](https://app.supabase.com)
2. Selecione o projeto **mxutidghlefnvjgskbbu**
3. No menu lateral, clique em **Authentication** → **Providers**

### Passo 2: Habilitar Facebook Provider
1. Procure por **Facebook** na lista de provedores
2. Clique no ícone/card do Facebook
3. Você verá a opção para habilitar - clique em **Enable**

### Passo 3: Inserir as Credenciais
1. Copie e cole as credenciais nos campos correspondentes:
   
   **Campo: Facebook Client ID (App ID)**
   ```
   773214428548471
   ```
   
   **Campo: Facebook Client Secret (App Secret)**
   ```
   cef279e2788b354f8fca7be6774b7e40
   ```

2. **Copie a Redirect URL fornecida pelo Supabase** (parecida com):
   ```
   https://mxutidghlefnvjgskbbu.supabase.co/auth/v1/callback?provider=facebook
   ```

3. Clique em **Save**

---

## 🔗 Configurar no Facebook Developers

### Passo 1: Acessar App
1. Vá para [developers.facebook.com](https://developers.facebook.com)
2. Faça login com sua conta Meta
3. Acesse **My Apps** → selecione seu app (773214428548471)

### Passo 2: Configurar App Domains
1. Vá para **Settings** → **Basic**
2. Procure por **App Domains**
3. Adicione os seguintes domínios:
   ```
   localhost:5173
   localhost:3000
   mxutidghlefnvjgskbbu.supabase.co
   your-production-domain.com (quando tiver)
   ```

### Passo 3: Configurar Facebook Login
1. Em **Products**, procure por **Facebook Login** (deve estar adicionado)
2. Clique em **Set Up**
3. Vá para **Settings**
4. Em **Valid OAuth Redirect URIs**, adicione:
   ```
   https://mxutidghlefnvjgskbbu.supabase.co/auth/v1/callback?provider=facebook
   ```
5. Clique em **Save Changes**

### Passo 4: Verificar Configurações de App
1. Vá para **Settings** → **Basic**
2. Confirme que:
   - ✅ App ID: 773214428548471
   - ✅ App Secret: cef279e2788b354f8fca7be6774b7e40
   - ✅ App Status: Em Desenvolvimento ou Ativo

---

## 🧪 Testar o Facebook Login

### Passo 1: Iniciar o servidor
```bash
bun run dev
```

### Passo 2: Testar na página de login
1. Abra http://localhost:5173/login
2. Clique em **Entrar com Facebook**
3. Você será redirecionado para o Facebook para autorizar
4. Após autorizar, voltará ao VisionAds
5. Você terá acesso a todas as 8 pages do Facebook:
   - ✅ /facebook/permissions
   - ✅ /facebook/ads
   - ✅ /facebook/catalogs
   - ✅ /facebook/pages
   - ✅ /facebook/leads
   - ✅ /facebook/engagement
   - ✅ /facebook/threads
   - ✅ /facebook/page-ads

---

## 🛡️ Checklist de Configuração

- [ ] Credenciais inseridas no Supabase
- [ ] Redirect URI copiada
- [ ] App Domains adicionados no Facebook
- [ ] Facebook Login iniciado no app
- [ ] Valid OAuth Redirect URIs configurados no Facebook
- [ ] App Status verificado
- [ ] Servidor rodando (bun run dev)
- [ ] Login com Facebook testado com sucesso
- [ ] 8 páginas Facebook acessíveis

---

## 🆘 Se algo der errado

### Erro: "invalid_client"
**Causa**: App ID ou Secret incorreto
**Solução**: Verifique as credenciais no Supabase e Facebook Developers

### Erro: "Redirect URI mismatch"
**Causa**: A Redirect URI não foi configurada corretamente
**Solução**: Compare exatamente com a URL que o Supabase forneceu (copie/cole, não digite)

### Erro: "Facebook login not enabled"
**Causa**: Facebook Login product não foi ativado
**Solução**: Vá para Facebook Developers → Products → adicione Facebook Login

### App mostra "In Development" mode
**Causa**: Normal em desenvolvimento
**Solução**: Em produção, mude para "Live" em Settings → Basic → App Status

---

## 📝 Variáveis de Ambiente (já configuradas)

Seu `.env` já está atualizado:
```bash
VITE_SUPABASE_PROJECT_ID="mxutidghlefnvjgskbbu"
VITE_SUPABASE_URL="https://mxutidghlefnvjgskbbu.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

O Supabase gerenciará as credenciais do Facebook internamente.

---

## 📊 O que você pode acessar com Facebook Login

Após configurar e fazer login com Facebook, o app terá acesso a:

| Feature | Página | Escopo Necessário |
|---------|--------|------------------|
| 📋 Gerenciar Permissões | `/facebook/permissions` | Qualquer escopo |
| 💰 Campanhas de Anúncios | `/facebook/ads` | ads_management, ads_read |
| 📦 Catálogos de Produtos | `/facebook/catalogs` | catalog_management |
| 📱 Gerenciar Páginas | `/facebook/pages` | pages_show_list, pages_manage_metadata |
| 📋 Leads Capturados | `/facebook/leads` | leads_retrieval |
| 👍 Engagement & Interactions | `/facebook/engagement` | pages_read_engagement |
| 💬 Threads for Business | `/facebook/threads` | threads_business_basic |
| 📺 Criar Anúncios | `/facebook/page-ads` | pages_manage_ads |

---

## ✅ Próximas Ações

1. ✅ **Credenciais geradas** ← Você fez isso
2. ⏳ **Configurar no Supabase** ← Faça agora (Passo 1 acima)
3. ⏳ **Configurar no Facebook Developers** ← Depois (Passo 2 acima)
4. ⏳ **Testar o login** ← Por último (Passo 3 acima)

---

## 🎉 Bom sorte!

Após completar todos os passos, seu VisionAds terá integração completa com Facebook! 🚀

**Dúvidas?** Verifique a documentação original em [FACEBOOK_SETUP.md](./FACEBOOK_SETUP.md)
