#!/bin/bash

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

TERRAFORM_DIR="infra/terraform"

echo -e "${GREEN}🏗️  Iniciando deploy da infraestrutura...${NC}"

# Verificar se Terraform está instalado
if ! command -v terraform &> /dev/null; then
    echo -e "${RED}❌ Terraform não está instalado${NC}"
    exit 1
fi

# Verificar se AWS CLI está configurado
echo -e "${GREEN}🔍 Verificando autenticação AWS...${NC}"
if ! aws sts get-caller-identity &> /dev/null; then
    echo -e "${RED}❌ AWS CLI não está configurado${NC}"
    echo -e "${YELLOW}Configure suas credenciais AWS com: aws configure${NC}"
    echo -e "${YELLOW}Ou configure as variáveis de ambiente:${NC}"
    echo -e "${YELLOW}  AWS_ACCESS_KEY_ID=sua-access-key${NC}"
    echo -e "${YELLOW}  AWS_SECRET_ACCESS_KEY=sua-secret-key${NC}"
    echo -e "${YELLOW}  AWS_REGION=us-east-1${NC}"
    exit 1
fi

# Mostrar conta AWS atual
echo -e "${GREEN}✅ Conectado à AWS:${NC}"
aws sts get-caller-identity

cd $TERRAFORM_DIR

# Inicializar Terraform
echo -e "${GREEN}🔧 Inicializando Terraform...${NC}"
terraform init

# Validar configuração
echo -e "${GREEN}✅ Validando configuração...${NC}"
terraform validate

# Mostrar plano
echo -e "${GREEN}📋 Mostrando plano de execução...${NC}"
terraform plan

# Confirmar deploy
read -p "Deseja aplicar as mudanças? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${GREEN}🚀 Aplicando mudanças...${NC}"
    terraform apply -auto-approve
    
    # Mostrar outputs
    echo -e "${GREEN}✅ Infraestrutura criada com sucesso!${NC}"
    echo -e "${YELLOW}📊 Outputs:${NC}"
    terraform output
    
    # Obter IP da instância
    EC2_IP=$(terraform output -raw public_ip)
    echo -e "${GREEN}🎉 Instância EC2 criada: $EC2_IP${NC}"
    echo -e "${YELLOW}Para conectar: ssh -i infra/terraform/ssh/ecommerce ubuntu@$EC2_IP${NC}"
else
    echo -e "${YELLOW}❌ Deploy cancelado${NC}"
fi 