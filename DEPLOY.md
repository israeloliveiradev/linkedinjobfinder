# 🚀 Guia de Deploy VPS — LinkedIn Job Finder v4 (Sem Supabase)

Este guia orienta no processo de deployment da aplicação Full Stack (Frontend Next.js e Backend Express) em uma **VPS própria** (Ubuntu/Debian) usando um banco de dados **PostgreSQL rodando localmente na própria VPS**. 

Você pode escolher entre duas formas de deployment:
* **Opção A (Recomendada):** Docker Compose (Tudo roda isolado em containers).
* **Opção B:** PM2 + Postgres nativo (Instalado diretamente no sistema operacional da VPS).

---

## 🏗️ Arquitetura de Produção

```mermaid
graph TD
    User([Usuário]) -->|https://app.seu-dominio.com| Nginx{Nginx Proxy}
    User -->|https://api.seu-dominio.com| Nginx
    Nginx -->|Porta 3000| NextJS[Frontend Next.js]
    Nginx -->|Porta 3001| Express[Backend Express API]
    Express -->|Porta 5432| Postgres[(PostgreSQL)]
```

---

## 📡 1. Configuração de DNS (Domínio)

Antes de iniciar na VPS, configure os apontamentos DNS no painel do seu domínio (ex: Cloudflare, Registro.br):

| Tipo | Nome | Conteúdo (Valor) | Descrição |
| :--- | :--- | :--- | :--- |
| **A** | `app` | `IP_DA_SUA_VPS` | Subdomínio para o Frontend Next.js |
| **A** | `api` | `IP_DA_SUA_VPS` | Subdomínio para a API Backend |

---

## 🐳 Opção A: Deploy com Docker Compose (Recomendado)

O Docker empacota o Frontend, Backend e o Banco PostgreSQL em containers isolados, simplificando o build e evitando conflitos de versão do Node ou Postgres.

### 1. Preparação da VPS com Docker
1. Conecte-se à sua VPS via SSH:
   ```bash
   ssh root@IP_DA_SUA_VPS
   ```
2. Clone o repositório na VPS:
   ```bash
   git clone <URL_DO_SEU_REPOSITORIO> /var/www/linkedin-job-finder
   cd /var/www/linkedin-job-finder
   ```
3. Execute o instalador automático do Docker:
   ```bash
   chmod +x scripts/setup-docker.sh
   sudo ./scripts/setup-docker.sh
   ```
   *Guarde a senha forte do Postgres gerada no final da execução.*

### 2. Configurar as Variáveis de Ambiente (`.env`)
* Crie o arquivo `backend/.env` e configure conforme abaixo:
  ```env
  DB_USER=jobfinder_user
  DB_PASS=SENHA_GERADA_NO_PASSO_ANTERIOR
  DB_NAME=linkedin_job_finder
  
  NODE_ENV=production
  PORT=3001
  ALLOWED_ORIGIN=https://app.seu-dominio.com
  GROQ_API_KEY=sua_chave_groq
  GEMINI_API_KEY=sua_chave_gemini
  LLM_MODEL=llama-3.3-70b-versatile
  GEMINI_MODEL=gemini-2.5-flash
  BETTER_AUTH_SECRET=uma_chave_jwt_secreta_e_longa
  BETTER_AUTH_URL=https://api.seu-dominio.com
  ADMIN_EMAIL=seu-email@gmail.com
  ```
* Crie o arquivo `frontend/.env.local` informando a URL de produção da API:
  ```env
  NEXT_PUBLIC_API_URL=https://api.seu-dominio.com
  NEXT_PUBLIC_APP_NAME="LinkedIn Job Finder v4"
  NEXT_PUBLIC_GA_ID=G-F5MTXPCGFB
  ```

### 3. Iniciar a Aplicação
Suba a stack inteira. O Docker executará o PostgreSQL, rodará as migrações/criação de tabelas, fará o build do Next.js e iniciará a API:
```bash
# Define o build argument para injetar a URL no bundle estático do Next
export NEXT_PUBLIC_API_URL=https://api.seu-dominio.com

# Inicializa
docker compose up -d --build
```

