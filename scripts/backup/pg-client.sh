#!/usr/bin/env bash
# Dedicated ephemeral client; does not attach to any existing CRM container.
set -euo pipefail
tool="$(basename "$0")"
case "$tool" in pg_dump|pg_dumpall|pg_restore) ;; *) exit 64 ;; esac
exec docker run --rm --pull=never --read-only --cap-drop ALL \
  --security-opt no-new-privileges --memory=256m --cpus=0.5 \
  --ulimit fsize=8589934592:8589934592 \
  --user "$(id -u):$(id -g)" \
  --mount type=bind,src=/etc/petsanny-backup,dst=/etc/petsanny-backup,readonly \
  --mount type=bind,src=/var/lib/petsanny-backup,dst=/var/lib/petsanny-backup \
  -e PGSERVICEFILE -e PGPASSFILE -e PGSERVICE -e PGCONNECT_TIMEOUT -e PGOPTIONS \
  postgres:17-alpine "$tool" "$@"
