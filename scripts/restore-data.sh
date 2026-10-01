#!/usr/bin/env sh
set -eu

archive=${1:?Usage: restore-data.sh BACKUP.tar.gz EMPTY_DATA_DIR}
target=${2:?Usage: restore-data.sh BACKUP.tar.gz EMPTY_DATA_DIR}
[ -f "$archive" ] || { echo "Backup archive not found: $archive" >&2; exit 1; }
if [ -f "$archive.sha256" ]; then
  expected=$(awk '{print $1}' "$archive.sha256")
  if command -v sha256sum >/dev/null 2>&1; then
    actual=$(sha256sum "$archive" | awk '{print $1}')
  else
    actual=$(shasum -a 256 "$archive" | awk '{print $1}')
  fi
  [ "$expected" = "$actual" ] || { echo "Backup checksum does not match." >&2; exit 1; }
fi
if [ -e "$target" ] && [ -n "$(find "$target" -mindepth 1 -maxdepth 1 -print -quit)" ]; then
  echo "Restore target must be an empty folder." >&2
  exit 1
fi
mkdir -p "$target"
if tar -tzf "$archive" | awk '/(^\/|^[A-Za-z]:|(^|\/)\.\.($|\/))/ { bad=1 } END { exit bad ? 0 : 1 }'; then
  echo "Archive contains an unsafe path; restore cancelled." >&2
  exit 1
fi
if tar -tvzf "$archive" | awk 'substr($1, 1, 1) == "l" || substr($1, 1, 1) == "h" { bad=1 } END { exit bad ? 0 : 1 }'; then
  echo "Archive contains symbolic or hard links; restore cancelled." >&2
  exit 1
fi
tar -xzf "$archive" -C "$target"
printf 'Restore completed to %s. Restart the application and verify login and submissions.\n' "$target"
