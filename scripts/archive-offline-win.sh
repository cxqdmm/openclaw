#!/usr/bin/env bash
set -euo pipefail

STAGE_DIR=""
OUT_ZIP=""
USE_7Z="0"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --stage-dir)
      STAGE_DIR="$2"
      shift 2
      ;;
    --out)
      OUT_ZIP="$2"
      shift 2
      ;;
    --prefer-7z)
      USE_7Z="1"
      shift 1
      ;;
    -h|--help)
      echo "Usage: bash scripts/archive-offline-win.sh --stage-dir <dir> --out <zip> [--prefer-7z]"
      exit 0
      ;;
    *)
      echo "Unknown argument: $1" >&2
      exit 2
      ;;
  esac
done

if [[ -z "${STAGE_DIR:-}" || -z "${OUT_ZIP:-}" ]]; then
  echo "Missing required args. Usage: --stage-dir <dir> --out <zip>" >&2
  exit 2
fi
if [[ ! -d "$STAGE_DIR" ]]; then
  echo "Stage dir not found: $STAGE_DIR" >&2
  exit 1
fi

# Normalize to absolute POSIX paths to avoid relative path issues after cd
to_abs_path() {
  local p="$1"
  case "$p" in
    /*) printf '%s\n' "$p" ;;
    *) printf '%s/%s\n' "$(pwd)" "$p" ;;
  esac
}

STAGE_DIR="$(to_abs_path "$STAGE_DIR")"
OUT_ZIP="$(to_abs_path "$OUT_ZIP")"

OUT_DIRNAME="$(dirname "$OUT_ZIP")"
mkdir -p "$OUT_DIRNAME"
rm -f "$OUT_ZIP"

winpath() {
  local p="$1"
  if command -v cygpath >/dev/null 2>&1; then
    cygpath -w "$p"
    return 0
  fi
  if [[ "$p" =~ ^/([a-zA-Z])/(.*)$ ]]; then
    local drive="${BASH_REMATCH[1]}"
    local rest="${BASH_REMATCH[2]}"
    drive="$(printf '%s' "$drive" | tr '[:lower:]' '[:upper:]')"
    rest="${rest//\//\\}"
    printf '%s:\\%s\n' "$drive" "$rest"
    return 0
  fi
  printf '%s\n' "${p//\//\\}"
}

if [[ "$USE_7Z" == "1" ]] && command -v 7z >/dev/null 2>&1; then
  (
    cd "$STAGE_DIR"
    shopt -s dotglob nullglob
    files=( * )
    7z a -tzip "$OUT_ZIP" -- "${files[@]}" >/dev/null
  )
elif command -v powershell.exe >/dev/null 2>&1; then
  STAGE_WIN="$(winpath "$STAGE_DIR")"
  OUT_WIN="$(winpath "$OUT_ZIP")"
  powershell.exe -NoProfile -Command "\$ErrorActionPreference = 'Stop'; \$items = Get-ChildItem -Force -LiteralPath \"${STAGE_WIN}\"; Compress-Archive -Path (\$items | ForEach-Object { \$_.FullName }) -DestinationPath \"${OUT_WIN}\" -Force" >/dev/null
elif command -v tar >/dev/null 2>&1; then
  ( cd "$STAGE_DIR"; shopt -s dotglob nullglob; files=( * ); tar -a -cf "$OUT_ZIP" -- "${files[@]}" )
else
  echo "Neither powershell.exe nor tar is available to create a zip archive." >&2
  exit 1
fi

echo "$OUT_ZIP"
