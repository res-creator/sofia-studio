#!/bin/sh
# download a Figma AI result right away (URLs expire in 7 days): sh art/get.sh <url> <path>
mkdir -p "$(dirname "$2")" && curl -sS -f -L -o "$2" "$1" && echo "ok $2"
