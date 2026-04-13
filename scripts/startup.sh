#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
# shellcheck source=lib/common.sh
source "${SCRIPT_DIR}/lib/common.sh"

print_section "Stock Management startup"

require_cmd docker
require_cmd java

COMPOSE_CMD="$(compose_cmd)"
DEV_COMPOSE_FILE="${REPO_ROOT}/docker-compose.dev.yml"
RUN_FLYWAY="${RUN_FLYWAY:-1}"
FLYWAY_URL="${FLYWAY_URL:-jdbc:postgresql://localhost:5432/stock_db}"
FLYWAY_USER="${FLYWAY_USER:-postgres}"
FLYWAY_PASSWORD="${FLYWAY_PASSWORD:-postgres}"
FLYWAY_LOCATIONS="${FLYWAY_LOCATIONS:-filesystem:${REPO_ROOT}/backend/src/main/resources/db/migration}"

MAVEN_ARGS=()
if [[ -x "${REPO_ROOT}/backend/mvnw" ]]; then
  # backend/mvnw must also receive -f so Maven finds the right pom.xml
  MAVEN_ARGS=("${REPO_ROOT}/backend/mvnw" -f "${REPO_ROOT}/backend/pom.xml")
elif [[ -x "${REPO_ROOT}/mvnw" ]]; then
  MAVEN_ARGS=("${REPO_ROOT}/mvnw" -f "${REPO_ROOT}/backend/pom.xml")
elif has_cmd mvn; then
  MAVEN_ARGS=(mvn -f "${REPO_ROOT}/backend/pom.xml")
else
  echo "ERROR: no Maven executable found. Install mvn or use Maven wrapper (mvnw)." >&2
  exit 1
fi

print_section "Step 1/5 - Docker availability"
print_kv "Docker" "OK"
print_kv "Compose" "${COMPOSE_CMD}"

print_section "Step 2/5 - Start PostgreSQL"
${COMPOSE_CMD} -f "${DEV_COMPOSE_FILE}" up -d --remove-orphans postgres

echo "Waiting for postgres container health..."
for _ in $(seq 1 20); do
  if container_exists "stock_management_postgres" && \
     docker exec stock_management_postgres pg_isready -U postgres >/dev/null 2>&1; then
    echo "PostgreSQL is ready."
    break
  fi
  sleep 2
done

if ! docker exec stock_management_postgres pg_isready -U postgres >/dev/null 2>&1; then
  echo "ERROR: PostgreSQL did not become ready in time." >&2
  exit 1
fi

print_section "Step 3/5 - Java and Maven wrapper"
JAVA_VERSION_LINE="$(java -version 2>&1 | head -n 1)"
print_kv "Java" "${JAVA_VERSION_LINE}"

JAVA_MAJOR="$(java -version 2>&1 | awk -F '[\".]' '/version/ {print $2; exit}')"
if [[ "${JAVA_MAJOR}" != "21" ]]; then
  echo "ERROR: backend requires Java 21, but detected Java ${JAVA_MAJOR}." >&2
  echo "Set JAVA_HOME to a JDK 21 installation and retry." >&2
  exit 1
fi

print_section "Step 4/5 - Build backend"
# Use 'package' without 'clean' so Maven can do incremental compilation.
# -DskipTests avoids environment-dependent test failures during startup.
FORCE_REBUILD="${FORCE_REBUILD:-0}"
BUILD_GOAL="package"
if [[ "${FORCE_REBUILD}" == "1" ]]; then
  BUILD_GOAL="clean package"
fi
# shellcheck disable=SC2086
(cd "${REPO_ROOT}" && "${MAVEN_ARGS[@]}" -q ${BUILD_GOAL} -DskipTests)
echo "Backend build completed."

if [[ "${RUN_FLYWAY}" == "1" ]]; then
  print_section "Step 5/5 - Run Flyway migrations"
  # Pin the plugin version so the same binary is used on every run.
  FLYWAY_PLUGIN="org.flywaydb:flyway-maven-plugin:10.10.0"
  FLYWAY_COMMON_ARGS=(
    -Dflyway.url="${FLYWAY_URL}"
    -Dflyway.user="${FLYWAY_USER}"
    -Dflyway.password="${FLYWAY_PASSWORD}"
    -Dflyway.locations="${FLYWAY_LOCATIONS}"
  )

  if (cd "${REPO_ROOT}" && "${MAVEN_ARGS[@]}" -q "${FLYWAY_COMMON_ARGS[@]}" "${FLYWAY_PLUGIN}:migrate"); then
    echo "Flyway migrations executed successfully."
  else
    echo "Flyway migrate failed once, attempting flyway:repair then retry..." >&2
    if (cd "${REPO_ROOT}" && "${MAVEN_ARGS[@]}" -q "${FLYWAY_COMMON_ARGS[@]}" "${FLYWAY_PLUGIN}:repair") &&
       (cd "${REPO_ROOT}" && "${MAVEN_ARGS[@]}" -q "${FLYWAY_COMMON_ARGS[@]}" "${FLYWAY_PLUGIN}:migrate"); then
      echo "Flyway repaired and migrations executed successfully."
    else
      echo "ERROR: Flyway migrate failed after repair." >&2
      echo "If local data can be reset, recreate the DB volume:" >&2
      echo "  docker compose -f docker-compose.dev.yml down -v" >&2
      echo "  docker compose -f docker-compose.dev.yml up -d postgres" >&2
      exit 1
    fi
  fi
else
  echo "RUN_FLYWAY=0 -> skipping Flyway migration step."
fi

print_section "Next steps"
cat <<EOF
Terminal 1 - Backend:
  cd ${REPO_ROOT}
  ./mvnw -f backend/pom.xml spring-boot:run

Terminal 2 - Frontend:
  cd ${REPO_ROOT}/frontend
  npm install
  npm start

URLs:
  Frontend:      http://localhost:4200
  API Swagger:   http://localhost:8080/swagger-ui.html
  PostgreSQL:    localhost:5432

Stop postgres:
  ${COMPOSE_CMD} -f ${DEV_COMPOSE_FILE} down
EOF
