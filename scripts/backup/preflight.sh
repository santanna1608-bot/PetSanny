#!/usr/bin/env bash
# Read-only prerequisite checks. Never prints credentials or changes services.
set -euo pipefail
printf 'PetSanny backup prerequisites\n'
df -h /var/lib
free -h
for tool in docker python3 age flock; do
  if command -v "$tool" >/dev/null 2>&1; then
    printf '%s: available\n' "$tool"
  else
    printf '%s: missing\n' "$tool"
  fi
done
if command -v docker >/dev/null 2>&1; then
  docker ps --format '{{.Names}} {{.Image}}'
fi
if command -v ufw >/dev/null 2>&1; then ufw status; fi

