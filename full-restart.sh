#!/bin/bash

echo "🧹 Nettoyage complet..."
docker-compose down --remove-orphans
docker system prune -f
docker volume prune -f

echo ""
echo "🏗️ Reconstruction..."
docker-compose build --no-cache

echo ""
echo "🚀 Lancement..."
docker-compose up -d

echo ""
echo "⏳ Attente du démarrage (30 secondes)..."
sleep 30

echo ""
echo "📊 État des services:"
docker-compose ps

echo ""
echo "✅ Services devraient être accessibles à:"
echo "   Frontend:  http://localhost:4200"
echo "   Backend:   http://localhost:8080"
echo "   PostgreSQL: localhost:5432"

echo ""
echo "🔍 Pour voir les logs en direct:"
echo "   docker-compose logs -f"
