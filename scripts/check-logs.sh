#!/bin/bash

FRONT_TAIL="${FRONT_TAIL:-50}"
BACK_TAIL="${BACK_TAIL:-30}"

echo ""
echo "🔍 LOGS BACKEND"
docker logs stock_management_backend 2>&1 | tail -30
print_section "Frontend logs"
if container_exists "stock_management_frontend"; then
echo "🔍 LOGS FRONTEND"
docker logs stock_management_frontend 2>&1 | tail -50
else
  echo "WARN: container stock_management_frontend not found"
fi

print_section "Backend logs"
if container_exists "stock_management_backend"; then
  docker logs stock_management_backend 2>&1 | tail -n "${BACK_TAIL}"
else
  echo "WARN: container stock_management_backend not found"
fi
