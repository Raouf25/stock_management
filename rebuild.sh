#!/bin/bash

echo "🔄 Nettoyage Docker..."
docker-compose down
docker rmi -f stock_management_frontend stock_management_backend 2>/dev/null
docker system prune -f

echo "🏗️ Reconstruction des images..."
docker-compose build --no-cache

echo "🚀 Lancement des services..."
docker-compose up -d

echo ""
echo "✅ Services lancés!"
echo "   PostgreSQL: localhost:5432"
echo "   Backend:    http://localhost:8080"
echo "   Frontend:   http://localhost:4200"
echo ""
echo "📋 Vérification du statut..."
sleep 5
docker-compose ps
