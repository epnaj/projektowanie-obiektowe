#!/usr/bin/env bash

if [[ $# -ne 1 ]]; then
    echo "Error: Missing required argument." >&2
    echo "Usage: $0 zadanie2 <docker image name>" >&2
    exit 1
fi

image_name="$1"

docker run -p 8000:8000 --rm $image_name
