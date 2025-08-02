# Multi-stage build para Next.js
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
RUN npx nx build user-ui

# Imagem de produção
FROM node:18-alpine AS production

WORKDIR /app

# Criar usuário não-root
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Copiar dependências e build da etapa anterior
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/apps/user-ui/.next ./.next
COPY --from=builder --chown=nodejs:nodejs /app/apps/user-ui/public ./public
COPY --from=builder --chown=nodejs:nodejs /app/package*.json ./
COPY --from=builder --chown=nodejs:nodejs /app/apps/user-ui/next.config.js ./
COPY --from=builder --chown=nodejs:nodejs /app/apps/user-ui/tailwind.config.js ./
COPY --from=builder --chown=nodejs:nodejs /app/apps/user-ui/postcss.config.js ./

# Expor porta
EXPOSE 3000

# Mudar para usuário não-root
USER nodejs

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/api/health || exit 1

# Comando para iniciar a aplicação
CMD ["npx", "nx", "start", "user-ui"] 