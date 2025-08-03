#!/bin/bash

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Configurando Nginx para Ecommerce...${NC}"

# Verificar se é root
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}❌ Este script deve ser executado como root${NC}"
    echo -e "${YELLOW}Execute: sudo ./setup-nginx.sh${NC}"
    exit 1
fi

# Atualizar sistema
echo -e "${GREEN}📦 Atualizando sistema...${NC}"
yum update -y

# Instalar Nginx
echo -e "${GREEN}🔧 Instalando Nginx...${NC}"
amazon-linux-extras install nginx1 -y

# Instalar Certbot (opcional)
echo -e "${GREEN}🔐 Instalando Certbot...${NC}"
yum install -y python3-pip
pip3 install certbot certbot-nginx

# Fazer backup da configuração original
echo -e "${GREEN}💾 Fazendo backup da configuração original...${NC}"
cp /etc/nginx/nginx.conf /etc/nginx/nginx.conf.backup

# Testar configuração
echo -e "${GREEN}✅ Testando configuração...${NC}"
nginx -t

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Configuração válida!${NC}"
else
    echo -e "${RED}❌ Erro na configuração${NC}"
    exit 1
fi

# Iniciar e habilitar Nginx
echo -e "${GREEN}🚀 Iniciando Nginx...${NC}"
systemctl start nginx
systemctl enable nginx

# Configurar firewall
echo -e "${GREEN}🔥 Configurando firewall...${NC}"
systemctl start firewalld
systemctl enable firewalld
firewall-cmd --permanent --add-service=http
firewall-cmd --permanent --add-service=https
firewall-cmd --reload

# Verificar status
echo -e "${GREEN}📊 Verificando status...${NC}"
systemctl status nginx --no-pager

echo -e "${GREEN}✅ Nginx configurado com sucesso!${NC}"
echo -e "${YELLOW}🌐 Acesse: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)${NC}"
echo -e "${YELLOW}📝 Logs: /var/log/nginx/access.log e /var/log/nginx/error.log${NC}"
echo -e "${YELLOW}🔧 Config: /etc/nginx/nginx.conf${NC}" 