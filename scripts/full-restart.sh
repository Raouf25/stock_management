#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
# shellcheck source=lib/common.sh
source "${SCRIPT_DIR}/lib/common.sh"

require_cmd docker
COMPOSE_CMD="$(compose_cmd)"
COMPOSE_FILE="${REPO_ROOT}/docker-compose.yml"

print_section "Full restart"
print_kv "Compose" "${COMPOSE_CMD}"
print_kv "File" "${COMPOSE_FILE}"

print_section "Step 1/4 - Cleanup"
${COMPOSE_CMD} -f "${COMPOSE_FILE}" down --remove-orphans || true
docker system prune -f
docker volume prune -f

print_section "Step 2/4 - Rebuild images"
${COMPOSE_CMD} -f "${COMPOSE_FILE}" build --no-cache

print_section "Step 3/4 - Start services"
${COMPOSE_CMD} -f "${COMPOSE_FILE}" up -d

print_section "Step 4/4 - Service status"
sleep 10
${COMPOSE_CMD} -f "${COMPOSE_FILE}" ps

cat <<EOF

Services expected:
  Frontend:   http://localhost:4200
  Backend:    http://localhost:8080
  PostgreSQL: localhost:5432

Live logs:
  ${COMPOSE_CMD} -f ${COMPOSE_FILE} logs -f
EOF
