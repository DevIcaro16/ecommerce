# Multi-stage build para otimizar o tamanho da imagem
FROM node:18-alpine AS builder

WORKDIR /app

# Copiar arquivos de dependências do workspace
COPY package*.json ./
COPY nx.json ./
COPY tsconfig*.json ./

# Instalar todas as dependências
RUN npm ci

# Copiar código fonte
COPY apps/ ./apps/
COPY packages/ ./packages/

# Build da aplicação usando Nx
RUN npx nx build auth-service

# Imagem de produção
FROM node:18-alpine AS production

WORKDIR /app

# Criar usuário não-root
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Copiar dependências e build da etapa anterior
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/apps/auth-service/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/package*.json ./

# Expor porta
EXPOSE 3001

# Mudar para usuário não-root
USER nodejs

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node dist/health-check.js || exit 1

# Comando para iniciar a aplicação
CMD ["node", "dist/main.js"]
