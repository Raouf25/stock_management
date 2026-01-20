#!/bin/bash

# Stock Management - Script de Démarrage Automatique
# Usage: ./startup.sh

set -e

echo "🚀 Stock Management System - Startup"
echo "===================================="

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Vérifier Docker
echo -e "${YELLOW}[1/4] Vérification de Docker...${NC}"
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker n'est pas installé${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Docker trouvé${NC}"

# 2. Démarrer PostgreSQL
echo -e "${YELLOW}[2/4] Démarrage de PostgreSQL...${NC}"
docker-compose -f docker-compose.dev.yml up -d
sleep 3
if docker ps | grep -q "stock_management_postgres"; then
    echo -e "${GREEN}✅ PostgreSQL en cours d'exécution${NC}"
else
    echo -e "${RED}❌ PostgreSQL n'a pas démarré${NC}"
    exit 1
fi

# 3. Vérifier Java et Maven
echo -e "${YELLOW}[3/4] Vérification de Java et Maven...${NC}"
if ! command -v java &> /dev/null; then
    echo -e "${RED}❌ Java n'est pas installé${NC}"
    exit 1
fi
JAVA_VERSION=$(java -version 2>&1 | grep -oP 'version "\K[^"]*')
echo -e "${GREEN}✅ Java $JAVA_VERSION trouvé${NC}"

# 4. Compile Backend
echo -e "${YELLOW}[4/4] Compilation du Backend...${NC}"
cd backend
mvn clean install -q
echo -e "${GREEN}✅ Backend compilé${NC}"

# 5. Instructions finales
echo ""
echo -e "${GREEN}✅ Configuration Initiale Complète!${NC}"
echo ""
echo -e "${YELLOW}Prochaines Étapes:${NC}"
echo ""
echo -e "${GREEN}Terminal 1 - Backend:${NC}"
echo "  cd backend"
echo "  mvn spring-boot:run"
echo ""
echo -e "${GREEN}Terminal 2 - Frontend:${NC}"
echo "  cd frontend"
echo "  npm install"
echo "  npm start"
echo ""
echo -e "${GREEN}URLs d'Accès:${NC}"
echo "  Dashboard:    http://localhost:4200"
echo "  API Swagger:  http://localhost:8080/swagger-ui.html"
echo "  PostgreSQL:   localhost:5432"
echo ""
echo -e "${YELLOW}Arrêter PostgreSQL:${NC}"
echo "  docker-compose -f docker-compose.dev.yml down"
echo ""
