# Multi-stage build para otimizar o tamanho da imagem
FROM node:18-alpine AS builder

WORKDIR /app

# Copiar arquivos de dependências do workspace
COPY package*.json ./
COPY nx.json ./
COPY tsconfig*.json ./
COPY prisma/ ./prisma/

# Instalar todas as dependências
RUN npm ci --ignore-scripts

# Copiar código fonte
COPY apps/ ./apps/
COPY packages/ ./packages/

# Gerar Prisma Client
RUN npx prisma generate

# Build da aplicação usando Nx
RUN npx nx build auth-service

# Imagem de produção
FROM node:18-alpine AS production

WORKDIR /app

# Copiar dependências e build da etapa anterior
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/apps/auth-service/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/package*.json ./

# Comando para iniciar a aplicação
CMD ["node", "dist/main.js"]