# Multi-stage build para Next.js
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

# Build da aplicação usando Next.js
RUN cd apps/user-ui && npm run build

# Imagem de produção
FROM node:18-alpine AS production

WORKDIR /app

# Copiar dependências e build da etapa anterior
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/apps/user-ui/.next ./.next
COPY --from=builder --chown=nodejs:nodejs /app/apps/user-ui/public ./public
COPY --from=builder --chown=nodejs:nodejs /app/apps/user-ui/package.json ./package.json
COPY --from=builder --chown=nodejs:nodejs /app/apps/user-ui/next.config.js ./
COPY --from=builder --chown=nodejs:nodejs /app/apps/user-ui/tailwind.config.js ./
COPY --from=builder --chown=nodejs:nodejs /app/apps/user-ui/postcss.config.js ./

EXPOSE 3001

CMD ["npm", "run", "start"]