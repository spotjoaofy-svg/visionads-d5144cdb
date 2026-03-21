# ⚡ Configuração Rápida do Facebook OAuth

## 🎯 Objetivo
Aplicar suas credenciais do Facebook OAuth (App ID e Secret) no Supabase em 2 minutos.

---

## 📱 Suas Credenciais

| Campo | Valor |
|-------|-------|
| **App ID** | 773214428548471 |
| **App Secret** | cef279e2788b354f8fca7be6774b7e40 |
| **Projeto** | mxutidghlefnvjgskbbu |

---

## 🚀 Método 1: Script Automático (Recomendado)

### Step 1: Obter Service Role Key (1 min)

1. Acesse [app.supabase.com](https://app.supabase.com)
2. Selecione projeto **mxutidghlefnvjgskbbu**
3. Vá até **Settings** → **API**
4. Procure por **service_role** (com label "secret")
5. Clique no ícone 👁️ para revelar
6. Clique no ícone 📋 para copiar

### Step 2: Executar Script (1 min)

```bash
chmod +x setup_facebook_oauth.sh
./setup_facebook_oauth.sh
```

Então cole a **Service Role Key** que copiou e aguarde ✨

**Pronto!** Seu Facebook OAuth está configurado! 🎉

---

## 🔧 Método 2: Manual no Dashboard (5 min)

Se o script não funcionar, siga estes passos:

1. Acesse [app.supabase.com](https://app.supabase.com)
2. Selecione **mxutidghlefnvjgskbbu**
3. **Authentication** → **Providers**
4. Procure por **Facebook**
5. Clique no card para expandir
6. Clique em **Enable**
7. Preencha:
   - **Client ID**: 773214428548471
   - **Client Secret**: cef279e2788b354f8fca7be6774b7e40
8. Clique **Save**

---

## ✅ Próxima Etapa

Depois de configurar (qualquer método):

### Configure a Redirect URI no Facebook Developers

1. Vá para [developers.facebook.com](https://developers.facebook.com)
2. Acesse seu app (773214428548471)
3. **Products** → **Facebook Login** → **Settings**
4. Cola esta URL em "Valid OAuth Redirect URIs":
   ```
   https://mxutidghlefnvjgskbbu.supabase.co/auth/v1/callback?provider=facebook
   ```
5. **Save Changes**

### Teste!

```bash
bun run dev
```

Vá para http://localhost:5173/login e clique em **Entrar com Facebook** 🚀

---

## 🆘 Se der erro

| Erro | Solução |
|------|---------|
| "invalid_client" | Service Role Key incorreta - copie novamente |
| "401 Unauthorized" | Credenciais inválidas no Supabase |
| "Connection refused" | Verifique sua conexão com internet |
| Script não encontrado | Execute: `chmod +x setup_facebook_oauth.sh` |

---

## 📖 Documentação Completa

- **FACEBOOK_CONFIG.md** - Guia detalhado com troubleshooting
- **FACEBOOK_SETUP.md** - Primeiras orientações
- **setup_facebook_oauth.sh** - Script automático
- **config_facebook_oauth.py** - Script Python (alternativa)

---

**Comece agora!** Execute: `./setup_facebook_oauth.sh` 🚀
