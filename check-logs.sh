#!/bin/bash

echo "🔍 LOGS FRONTEND"
docker logs stock_management_frontend 2>&1 | tail -50

echo ""
echo "🔍 LOGS BACKEND"
docker logs stock_management_backend 2>&1 | tail -30
