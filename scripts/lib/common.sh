#!/usr/bin/env bash

set -euo pipefail

SCRIPT_LIB_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_LIB_DIR}/../.." && pwd)"

print_section() {
  local title="${1:-}"
  echo
  echo "== ${title} =="
}

print_kv() {
  local key="${1:-}"
  local value="${2:-}"
  printf '%-14s %s\n' "${key}:" "${value}"
}

has_cmd() {
  command -v "$1" >/dev/null 2>&1
}

require_cmd() {
  local cmd="$1"
  if ! has_cmd "${cmd}"; then
	echo "ERROR: required command not found: ${cmd}" >&2
	exit 1
  fi
}

warn_if_missing() {
  local cmd="$1"
  if ! has_cmd "${cmd}"; then
	echo "WARN: optional command not found: ${cmd}" >&2
	return 1
  fi
}

compose_cmd() {
  if docker compose version >/dev/null 2>&1; then
	echo "docker compose"
  elif has_cmd docker-compose; then
	echo "docker-compose"
  else
	echo "ERROR: neither 'docker compose' nor 'docker-compose' is available." >&2
	exit 1
  fi
}

container_exists() {
  local name="$1"
  docker ps -a --format '{{.Names}}' | grep -Fx "${name}" >/dev/null 2>&1
}

