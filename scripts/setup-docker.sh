#!/bin/bash
# ==============================================================================
# 🐳 LINKEDIN JOB FINDER v4 - DOCKER VPS SETUP HELPER
# ==============================================================================
# Este script prepara um servidor Ubuntu/Debian instalando o Docker e o
# Docker Compose para rodar toda a aplicação em containers.
# ==============================================================================

# Cores para exibição de mensagens
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Limpar tela
clear

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}       🐳 LINKEDIN JOB FINDER v4 — INSTALADOR DOCKER VPS${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}Este script deve ser executado como ROOT no servidor VPS (Ubuntu/Debian).${NC}\n"

# 1. Verificar se é root
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}❌ Por favor, execute este script como root (sudo ./setup-docker.sh)${NC}"
  exit 1
fi

# 2. Atualização de Pacotes
echo -e "\n${CYAN}🔄 Passo 1: Atualizando repositórios e pacotes do sistema...${NC}"
apt update && apt upgrade -y
apt install -y curl git ufw nginx certbot python3-certbot-nginx

# 3. Instalar Docker
echo -e "\n${CYAN}🐳 Passo 2: Instalando Docker (Oficial)...${NC}"
curl -fsSL https://get.docker.com | sh

# Iniciar e habilitar Docker
systemctl start docker
systemctl enable docker

echo -e "${GREEN}✅ Docker $(docker --version) instalado!${NC}"

# 4. Instalar Docker Compose Plugin
echo -e "\n${CYAN}🐙 Passo 3: Instalando Docker Compose Plugin...${NC}"
apt install -y docker-compose-plugin
echo -e "${GREEN}✅ Docker Compose instalado! (${CYAN}docker compose version${NC})$"

# 5. Configurar Firewall UFW (Segurança Básica)
echo -e "\n${CYAN}🛡️ Passo 4: Configurando Firewall (UFW)...${NC}"
ufw allow OpenSSH
ufw allow 'Nginx Full'
# ufw --force enable # Removido para segurança básica
echo -e "${GREEN}✅ Portas do Nginx e SSH liberadas no firewall!${NC}"

# 6. Gerar senhas seguras para o banco de dados
DB_PASS=$(openssl rand -hex 16)
JWT_SECRET=$(openssl rand -hex 32)

echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🎉 VPS PREPARADA PARA DOCKER COM SUCESSO!${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}🔑 SENHA DO POSTGRESQL GERADA PARA O DOCKER:${NC}"
echo -e "${MAGENTA}Senha: $DB_PASS${NC}"
echo -e "${CYAN}(Esta senha já está pronta para uso no Docker)${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}Próximos passos manuais no servidor:${NC}"
echo -e "1. Configure as variáveis de ambiente no arquivo ${MAGENTA}backend/.env${NC}:"
echo -e "   Adicione/atualize as linhas:"
echo -e "   -> ${CYAN}DB_USER=jobfinder_user${NC}"
echo -e "   -> ${CYAN}DB_PASS=$DB_PASS${NC}"
echo -e "   -> ${CYAN}DB_NAME=linkedin_job_finder${NC}"
echo -e "   -> ${CYAN}BETTER_AUTH_SECRET=$JWT_SECRET${NC}"
echo -e ""
echo -e "2. Configure as variáveis de ambiente no arquivo ${MAGENTA}frontend/.env.local${NC}:"
echo -e "   -> ${CYAN}NEXT_PUBLIC_API_URL=https://api.seu-dominio.com${NC}"
echo -e ""
echo -e "3. Defina a variável ${CYAN}NEXT_PUBLIC_API_URL${NC} na sua máquina ou no terminal ao rodar o build"
echo -e "   para que ela seja passada para o Next.js:"
echo -e "   ${CYAN}export NEXT_PUBLIC_API_URL=https://api.seu-dominio.com${NC}"
echo -e ""
echo -e "4. Inicie o Docker Compose para subir todo o projeto (Banco + API + Web):"
echo -e "   ${CYAN}docker compose up -d --build${NC}"
echo -e ""
echo -e "5. Configure o Nginx e SSL conforme as instruções normais do ${MAGENTA}DEPLOY.md${NC}."
echo -e "   Como os containers expõem o backend na porta 3001 e o frontend na porta 3000,"
echo -e "   a mesma configuração do Nginx funciona perfeitamente!"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
