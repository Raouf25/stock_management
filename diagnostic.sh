#!/bin/bash

echo "=== DIAGNOSTIC DOCKER ==="
echo ""

echo "1️⃣ État des conteneurs:"
docker ps -a
echo ""

echo "2️⃣ Logs PostgreSQL:"
docker logs stock_management_postgres 2>&1 | tail -20
echo ""

echo "3️⃣ Logs Backend:"
docker logs stock_management_backend 2>&1 | tail -20
echo ""

echo "4️⃣ Logs Frontend:"
docker logs stock_management_frontend 2>&1 | tail -20
echo ""

echo "5️⃣ Test de connectivité:"
echo "   PostgreSQL (5432):"
docker exec stock_management_postgres pg_isready -U postgres 2>&1 || echo "   ❌ Pas disponible"

echo "   Backend (8080):"
curl -s http://localhost:8080/api/products > /dev/null && echo "   ✅ OK" || echo "   ❌ Pas disponible"

echo "   Frontend (4200):"
curl -s http://localhost:4200 > /dev/null && echo "   ✅ OK" || echo "   ❌ Pas disponible"

echo ""
echo "6️⃣ Volumes Docker:"
docker volume ls | grep stock
echo ""

echo "7️⃣ Réseaux Docker:"
docker network ls | grep stock
