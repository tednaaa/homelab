#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

rm -f vaultwarden/data/db_*.sqlite3
docker compose exec -T vaultwarden /vaultwarden backup

./restic.sh backup "$PWD" --exclude "$PWD/vaultwarden/data/db.sqlite3*"
./restic.sh forget --keep-daily 7 --keep-weekly 4 --keep-monthly 6 --prune
