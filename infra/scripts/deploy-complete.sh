#!/bin/bash

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Deploy Completo do Ecommerce...${NC}"

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

# Configurar Ingress Controller
echo -e "${GREEN}🌐 Configurando Ingress Controller...${NC}"
chmod +x infra/scripts/setup-ingress.sh
./infra/scripts/setup-ingress.sh

# Aplicar namespace
echo -e "${GREEN}📦 Criando namespace...${NC}"
kubectl create namespace ecommerce --dry-run=client -o yaml | kubectl apply -f -

# Aplicar ConfigMap
echo -e "${GREEN}⚙️  Aplicando ConfigMap...${NC}"
kubectl apply -f infra/k8s/configmap.yaml

# Aplicar deployments
echo -e "${GREEN}🔧 Aplicando deployments...${NC}"
kubectl apply -f infra/k8s/api-gateway-deployment.yaml
kubectl apply -f infra/k8s/auth-service-deployment.yaml
kubectl apply -f infra/k8s/user-ui-deployment.yaml

# Aplicar ingress
echo -e "${GREEN}🌐 Aplicando Ingress...${NC}"
kubectl apply -f infra/k8s/ingress.yaml

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
echo -e "${YELLOW}   User UI: http://ecommerce.local${NC}"
echo -e "${YELLOW}   API Gateway: http://api.ecommerce.local${NC}"
echo -e "${YELLOW}   Auth Service: http://auth.ecommerce.local${NC}"
echo -e "${YELLOW}   IP do Minikube: $MINIKUBE_IP${NC}"

# Adicionar ao /etc/hosts se solicitado
read -p "Deseja adicionar os hostnames ao /etc/hosts? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "$MINIKUBE_IP api.ecommerce.local" | sudo tee -a /etc/hosts
    echo "$MINIKUBE_IP auth.ecommerce.local" | sudo tee -a /etc/hosts
    echo "$MINIKUBE_IP ecommerce.local" | sudo tee -a /etc/hosts
    echo -e "${GREEN}✅ Hostnames adicionados ao /etc/hosts${NC}"
fi 