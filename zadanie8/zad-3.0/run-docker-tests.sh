#!/usr/bin/env bash
set -e
cd "$(dirname "$0")"
trap 'docker stop z8-app >/dev/null 2>&1 || true' EXIT

docker build -t z8-app ../../zadanie5/server
docker build -t z8-test .
docker run --rm -d --network host --name z8-app z8-app
docker run --rm --network host z8-test
