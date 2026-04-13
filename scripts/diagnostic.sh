#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
# shellcheck source=lib/common.sh
source "${SCRIPT_DIR}/lib/common.sh"

require_cmd docker
warn_if_missing curl || true

print_section "1) Containers"
docker ps -a --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'

print_section "2) PostgreSQL logs (last 20)"
if container_exists "stock_management_postgres"; then
  docker logs stock_management_postgres 2>&1 | tail -n 20
else
  echo "WARN: container stock_management_postgres not found"
fi

print_section "3) Backend logs (last 20)"
if container_exists "stock_management_backend"; then
  docker logs stock_management_backend 2>&1 | tail -n 20
else
  echo "WARN: container stock_management_backend not found"
fi

print_section "4) Frontend logs (last 20)"
if container_exists "stock_management_frontend"; then
  docker logs stock_management_frontend 2>&1 | tail -n 20
else
  echo "WARN: container stock_management_frontend not found"
fi

print_section "5) Connectivity checks"
echo "PostgreSQL container health:"
if container_exists "stock_management_postgres" && \
   docker exec stock_management_postgres pg_isready -U postgres >/dev/null 2>&1; then
  echo "  OK"
else
  echo "  FAIL"
fi

if has_cmd curl; then
  echo "Backend API (8080):"
  curl -fsS "http://localhost:8080/api/products" >/dev/null 2>&1 && echo "  OK" || echo "  FAIL"

  echo "Frontend (4200):"
  curl -fsS "http://localhost:4200" >/dev/null 2>&1 && echo "  OK" || echo "  FAIL"
else
  echo "curl is not installed; HTTP checks skipped"
fi

print_section "6) Docker volumes matching 'stock'"
docker volume ls --format '{{.Name}}' | grep 'stock' || echo "No matching volumes"

print_section "7) Docker networks matching 'stock'"
docker network ls --format '{{.Name}}' | grep 'stock' || echo "No matching networks"
