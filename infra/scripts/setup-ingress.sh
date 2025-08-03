#!/bin/bash

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🌐 Configurando Ingress Controller...${NC}"

# Verificar se kubectl está instalado
if ! command -v kubectl &> /dev/null; then
    echo -e "${RED}❌ kubectl não está instalado${NC}"
    exit 1
fi

# Verificar se minikube está rodando
if ! minikube status &> /dev/null; then
    echo -e "${YELLOW}⚠️  Minikube não está rodando. Iniciando...${NC}"
    minikube start --driver=docker --force
fi

# Habilitar Ingress Controller no Minikube
echo -e "${GREEN}🔧 Habilitando Ingress Controller...${NC}"
minikube addons enable ingress

# Aguardar Ingress Controller ficar pronto
echo -e "${GREEN}⏳ Aguardando Ingress Controller ficar pronto...${NC}"
kubectl wait --namespace ingress-nginx \
  --for=condition=ready pod \
  --selector=app.kubernetes.io/component=controller \
  --timeout=300s

# Verificar status do Ingress Controller
echo -e "${GREEN}📊 Status do Ingress Controller:${NC}"
kubectl get pods -n ingress-nginx

# Obter IP do Minikube
MINIKUBE_IP=$(minikube ip)
echo -e "${GREEN}🎉 Ingress Controller configurado!${NC}"
echo -e "${YELLOW}🌐 IP do Minikube: $MINIKUBE_IP${NC}"
echo -e "${YELLOW}📝 Para acessar, adicione ao /etc/hosts:${NC}"
echo -e "${YELLOW}   $MINIKUBE_IP api.ecommerce.local${NC}"
echo -e "${YELLOW}   $MINIKUBE_IP auth.ecommerce.local${NC}"
echo -e "${YELLOW}   $MINIKUBE_IP ecommerce.local${NC}"

# Mostrar serviços
echo -e "${GREEN}📊 Serviços disponíveis:${NC}"
kubectl get services -n ecommerce

# Mostrar ingress
echo -e "${GREEN}📊 Ingress configurado:${NC}"
kubectl get ingress -n ecommerce

echo -e "${GREEN}✅ Configuração concluída!${NC}" 