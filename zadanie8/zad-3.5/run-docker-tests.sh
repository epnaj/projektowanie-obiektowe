#!/usr/bin/env bash
set -e
cd "$(dirname "$0")"
trap 'docker stop z8-app z8-chrome >/dev/null 2>&1 || true' EXIT

docker build -t z8-app -f app.Dockerfile ../../zadanie5
docker build -t z8-xss .
docker run --rm -d --network host --name z8-app z8-app
docker run --rm -d --network host --name z8-chrome selenium/standalone-chrome
docker run --rm --network host z8-xss
