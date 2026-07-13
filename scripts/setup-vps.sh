#!/bin/bash
# ==============================================================================
# 🚀 LINKEDIN JOB FINDER v4 - AUTO VPS SETUP & DEPLOY HELPER
# ==============================================================================
# Este script prepara um servidor Ubuntu/Debian recém-criado para rodar
# o frontend (Next.js), o backend (Express API) e um banco Postgres local.
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
echo -e "${BLUE}        🚀 LINKEDIN JOB FINDER v4 — INSTALADOR VPS${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}Este script deve ser executado como ROOT no servidor VPS (Ubuntu/Debian).${NC}\n"

# 1. Verificar se é root
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}❌ Por favor, execute este script como root (sudo ./setup-vps.sh)${NC}"
  exit 1
fi

# 2. Atualização de Pacotes
echo -e "\n${CYAN}🔄 Passo 1: Atualizando repositórios e pacotes do sistema...${NC}"
apt update && apt upgrade -y
apt install -y curl git build-essential ufw openssl

# 3. Instalar Node.js LTS
echo -e "\n${CYAN}📦 Passo 2: Instalando Node.js (LTS)...${NC}"
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
echo -e "${GREEN}✅ Node.js $(node -v) e NPM $(npm -v) instalados!${NC}"

# 4. Instalar PM2 globalmente
echo -e "\n${CYAN}⚙️ Passo 3: Instalando PM2 (Gerenciador de Processos)...${NC}"
npm install -g pm2
echo -e "${GREEN}✅ PM2 instalado com sucesso!${NC}"

# 5. Instalar Nginx e Certbot (para SSL)
echo -e "\n${CYAN}🌐 Passo 4: Instalando Nginx e Certbot (SSL Let's Encrypt)...${NC}"
apt install -y nginx certbot python3-certbot-nginx
echo -e "${GREEN}✅ Nginx e Certbot instalados!${NC}"

# 6. Instalar e configurar PostgreSQL local
echo -e "\n${CYAN}🐘 Passo 5: Instalando e configurando PostgreSQL local...${NC}"
apt install -y postgresql postgresql-contrib

# Iniciar e habilitar o Postgres
systemctl start postgresql
systemctl enable postgresql

# Gerar credenciais do banco
DB_NAME="linkedin_job_finder"
DB_USER="jobfinder_user"
DB_PASS=$(openssl rand -hex 16) # Senha forte de 32 caracteres

echo -e "${YELLOW}CRIANDO BANCO DE DADOS E USUÁRIO NO POSTGRESQL...${NC}"
# Executa os comandos SQL como o usuário postgres
sudo -u postgres psql -c "CREATE DATABASE $DB_NAME;"
sudo -u postgres psql -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASS';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"
sudo -u postgres psql -d $DB_NAME -c "GRANT ALL ON SCHEMA public TO $DB_USER;"

echo -e "${GREEN}✅ PostgreSQL instalado e banco '$DB_NAME' criado com sucesso!${NC}"

# 7. Configurar Firewall UFW (Segurança Básica)
echo -e "\n${CYAN}🛡️ Passo 6: Configurando Firewall (UFW)...${NC}"
ufw allow OpenSSH
ufw allow 'Nginx Full'
# ufw --force enable # Removido para não desconectar acidentalmente o usuário, mas recomendado no guia.
echo -e "${GREEN}✅ Portas do Nginx e SSH liberadas no firewall!${NC}"

# 8. Criar template de configuração do Nginx
echo -e "\n${CYAN}📄 Passo 7: Gerando templates de configuração do Nginx...${NC}"

cat << 'EOF' > ./nginx-vps-template.conf
# ==============================================================================
# CONFIGURAÇÃO DO NGINX PARA LINKEDIN JOB FINDER
# Substitua 'seu-app.com' e 'api.seu-app.com' pelos seus domínios reais.
# ==============================================================================

# 1. Configuração do Frontend (Next.js) - Porta 3000
server {
    listen 80;
    server_name seu-app.com; # <-- Coloque o domínio do seu Frontend aqui

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# 2. Configuração do Backend (Express API) - Porta 3001
server {
    listen 80;
    server_name api.seu-app.com; # <-- Coloque o subdomínio da sua API aqui

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

echo -e "${GREEN}✅ Template de Nginx gerado localmente em: ./nginx-vps-template.conf${NC}"

# 9. Gerar URL de conexão final do Postgres
DATABASE_URL="postgresql://$DB_USER:$DB_PASS@localhost:5432/$DB_NAME"

echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🎉 VPS PREPARADA COM SUCESSO E POSTGRES CONFIGURADO!${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}🔑 SUA URL DE CONEXÃO DO BANCO DE DADOS LOCAL:${NC}"
echo -e "${MAGENTA}DATABASE_URL=$DATABASE_URL${NC}"
echo -e "${CYAN}(Guarde essa URL! Você usará ela no arquivo .env do backend)${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}Próximos passos manuais no servidor:${NC}"
echo -e "1. Clone o seu repositório Git na VPS (ex: /var/www/linkedin-job-finder)"
echo -e "2. Configure os arquivos ${MAGENTA}.env${NC} no backend e no frontend."
echo -e "   -> No backend, cole a linha: ${CYAN}DATABASE_URL=$DATABASE_URL${NC}"
echo -e "   -> As variáveis ${CYAN}SUPABASE_URL${NC} e ${CYAN}SUPABASE_SERVICE_ROLE_KEY${NC} não são mais necessárias!"
echo -e "3. Instale as dependências executando ${CYAN}npm install${NC} na raiz e nas subpastas."
echo -e "4. Execute as migrações para criar as tabelas no seu Postgres local:"
echo -e "   ${CYAN}cd backend && node scripts/setup-db.js${NC}"
echo -e "5. Copie o template do Nginx gerado para ${MAGENTA}/etc/nginx/sites-available/linkedin-job-finder${NC}"
echo -e "6. Altere os domínios no arquivo de configuração do Nginx."
echo -e "7. Crie o link simbólico:"
echo -e "   ${CYAN}ln -s /etc/nginx/sites-available/linkedin-job-finder /etc/nginx/sites-enabled/${NC}"
echo -e "8. Remova a configuração default do Nginx:"
echo -e "   ${CYAN}rm /etc/nginx/sites-enabled/default${NC}"
echo -e "9. Teste e reinicie o Nginx:"
echo -e "   ${CYAN}nginx -t && systemctl restart nginx${NC}"
echo -e "10. Gere o SSL grátis com o Certbot:"
echo -e "   ${CYAN}certbot --nginx -d seu-app.com -d api.seu-app.com${NC}"
echo -e "11. Execute o build do Next e inicie tudo com PM2 na pasta raiz:"
echo -e "    ${CYAN}cd /var/www/linkedin-job-finder && cd frontend && npm run build && cd .. && pm2 start ecosystem.config.cjs${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
