#!/bin/bash

echo "🔍 DIAGNOSTIC BACKEND"
echo ""

echo "1️⃣ État du conteneur backend:"
docker ps | grep backend
echo ""

echo "2️⃣ Logs complets du backend (dernières 100 lignes):"
docker logs stock_management_backend 2>&1 | tail -100
echo ""

echo "3️⃣ État du conteneur PostgreSQL:"
docker ps | grep postgres
echo ""

echo "4️⃣ Logs PostgreSQL:"
docker logs stock_management_postgres 2>&1 | tail -30
echo ""

echo "5️⃣ Test de connexion DB depuis backend:"
docker exec stock_management_backend curl -s http://localhost:8080/api/products || echo "Pas de réponse"
