# Configuração do Facebook OAuth no VisionAds

## 🔧 Configuração no Supabase

Para habilitar o Facebook OAuth no seu projeto, siga estes passos:

### 1. Acesse o Supabase Dashboard
- Vá para https://app.supabase.com
- Selecione seu projeto
- Navigate em **Authentication** > **Providers**

### 2. Habilite o Facebook OAuth
- Procure por **Facebook** na lista de providers
- Clique para habilitar
- Copie o **Redirect URL** fornecido (você precisa disso no Facebook Developers)

### 3. Configure no Facebook Developers

1. Acesse https://developers.facebook.com/
2. Crie um novo app ou use um existente
3. Vá para **Settings** > **Basic** e anote:
   - App ID
   - App Secret

4. Em **Settings** > **Basic**, procure por **App Domains** e adicione:
   ```
   localhost:5173
   seu-dominio-producao.com
   ```

5. Em **Products**, adicione **Facebook Login**

6. Em **Facebook Login** > **Settings**:
   - Valid OAuth Redirect URIs: Cole a URL do Supabase
   - Exemplo: `https://seu-projeto.supabase.co/auth/v1/callback?provider=facebook`

7. Vá para **Roles** > **Roles** e dê os seguintes permissões ao seu app:
   ```
   emails
   catalog_management
   threads_business_basic
   pages_show_list
   ads_management
   ads_read
   business_management
   leads_retrieval
   pages_read_engagement
   pages_manage_metadata
   pages_manage_ads
   public_profile
   ```

### 4. Configure no Supabase Dashboard
- Cole seu **Facebook App ID** no campo `Facebook Client ID`
- Cole seu **App Secret** no campo `Facebook Client Secret`
- Salve as mudanças

## 📱 Páginas Implementadas

### 1. **Permissões** (`/facebook/permissions`)
- Exibe todos os escopos solicitados
- Mostra quais foram concedidos e quais estão pendentes
- Permite solicitar escopos adicionais
- Resumo do progresso de autorização

**Escopos usado:**
- `email`
- `public_profile`
- `catalog_management`
- `threads_business_basic`
- `pages_show_list`
- `ads_management`
- `ads_read`
- `business_management`
- `leads_retrieval`
- `pages_read_engagement`
- `pages_manage_metadata`
- `pages_manage_ads`

### 2. **Anúncios Meta** (`/facebook/ads`)
- Exibe todas as contas de anúncios
- Lista campanh de anúncios com métricas:
  - Gasto
  - Impressões
  - Cliques
  - CTR (Click-Through Rate)
  - Status de ativação

**Escopos necessários:**
- `ads_management`
- `ads_read`

### 3. **Catálogos** (`/facebook/catalogs`)
- Mostra todos os catálogos de produtos
- Lista produtos com imagens e preços
- Categoria, estoque e links
- Contagem de produtos por catálogo

**Escopos necessários:**
- `catalog_management`

### 4. **Páginas** (`/facebook/pages`)
- Gerencia suas páginas do Facebook
- Mostra contadores de fãs e seguidores
- Permite editar informações
- Acesso a tokens de página

**Escopos necessários:**
- `pages_show_list`
- `pages_manage_metadata`

### 5. **Leads** (`/facebook/leads`)
- Visualiza leads capturados via formulários
- Mostra dados dos formulários
- Data de criação do lead
- Informações preenchidas

**Escopos necessários:**
- `leads_retrieval`

### 6. **Engajamento** (`/facebook/engagement`)
- Métricas de engajamento das páginas:
  - Curtidas
  - Comentários
  - Compartilhamentos
  - Visualizações
  - Dados por período

**Escopos necessários:**
- `pages_read_engagement`

### 7. **Threads** (`/facebook/threads`)
- Gerencia conversas no Threads for Business
- Lista de threads com participantes
- Data da última atualização
- Informações de assunto

**Escopos necessários:**
- `threads_business_basic`

### 8. **Anúncios de Páginas** (`/facebook/page-ads`)
- Crie e gerencie anúncios para suas páginas
- Ferramenta com guia passo-a-passo
- Seleção de páginas
- Escolha de objetivos e públicos

**Escopos necessários:**
- `pages_manage_ads`

## 🔐 Segurança

- Todos os tokens são armazenados de form a segura no Supabase
- O `provider_token` é obtido da sessão autenticada
- As chamadas à Facebook Graph API usam HTTPS
- Verificação de escopos antes de acessar funcionalidades

## 🚀 Próximas Implementações

- [ ] Criar anúncios via API
- [ ] Editor de anúncios em tempo real
- [ ] Agendamento de publicações
- [ ] Análises detalhadas com gráficos
- [ ] Integração com Google Ads
- [ ] Dashboard unificado de múltiplas contas
- [ ] Relatórios automáticos via e-mail

## 📚 Referências

- [Facebook Graph API Documentation](https://developers.facebook.com/docs/graph-api)
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Facebook Login Documentation](https://developers.facebook.com/docs/facebook-login)
