#!/bin/bash
cd "$(dirname "$0")"
for i in 1 2 3 4 5 6 7 8; do node render.js frames 60 >> render.log 2>&1; grep -q DONE render.log && break; done
