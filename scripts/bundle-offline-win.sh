#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Usage:
  bash scripts/bundle-offline-win.sh [--out-dir <dir>] [--skip-build]

Environment variables:
  OPENCLAW_BUNDLE_SKIP_PNPM_INSTALL=1  Skip pnpm install auto-repair before build
  OPENCLAW_BUNDLE_SKIP_UI_BUILD=1      Skip pnpm ui:build
EOF
}

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

OUT_DIR="$ROOT_DIR/dist/offline"
SKIP_BUILD="0"
SKIP_PNPM_INSTALL="${OPENCLAW_BUNDLE_SKIP_PNPM_INSTALL:-0}"
SKIP_UI_BUILD="${OPENCLAW_BUNDLE_SKIP_UI_BUILD:-0}"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --out-dir)
      OUT_DIR="$2"
      shift 2
      ;;
    --skip-build)
      SKIP_BUILD="1"
      shift 1
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown argument: $1" >&2
      usage >&2
      exit 2
      ;;
  esac
done

OS_RAW="$(uname -s)"
case "$OS_RAW" in
  MINGW*|MSYS*|CYGWIN*) OS="win32" ;;
  *)
    echo "This script is intended to run on Windows (Git Bash/MSYS2/Cygwin). Detected: $OS_RAW" >&2
    exit 1
    ;;
esac

if ! command -v node >/dev/null 2>&1; then
  echo "node is required." >&2
  exit 1
fi
if ! command -v npm >/dev/null 2>&1; then
  echo "npm is required." >&2
  exit 1
fi

if [[ "$SKIP_BUILD" != "1" ]]; then
  if ! command -v pnpm >/dev/null 2>&1; then
    echo "pnpm is required to build OpenClaw." >&2
    exit 1
  fi
  if [[ "$SKIP_PNPM_INSTALL" != "1" ]]; then
    if [[ ! -x "node_modules/.bin/tsdown" || ! -x "node_modules/.bin/tsx" ]]; then
      pnpm install
    fi
  fi
  pnpm build
  if [[ "$SKIP_UI_BUILD" != "1" ]]; then
    pnpm ui:build
  fi
fi

VERSION="$(node -e 'const fs=require("node:fs"); console.log(JSON.parse(fs.readFileSync("package.json","utf8")).version)')"

ARCH_RAW="$(uname -m)"
case "$ARCH_RAW" in
  x86_64|amd64) ARCH="x64" ;;
  arm64|aarch64) ARCH="arm64" ;;
  *) ARCH="$ARCH_RAW" ;;
esac

BASE_NAME="openclaw-offline-${VERSION}-${OS}-${ARCH}"
mkdir -p "$OUT_DIR"
STAGE_ROOT="$ROOT_DIR/.offline-stage"
STAGE_DIR="$STAGE_ROOT/$BASE_NAME"
rm -rf "$STAGE_DIR"
mkdir -p "$STAGE_DIR"

copy_path() {
  local src="$1"
  local dest="$2"
  cp -R -p "$src" "$dest" 2>/dev/null || cp -R "$src" "$dest"
}

for path in dist openclaw.mjs package.json README.md LICENSE assets docs extensions skills; do
  if [[ -e "$path" ]]; then
    copy_path "$path" "$STAGE_DIR/"
  fi
done

if [[ -f "scripts/install-offline-win.ps1" ]]; then
  cp -p "scripts/install-offline-win.ps1" "$STAGE_DIR/install.ps1"
fi
if [[ -f "scripts/install-offline-win.cmd" ]]; then
  cp -p "scripts/install-offline-win.cmd" "$STAGE_DIR/Install OpenClaw.cmd"
fi

(
  cd "$STAGE_DIR"
  export SHARP_IGNORE_GLOBAL_LIBVIPS=1
  export npm_config_update_notifier=false
  export npm_config_fund=false
  export npm_config_audit=false
  npm install --omit=dev
)

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

ARCHIVE_PATH="$OUT_DIR/${BASE_NAME}.zip"
rm -f "$ARCHIVE_PATH"

if command -v powershell.exe >/dev/null 2>&1; then
  STAGE_WIN="$(winpath "$STAGE_DIR")"
  ARCHIVE_WIN="$(winpath "$ARCHIVE_PATH")"
  powershell.exe -NoProfile -Command "Compress-Archive -Path \"${STAGE_WIN}\\*\" -DestinationPath \"${ARCHIVE_WIN}\" -Force" >/dev/null
else
  echo "powershell.exe is required to create a zip archive on Windows." >&2
  exit 1
fi

echo "$ARCHIVE_PATH"
