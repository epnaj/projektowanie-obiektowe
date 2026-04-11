#!/usr/bin/env bash

if [ $# -ne 1 ]; then
    echo "Error: Missing required argument."
    echo "Usage: $0 zadanie2 <docker image name>"
    exit 1
fi

image_name="$1"

docker run -p 8000:8000 --rm $image_name
