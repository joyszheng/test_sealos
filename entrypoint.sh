#!/bin/bash
set -euo pipefail

# 确保工作目录就是脚本所在目录（Release 容器里很关键）
cd "$(dirname "$0")"

app_env=${1:-development}
export NODE_ENV="${NODE_ENV:-}"
export HOST="${HOST:-0.0.0.0}"
export PORT="${PORT:-8080}"

echo "======== test-sealos startup ========"
echo "cwd:      $(pwd)"
echo "app_env:  ${app_env}"
echo "HOST:     ${HOST}"
echo "PORT:     ${PORT}"
echo "node:     $(command -v node || true) ($(node -v 2>/dev/null || echo 'missing'))"
echo "files:    $(ls -1)"
echo "===================================="

if [ ! -f "server.js" ]; then
  echo "ERROR: server.js not found in $(pwd)" >&2
  echo "Did you git pull the latest code before creating the Release?" >&2
  ls -la >&2 || true
  exit 1
fi

if [ "$app_env" = "production" ] || [ "$app_env" = "prod" ]; then
  echo "Production environment detected"
  export NODE_ENV=production
else
  echo "Development environment detected"
  export NODE_ENV="${NODE_ENV:-development}"
fi

echo "Starting: node server.js (NODE_ENV=${NODE_ENV}, ${HOST}:${PORT})"
exec node server.js
