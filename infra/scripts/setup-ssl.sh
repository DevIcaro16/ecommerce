#!/bin/bash

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

DOMAIN="ominx.shop"
EMAIL="admin@ominx.shop"

echo -e "${GREEN}🔐 Configurando SSL para $DOMAIN...${NC}"

# Verificar se é root
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}❌ Este script deve ser executado como root${NC}"
    echo -e "${YELLOW}Execute: sudo ./setup-ssl.sh${NC}"
    exit 1
fi

# Verificar se Nginx está instalado
if ! command -v nginx &> /dev/null; then
    echo -e "${RED}❌ Nginx não está instalado${NC}"
    exit 1
fi

# Verificar se Certbot está instalado
if ! command -v certbot &> /dev/null; then
    echo -e "${GREEN}🔧 Instalando Certbot...${NC}"
    yum install -y python3-pip
    pip3 install certbot certbot-nginx
fi

# Fazer backup da configuração atual
echo -e "${GREEN}💾 Fazendo backup da configuração...${NC}"
cp /etc/nginx/conf.d/ominx.conf /etc/nginx/conf.d/ominx.conf.backup 2>/dev/null || true

# Aplicar configuração temporária (sem SSL)
echo -e "${GREEN}📝 Aplicando configuração temporária...${NC}"
cp infra/nginx/ominx.conf /etc/nginx/conf.d/ominx.conf

# Comentar linhas SSL temporariamente
sed -i 's/^    ssl_certificate/#    ssl_certificate/' /etc/nginx/conf.d/ominx.conf
sed -i 's/^    ssl_certificate_key/#    ssl_certificate_key/' /etc/nginx/conf.d/ominx.conf
sed -i 's/^    include/#    include/' /etc/nginx/conf.d/ominx.conf
sed -i 's/^    ssl_dhparam/#    ssl_dhparam/' /etc/nginx/conf.d/ominx.conf
sed -i 's/^    listen 443 ssl http2;/    listen 80;/' /etc/nginx/conf.d/ominx.conf

# Testar configuração
echo -e "${GREEN}✅ Testando configuração...${NC}"
nginx -t

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Erro na configuração do Nginx${NC}"
    exit 1
fi

# Reiniciar Nginx
echo -e "${GREEN}🚀 Reiniciando Nginx...${NC}"
systemctl reload nginx

# Obter certificado SSL
echo -e "${GREEN}🔐 Obtendo certificado SSL...${NC}"
echo -e "${YELLOW}⚠️  Certifique-se de que o domínio $DOMAIN aponta para este servidor${NC}"
echo -e "${YELLOW}⚠️  As portas 80 e 443 devem estar abertas${NC}"

read -p "Continuar? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}❌ Operação cancelada${NC}"
    exit 1
fi

# Executar Certbot
certbot --nginx -d $DOMAIN -d www.$DOMAIN --email $EMAIL --agree-tos --non-interactive

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Certificado SSL obtido com sucesso!${NC}"
    
    # Testar configuração final
    echo -e "${GREEN}✅ Testando configuração final...${NC}"
    nginx -t
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}🚀 Reiniciando Nginx...${NC}"
        systemctl reload nginx
        
        echo -e "${GREEN}✅ SSL configurado com sucesso!${NC}"
        echo -e "${YELLOW}🌐 Acesse: https://$DOMAIN${NC}"
        echo -e "${YELLOW}📝 Certificado válido até: $(certbot certificates | grep 'VALID')${NC}"
        
        # Configurar renovação automática
        echo -e "${GREEN}🔄 Configurando renovação automática...${NC}"
        (crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | crontab -
        
    else
        echo -e "${RED}❌ Erro na configuração final${NC}"
        exit 1
    fi
else
    echo -e "${RED}❌ Erro ao obter certificado SSL${NC}"
    echo -e "${YELLOW}Verifique se o domínio está configurado corretamente${NC}"
    exit 1
fi 