#!/bin/bash
set -e

# ============================================================================
# Script de Migração do Supabase
# Migra toda a estrutura do BD para um novo projeto Supabase
# ============================================================================

echo "🚀 MIGRAÇÃO DO BANCO DE DADOS SUPABASE"
echo "======================================="
echo ""

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Verificar se Supabase CLI está instalada
echo -e "${BLUE}1️⃣ Verificando Supabase CLI...${NC}"

if ! command -v supabase &> /dev/null; then
    echo -e "${YELLOW}⚠️  Supabase CLI não encontrada globalmente${NC}"
    echo "Tentando usar via npx..."
    SUPABASE_CMD="npx supabase"
else
    SUPABASE_CMD="supabase"
fi

echo -e "${GREEN}   ✅ CLI encontrada${NC}"
echo ""

# Step 2: Obter credenciais
echo -e "${BLUE}2️⃣ Coletando credenciais...${NC}"

read -p "🔗 URL do novo projeto (ex: https://mxutidghlefnvjgskbbu.supabase.co): " PROJECT_URL
read -p "🔑 Project Reference ID (ex: mxutidghlefnvjgskbbu): " PROJECT_REF
read -sp "🔐 Access Token (será digitado sem feedback): " SUPABASE_TOKEN

echo -e "\n${GREEN}   ✅ Credenciais coletadas${NC}"
echo ""

# Step 3: Login
echo -e "${BLUE}3️⃣ Fazendo login no Supabase...${NC}"

export SUPABASE_ACCESS_TOKEN=$SUPABASE_TOKEN

if $SUPABASE_CMD login --no-prompt &> /dev/null; then
    echo -e "${GREEN}   ✅ Login realizado${NC}"
else
    echo -e "${RED}   ❌ Falha ao fazer login${NC}"
    exit 1
fi
echo ""

# Step 4: Link o projeto
echo -e "${BLUE}4️⃣ Linkando projeto...${NC}"

if $SUPABASE_CMD link --project-ref $PROJECT_REF &> /dev/null; then
    echo -e "${GREEN}   ✅ Projeto linkado${NC}"
else
    echo -e "${YELLOW}   ⚠️  Projeto pode já estar linkado (continuando...)${NC}"
fi
echo ""

# Step 5: Fazer push das migrations
echo -e "${BLUE}5️⃣ Executando migrations...${NC}"

if $SUPABASE_CMD db push; then
    echo -e "${GREEN}   ✅ Migrations executadas com sucesso${NC}"
else
    echo -e "${RED}   ❌ Erro ao executar migrations${NC}"
    exit 1
fi
echo ""

# Step 6: Verificar status
echo -e "${BLUE}6️⃣ Verificando status...${NC}"

$SUPABASE_CMD status

echo ""
echo -e "${GREEN}✅ MIGRAÇÃO CONCLUÍDA COM SUCESSO!${NC}"
echo ""
echo -e "${BLUE}📝 Próximos passos:${NC}"
echo "1. Atualize o arquivo .env com as credenciais do novo projeto:"
echo ""
echo -e "${YELLOW}VITE_SUPABASE_PROJECT_ID=\"${PROJECT_REF}\"${NC}"
echo -e "${YELLOW}VITE_SUPABASE_URL=\"${PROJECT_URL}\"${NC}"
echo -e "${YELLOW}VITE_SUPABASE_PUBLISHABLE_KEY=\"seu_anon_key_aqui\"${NC}"
echo ""
echo "2. Reinicie o servidor:"
echo -e "${YELLOW}bun run dev${NC}"
echo ""
echo "3. Teste o login em http://localhost:5173/login"
echo ""

unset SUPABASE_ACCESS_TOKEN
