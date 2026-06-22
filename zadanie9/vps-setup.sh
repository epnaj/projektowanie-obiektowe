#!/usr/bin/env bash

set -euo pipefail

: "${PUBLIC_IP:?set PUBLIC_IP=<VM public IP>}"
: "${WATCHTOWER_TOKEN:?set WATCHTOWER_TOKEN=<same value as secrets.WATCHTOWER_TOKEN in GitHub>}"

REGISTRY="ghcr.io"
IMAGE_SERVER="${REGISTRY}/epnaj/zadanie9-server:latest"
IMAGE_CLIENT="${REGISTRY}/epnaj/zadanie9-client:latest"

SERVER_PORT="${SERVER_PORT:-8000}"
CLIENT_PORT="${CLIENT_PORT:-5173}"
WATCHTOWER_PORT="${WATCHTOWER_PORT:-8080}"

echo "Downloading newest images from ${REGISTRY} ..."
docker pull "${IMAGE_SERVER}"
docker pull "${IMAGE_CLIENT}"

echo "(Re)start server container (port ${SERVER_PORT})"
docker rm -f z9-server >/dev/null 2>&1 || true
docker run --rm -d \
  --name z9-server \
  --label com.centurylinklabs.watchtower.enable=true \
  -p "${SERVER_PORT}:8000" \
  "${IMAGE_SERVER}"

echo "(Re)start clienta container (port ${CLIENT_PORT})"
docker rm -f z9-client >/dev/null 2>&1 || true
docker run --rm -d \
  --name z9-client \
  --label com.centurylinklabs.watchtower.enable=true \
  -p "${CLIENT_PORT}:5173" \
  -e "VITE_API_BASE_URL=http://${PUBLIC_IP}:${SERVER_PORT}" \
  "${IMAGE_CLIENT}"

echo "(Re)start Watchtower — HTTP API (port ${WATCHTOWER_PORT}) + polling fallback"
# --label-enable: watches only containers labeled watchtower.enable=true
# WATCHTOWER_HTTP_API_UPDATE: enables /v1/update endpoint triggered by the deploy job
# --interval 60: fallback polling of ghcr.io; --cleanup: removes old images
docker rm -f z9-watchtower >/dev/null 2>&1 || true
docker run --rm -d \
  --name z9-watchtower \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -p "${WATCHTOWER_PORT}:8080" \
  -e WATCHTOWER_HTTP_API_UPDATE=true \
  -e "WATCHTOWER_HTTP_API_TOKEN=${WATCHTOWER_TOKEN}" \
  containrrr/watchtower:latest \
  --label-enable \
  --cleanup \
  --interval 60

echo "DONE"
echo "   Client:              http://${PUBLIC_IP}:${CLIENT_PORT}"
echo "   API:                 http://${PUBLIC_IP}:${SERVER_PORT}"
echo "   Watchtower HTTP API: http://${PUBLIC_IP}:${WATCHTOWER_PORT}/v1/update"
echo
echo "Manual deploy test (same call the 'deploy' job in Actions makes):"
echo "   curl -sSf -H \"Authorization: Bearer \${WATCHTOWER_TOKEN}\" http://${PUBLIC_IP}:${WATCHTOWER_PORT}/v1/update"
