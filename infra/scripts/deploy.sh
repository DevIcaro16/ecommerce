#!/bin/bash

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Iniciando deploy do Ecommerce...${NC}"

# Verificar se kubectl está instalado
if ! command -v kubectl &> /dev/null; then
    echo -e "${RED}❌ kubectl não está instalado${NC}"
    exit 1
fi

# Verificar se minikube está rodando
if ! minikube status &> /dev/null; then
    echo -e "${YELLOW}⚠️  Minikube não está rodando. Iniciando...${NC}"
    minikube start --driver=docker
fi

# Aplicar namespace
echo -e "${GREEN}📦 Criando namespace...${NC}"
kubectl apply -f k8s/namespace.yaml

# Aplicar ConfigMap
echo -e "${GREEN}⚙️  Aplicando ConfigMap...${NC}"
kubectl apply -f k8s/configmap.yaml

# Aplicar deployments
echo -e "${GREEN}🔧 Aplicando deployments...${NC}"
kubectl apply -f k8s/api-gateway-deployment.yaml
kubectl apply -f k8s/auth-service-deployment.yaml
kubectl apply -f k8s/user-ui-deployment.yaml

# Aplicar ingress
echo -e "${GREEN}🌐 Aplicando Ingress...${NC}"
kubectl apply -f k8s/ingress.yaml

# Aguardar pods ficarem prontos
echo -e "${GREEN}⏳ Aguardando pods ficarem prontos...${NC}"
kubectl wait --for=condition=ready pod -l app=api-gateway -n ecommerce --timeout=300s
kubectl wait --for=condition=ready pod -l app=auth-service -n ecommerce --timeout=300s
kubectl wait --for=condition=ready pod -l app=user-ui -n ecommerce --timeout=300s

# Mostrar status
echo -e "${GREEN}✅ Deploy concluído!${NC}"
echo -e "${YELLOW}📊 Status dos pods:${NC}"
kubectl get pods -n ecommerce

echo -e "${YELLOW}🌐 Serviços:${NC}"
kubectl get services -n ecommerce

echo -e "${YELLOW}🔗 Ingress:${NC}"
kubectl get ingress -n ecommerce

# Obter IP do minikube
MINIKUBE_IP=$(minikube ip)
echo -e "${GREEN}🎉 Aplicação disponível em:${NC}"
echo -e "${YELLOW}   User UI: http://$MINIKUBE_IP${NC}"
echo -e "${YELLOW}   API Gateway: http://$MINIKUBE_IP:8080${NC}"
echo -e "${YELLOW}   Auth Service: http://$MINIKUBE_IP:6001${NC}" 