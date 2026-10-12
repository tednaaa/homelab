#!/usr/bin/env bash
set -euo pipefail

set -a
source "$(dirname "$0")/restic.env"
set +a

exec restic "$@"
