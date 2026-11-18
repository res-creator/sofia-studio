#!/bin/sh
# Озвучка всего сценария с повторами при зависании API (готовые абзацы не перегенерируются)
cd "$(dirname "$0")"
for i in $(seq 1 30); do
  python3 make_el.py > make_el.log 2>&1 && grep -q "^total" make_el.log && { tail -2 make_el.log; exit 0; }
  echo "try $i failed $(date +%T)"; tail -2 make_el.log; sleep 60
done
exit 1
