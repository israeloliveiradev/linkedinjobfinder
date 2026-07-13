FROM node:20-alpine

WORKDIR /app

# Instala as dependências primeiro para aproveitar o cache do Docker
COPY package*.json ./
RUN npm ci --only=production

# Copia o restante do código
COPY . .

# Expõe a porta que o Express escuta
EXPOSE 3001

# Variáveis padrão
ENV PORT=3001
ENV NODE_ENV=production

# Inicia a API
CMD ["npm", "start"]
