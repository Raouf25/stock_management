#!/bin/bash

echo "🔍 DIAGNOSTIC BACKEND"
echo ""

require_cmd docker
warn_if_missing curl || true

print_section "Backend container status"
echo "1️⃣ État du conteneur backend:"
docker ps | grep backend
echo "2️⃣ Logs complets du backend (dernières 100 lignes):"
docker logs stock_management_backend 2>&1 | tail -100
echo ""
echo "3️⃣ État du conteneur PostgreSQL:"
docker ps | grep postgres
echo ""

echo "5️⃣ Test de connexion DB depuis backend:"
docker exec stock_management_backend curl -s http://localhost:8080/api/products || echo "Pas de réponse"
print_section "PostgreSQL logs (last 30)"
if container_exists "stock_management_postgres"; then
  docker logs stock_management_postgres 2>&1 | tail -n 30
else
echo "4️⃣ Logs PostgreSQL:"
docker logs stock_management_postgres 2>&1 | tail -30
echo ""
print_section "Backend health probe"
if has_cmd curl; then
  if curl -fsS "http://localhost:8080/api/products" >/dev/null 2>&1; then
	echo "Backend endpoint reachable: http://localhost:8080/api/products"
  else
	echo "WARN: backend endpoint not reachable"
  fi
else
  echo "WARN: curl not installed; skipping HTTP check"
fi
