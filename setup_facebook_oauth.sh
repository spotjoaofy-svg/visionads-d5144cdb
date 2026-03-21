#!/bin/bash
set -e

# ============================================================================
# Script de Configuração do Facebook OAuth no Supabase
# ============================================================================

clear

echo "🚀 CONFIGURAÇÃO DO FACEBOOK OAUTH NO SUPABASE"
echo "=============================================="
echo ""

# Cores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Credenciais padrão (suas credenciais)
APP_ID="773214428548471"
APP_SECRET="cef279e2788b354f8fca7be6774b7e40"
PROJECT_URL="https://mxutidghlefnvjgskbbu.supabase.co"

echo -e "${BLUE}📋 Credenciais Detectadas:${NC}"
echo "   App ID: $APP_ID"
echo "   App Secret: ${APP_SECRET:0:10}..."
echo "   Projeto: $PROJECT_URL"
echo ""

# Step 1: Obter Service Role Key
echo -e "${BLUE}1️⃣  Obtendo Service Role Key...${NC}"
echo ""
echo "   Você precisa da Service Role Key do seu projeto Supabase"
echo "   Para obter:"
echo "   1. Acesse https://app.supabase.com"
echo "   2. Selecione projeto mxutidghlefnvjgskbbu"
echo "   3. Settings → API → Copie 'service_role secret'"
echo ""

read -sp "🔑 Cole a Service Role Key: " SERVICE_ROLE_KEY
echo ""

if [ -z "$SERVICE_ROLE_KEY" ]; then
    echo -e "${RED}❌ Service Role Key é obrigatória${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Service Role Key recebida${NC}"
echo ""

# Step 2: Executar Python script
echo -e "${BLUE}2️⃣  Configurando Facebook OAuth...${NC}"
echo ""

python3 config_facebook_oauth.py \
    --url "$PROJECT_URL" \
    --key "$SERVICE_ROLE_KEY" \
    --app-id "$APP_ID" \
    --app-secret "$APP_SECRET"

EXIT_CODE=$?

echo ""
echo "=============================================="

if [ $EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}✅ CONFIGURAÇÃO CONCLUÍDA COM SUCESSO${NC}"
    echo ""
    echo -e "${BLUE}📝 Próximos Passos:${NC}"
    echo "1. ✅ Supabase - CONFIGURADO"
    echo "2. ⏳ Facebook Developers - Configure a Redirect URI"
    echo "3. ⏳ Teste o login"
    echo ""
    echo "👉 Veja o arquivo FACEBOOK_CONFIG.md para instruções detalhadas"
else
    echo -e "${RED}❌ Erro na configuração${NC}"
    echo "Tente novamente ou configure manualmente:"
    echo "https://app.supabase.com → Authentication → Providers → Facebook"
fi

echo ""
