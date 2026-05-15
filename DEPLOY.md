# 🚀 Guia de Deploy — LinkedIn Job Finder v4

Este documento descreve como colocar sua aplicação no ar seguindo a arquitetura Full Stack.

## 📡 Backend (DirectAdmin / VPS)

### Requisitos
- Node.js 18+ instalado no servidor.
- Acesso SSH ou painel "Setup Node.js App" no DirectAdmin.

### Passos
1. **Transferência:** Suba o conteúdo da pasta `backend/` para o servidor.
2. **Dependências:** Execute `npm install` na pasta raiz do backend.
3. **Variáveis de Ambiente:** Crie um arquivo `.env` no servidor com:
   ```env
   NODE_ENV=production
   PORT=3001
   GROQ_API_KEY=sua_chave_real_aqui
   ALLOWED_ORIGIN=https://seu-app-na-vercel.vercel.app
   LLM_MODEL=llama-3.3-70b-versatile
   ```
4. **Process Manager (PM2):** Para garantir que a API não caia:
   ```bash
   npm install -g pm2
   pm2 start src/server.js --name linkedin-api
   pm2 save
   pm2 startup
   ```

## 🎨 Frontend (Vercel)

### Passos
1. **Importação:** No painel da Vercel, conecte seu GitHub e selecione o repositório.
2. **Configuração de Pasta:** Defina o `Root Directory` como `frontend`.
3. **Variáveis de Ambiente:** Adicione no painel da Vercel:
   - `NEXT_PUBLIC_API_URL`: `https://sua-api-no-directadmin.com`
4. **Deploy:** A Vercel detectará o Next.js automaticamente e fará o build.

## ⚠️ Observações Importantes

### 🔒 CORS
Se o frontend não conseguir falar com o backend, verifique o `ALLOWED_ORIGIN` no backend. Ele deve ser IDENTICO à URL que a Vercel gerou para você.

### 📁 Persistência (JSON)
Como estamos usando arquivos JSON para histórico e presets, se você subir para um ambiente "Serverless" (como AWS Lambda), os dados serão resetados a cada novo deploy. No DirectAdmin/VPS, como o sistema de arquivos é persistente, eles funcionarão normalmente.

### 🌐 Domínios
- Recomendado: `api.seu-dominio.com` para o backend.
- Recomendado: `app.seu-dominio.com` ou o domínio da Vercel para o frontend.
