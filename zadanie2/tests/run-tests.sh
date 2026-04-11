#!/usr/bin/env bash

GIT_TOP="$(git rev-parse --show-toplevel)"
cd "${GIT_TOP}/zadanie2/tests"

docker build -t "test-zadanie2" .
docker run --rm --net="host" test-zadanie2
