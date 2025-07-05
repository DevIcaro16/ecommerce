# 🛒 E-commerce API

Sistema de e-commerce desenvolvido com **Next.js**, **NX monorepo**, **TypeScript** e **Node.js**.

## 🏗️ Arquitetura

### Estrutura do Projeto
```
ecommerce/
├── apps/
│   ├── auth-service/          # Serviço de autenticação
│   └── api-gateway/          # Gateway da API
├── packages/
│   ├── error-handle/         # Tratamento de erros centralizado
│   ├── libs/
│   │   ├── prisma/          # Cliente Prisma (MongoDB)
│   │   └── redis/           # Cliente Redis
│   └── shared/              # Utilitários compartilhados
└── prisma/
    └── schema.prisma        # Schema do banco de dados
```

## 🚀 Tecnologias

- **Framework**: Next.js com NX monorepo
- **Backend**: Node.js + Express + TypeScript
- **Frontend**: NextJS + TypeScript
- **Banco de Dados**: MongoDB (via Prisma)
- **Cache**: Redis
- **Autenticação**: JWT + OTP
- **Email**: Nodemailer + EJS templates
- **Documentação**: SwaggerUI/OpenAPI

## 🔧 Configuração

### Pré-requisitos
- Node.js 18+
- MongoDB
- Redis
- NX CLI

### Instalação
```bash
# Clone o repositório
git clone <repository-url>
cd ecommerce

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env
```


## 🏃‍♂️ Executando o Projeto

### Desenvolvimento
```bash
# Serviço de autenticação
npx nx serve auth-service

# API Gateway
npx nx serve api-gateway

# Build de produção
npx nx build auth-service
```

### Endpoints Disponíveis

#### Auth Service (Porta 6001)
- `POST /api/register` - Registro de usuário
- `POST /api/verify` - Verificação de OTP
- `POST /api/forgot-password` - Recuperação de senha
- `GET /api-docs` - Documentação Swagger

## 🔐 Funcionalidades de Autenticação

### Registro de Usuário
1. **Validação de dados**: Nome, email, senha obrigatórios
2. **Verificação de email**: Formato válido e único
3. **Restrições OTP**: 
   - Bloqueio por spam (1 hora)
   - Cooldown entre tentativas (1 minuto)
   - Máximo 2 tentativas por hora
4. **Envio de email**: Template EJS com código OTP

### Verificação OTP
1. **Validação do código**: 4 dígitos, expira em 5 minutos
2. **Controle de tentativas**: Máximo 2 tentativas antes do bloqueio
3. **Criação do usuário**: Senha criptografada com bcrypt

### Recuperação de Senha
1. **Verificação de usuário**: Email deve existir
2. **Mesmas restrições OTP** do registro
3. **Template específico** para recuperação

## 🗄️ Banco de Dados

### Modelos (Prisma + MongoDB)
```prisma
model Users {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  name      String
  email     String   @unique
  password  String?
  following String[]
  avatar    Images?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Images {
  id      String  @id @default(auto()) @map("_id") @db.ObjectId
  file_id String
  url     String
  userId  String? @unique @db.ObjectId
  users   Users?  @relation(fields: [userId], references: [id])
}
```

## 📧 Sistema de Email

### Templates EJS
- **user-activation-email.ejs**: Registro de usuário
- **forgot-password-user-email.ejs**: Recuperação de senha

### Configuração SMTP
- Suporte a Gmail, Outlook, etc.
- Templates responsivos com CSS inline
- Variáveis dinâmicas: nome, OTP, email de contato

## 🛡️ Segurança

### Validações
- ✅ Regex de email
- ✅ Senha criptografada (bcrypt)
- ✅ Rate limiting por IP/email
- ✅ Bloqueio por tentativas excessivas
- ✅ OTP com expiração

### Middleware de Erro
- ✅ Tratamento centralizado de erros
- ✅ Logs estruturados
- ✅ Respostas padronizadas

## 📚 Documentação

### Swagger/OpenAPI
- **URL**: `http://localhost:6001/api-docs`
- **JSON**: `http://localhost:6001/docs-json`
- **Geração automática** via swagger-autogen

## 🧪 Testes

```bash
# Executar testes
npx nx test auth-service

# Testes com coverage
npx nx test auth-service --coverage
```

## 🐳 Docker

```bash
# Build da imagem
npx nx docker-build auth-service

# Executar container
docker run -p 6001:6001 auth-service
```

## 📦 Scripts Úteis

```bash
# Resetar cache do NX
npx nx reset

# Listar projetos
npx nx list

# Gerar documentação Swagger
cd apps/auth-service/src
node swagger.js
```

## 🔄 Fluxo de Desenvolvimento

1. **Desenvolvimento**: `npx nx serve auth-service`
2. **Build**: `npx nx build auth-service`
3. **Testes**: `npx nx test auth-service`
4. **Deploy**: Docker ou build direto

## 📝 Próximos Passos

- [ ] Implementar API Gateway
- [ ] Adicionar microserviços (produtos, pedidos, pagamentos)
- [ ] Implementar autenticação JWT
- [ ] Adicionar upload de imagens
- [ ] Implementar notificações em tempo real
- [ ] Adicionar testes E2E

---
