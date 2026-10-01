#!/usr/bin/env sh
set -eu

data_dir=${1:-./data}
backup_dir=${2:-./backups}
[ -d "$data_dir" ] || { echo "DATA_DIR not found: $data_dir" >&2; exit 1; }
mkdir -p "$backup_dir"
data_real=$(CDPATH= cd -- "$data_dir" && pwd -P)
backup_real=$(CDPATH= cd -- "$backup_dir" && pwd -P)
case "$backup_real/" in "$data_real/"*) echo "Backup folder must be outside DATA_DIR." >&2; exit 1;; esac
stamp=$(date -u +%Y%m%d-%H%M%S)
archive="$backup_real/mais-data-$stamp.tar.gz"
tar -czf "$archive" -C "$data_real" .
if command -v sha256sum >/dev/null 2>&1; then
  sha256sum "$archive" > "$archive.sha256"
else
  shasum -a 256 "$archive" > "$archive.sha256"
fi
printf '%s\n' "$archive"