---

## ⚡ Opção B: Deploy Tradicional com PM2 + PostgreSQL Nativo

Caso prefira não usar Docker, você pode rodar os processos na própria máquina com PM2.

### 1. Preparação da VPS
1. Execute o script de setup nativo para instalar o Node, PM2, Postgres local, Nginx e Certbot:
   ```bash
   chmod +x scripts/setup-vps.sh
   sudo ./scripts/setup-vps.sh
   ```
   *Guarde a URL `DATABASE_URL` gerada no final da execução.*

### 2. Configurar as Variáveis de Ambiente (`.env`)
* Crie o arquivo `backend/.env`:
  ```env
  NODE_ENV=production
  PORT=3001
  ALLOWED_ORIGIN=https://app.seu-dominio.com
  DATABASE_URL=postgresql://jobfinder_user:SUA_SENHA_FORTE@localhost:5432/linkedin_job_finder
  
  GROQ_API_KEY=sua_chave_groq
  GEMINI_API_KEY=sua_chave_gemini
  LLM_MODEL=llama-3.3-70b-versatile
  GEMINI_MODEL=gemini-2.5-flash
  BETTER_AUTH_SECRET=uma_chave_secreta_aqui
  BETTER_AUTH_URL=https://api.seu-dominio.com
  ADMIN_EMAIL=seu-email@gmail.com
  ```
* Crie o arquivo `frontend/.env.local`:
  ```env
  NEXT_PUBLIC_API_URL=https://api.seu-dominio.com
  NEXT_PUBLIC_APP_NAME="LinkedIn Job Finder v4"
  NEXT_PUBLIC_GA_ID=G-F5MTXPCGFB
  ```

### 3. Build & PM2
1. Instale todas as dependências e gere as tabelas locais:
   ```bash
   npm install && cd backend && npm install && node scripts/setup-db.js
   cd ../frontend && npm install && npm run build
   ```
2. Inicie ambos os serviços em segundo plano:
   ```bash
   cd /var/www/linkedin-job-finder
   pm2 start ecosystem.config.cjs
   pm2 save
   pm2 startup
   ```

---

## 🏛️ 5. Configurar Nginx e SSL (Necessário para ambas opções)

Tanto o Docker quanto o PM2 expõem a aplicação localmente nas portas `3000` (Frontend) e `3001` (Backend). O Nginx redirecionará o tráfego público do seu domínio para as portas certas com SSL.

1. Crie a configuração do Nginx:
   ```bash
   sudo nano /etc/nginx/sites-available/linkedin-job-finder
   ```
2. Adicione a configuração abaixo substituindo pelos seus domínios reais:
   ```nginx
   # Frontend Next.js (Porta 3000)
   server {
       listen 80;
       server_name app.seu-dominio.com;

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

   # Backend Express API (Porta 3001)
   server {
       listen 80;
       server_name api.seu-dominio.com;

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
   ```
3. Ative a configuração e desative o site padrão do Nginx:
   ```bash
   sudo ln -s /etc/nginx/sites-available/linkedin-job-finder /etc/nginx/sites-enabled/
   sudo rm /etc/nginx/sites-enabled/default
   sudo nginx -t && sudo systemctl restart nginx
   ```
4. Adicione criptografia SSL (HTTPS) com o Certbot:
   ```bash
   sudo certbot --nginx -d app.seu-dominio.com -d api.seu-dominio.com
   ```

---

## 🔍 6. Comandos Úteis de Monitoramento

### Se escolheu Docker (Opção A):
* **Ver logs em tempo real:** `docker compose logs -f`
* **Ver status dos containers:** `docker compose ps`
* **Parar a aplicação:** `docker compose down`
* **Reiniciar tudo:** `docker compose restart`

### Se escolheu PM2 (Opção B):
* **Ver logs:** `pm2 logs`
* **Ver status:** `pm2 status`
* **Testar conexão de banco:** `cd backend && node scripts/check-db.js`
* **Reiniciar:** `pm2 restart ecosystem.config.cjs`


