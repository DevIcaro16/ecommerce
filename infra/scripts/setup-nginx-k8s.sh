#!/bin/bash

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🌐 Configurando Nginx com proxy reverso para Kubernetes...${NC}"

# Verificar se kubectl está disponível
if ! command -v kubectl &> /dev/null; then
    echo -e "${RED}❌ kubectl não está instalado${NC}"
    exit 1
fi

# Verificar se minikube está rodando
if ! minikube status &> /dev/null; then
    echo -e "${YELLOW}⚠️  Minikube não está rodando. Iniciando...${NC}"
    minikube start --driver=docker --force
fi

# Parar port-forwards existentes
echo -e "${GREEN}🛑 Parando port-forwards existentes...${NC}"
pkill -f "kubectl port-forward" || true

# Iniciar port-forwards para os serviços
echo -e "${GREEN}🔗 Iniciando port-forwards...${NC}"

# Port-forward para auth-service (porta 30061)
kubectl port-forward svc/auth-service 30061:6001 -n ecommerce &
AUTH_PID=$!

# Port-forward para api-gateway-service (porta 30080)
kubectl port-forward svc/api-gateway-service 30080:8080 -n ecommerce &
API_PID=$!

# Port-forward para user-ui-service (porta 30301)
kubectl port-forward svc/user-ui-service 30301:3001 -n ecommerce &
UI_PID=$!

# Aguardar um pouco para os port-forwards ficarem ativos
echo -e "${GREEN}⏳ Aguardando port-forwards ficarem ativos...${NC}"
sleep 5

# Verificar se os port-forwards estão funcionando
echo -e "${GREEN}🔍 Verificando port-forwards...${NC}"

# Testar auth-service
if curl -s http://localhost:30061/api > /dev/null; then
    echo -e "${GREEN}✅ Auth Service: http://localhost:30061${NC}"
else
    echo -e "${RED}❌ Auth Service não está respondendo${NC}"
fi

# Testar api-gateway
if curl -s http://localhost:30080/ > /dev/null; then
    echo -e "${GREEN}✅ API Gateway: http://localhost:30080${NC}"
else
    echo -e "${RED}❌ API Gateway não está respondendo${NC}"
fi

# Testar user-ui
if curl -s http://localhost:30301/ > /dev/null; then
    echo -e "${GREEN}✅ User UI: http://localhost:30301${NC}"
else
    echo -e "${RED}❌ User UI não está respondendo${NC}"
fi

# Aplicar configuração do Nginx
echo -e "${GREEN}📝 Aplicando configuração do Nginx...${NC}"


# Testar configuração do Nginx
if sudo nginx -t; then
    echo -e "${GREEN}✅ Configuração do Nginx está válida${NC}"

    # Recarregar Nginx
    sudo systemctl reload nginx
    echo -e "${GREEN}✅ Nginx recarregado com sucesso${NC}"
else
    echo -e "${RED}❌ Configuração do Nginx inválida${NC}"
    exit 1
fi

# Salvar PIDs para gerenciamento
echo $AUTH_PID > /tmp/auth-portforward.pid
echo $API_PID > /tmp/api-portforward.pid
echo $UI_PID > /tmp/ui-portforward.pid

echo -e "${GREEN}🎉 Configuração concluída!${NC}"
echo -e "${YELLOW}📊 URLs disponíveis:${NC}"
echo -e "${YELLOW}   Frontend: http://ominx.shop${NC}"
echo -e "${YELLOW}   API Gateway: http://ominx.shop/api${NC}"
echo -e "${YELLOW}   Auth Service: http://ominx.shop/auth${NC}"
echo -e "${YELLOW}   Swagger Docs: http://ominx.shop/api-docs${NC}"
echo -e "${YELLOW}   Health Check: http://ominx.shop/health${NC}"

echo -e "${GREEN}💡 Para parar os port-forwards:${NC}"
echo -e "${YELLOW}   pkill -f 'kubectl port-forward'${NC}"
