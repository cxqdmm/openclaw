#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Usage:
  bash scripts/bundle-offline.sh [--out-dir <dir>] [--skip-build]

Creates a platform/arch-specific offline bundle that includes:
  - dist/ build output
  - runtime files (openclaw.mjs, extensions/, skills/, docs/, ...)
  - node_modules/ installed with npm and copied with symlinks dereferenced (no symlinks in the bundle)

Output:
  <out-dir>/openclaw-offline-<version>-<os>-<arch>.tar.gz
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
fi

if [[ "$SKIP_BUILD" != "1" ]]; then
  pnpm build
  if [[ "$SKIP_UI_BUILD" != "1" ]]; then
    pnpm ui:build
  fi
fi

VERSION="$(node -e 'const fs=require("node:fs"); console.log(JSON.parse(fs.readFileSync("package.json","utf8")).version)')"

OS_RAW="$(uname -s)"
case "$OS_RAW" in
  Darwin) OS="darwin" ;;
  Linux) OS="linux" ;;
  *) OS="$(printf '%s' "$OS_RAW" | tr '[:upper:]' '[:lower:]')" ;;
esac

ARCH_RAW="$(uname -m)"
case "$ARCH_RAW" in
  x86_64|amd64) ARCH="x64" ;;
  arm64|aarch64) ARCH="arm64" ;;
  *) ARCH="$ARCH_RAW" ;;
esac

BASE_NAME="openclaw-offline-${VERSION}-${OS}-${ARCH}"
mkdir -p "$OUT_DIR"
STAGE_DIR="$OUT_DIR/$BASE_NAME"
rm -rf "$STAGE_DIR"
mkdir -p "$STAGE_DIR"

copy_path() {
  local src="$1"
  local dest="$2"
  if command -v rsync >/dev/null 2>&1; then
    rsync -a "$src" "$dest"
  else
    cp -R -p "$src" "$dest"
  fi
}

for path in dist openclaw.mjs package.json README.md LICENSE assets docs extensions skills; do
  if [[ -e "$path" ]]; then
    copy_path "$path" "$STAGE_DIR/"
  fi
done

if [[ -f "scripts/install-offline.sh" ]]; then
  mkdir -p "$STAGE_DIR"
  cp -p "scripts/install-offline.sh" "$STAGE_DIR/install.sh"
  chmod +x "$STAGE_DIR/install.sh" || true
fi

if [[ -f "scripts/install-offline.command" ]]; then
  cp -p "scripts/install-offline.command" "$STAGE_DIR/Install OpenClaw.command"
  chmod +x "$STAGE_DIR/Install OpenClaw.command" || true
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "npm is required to build an offline bundle." >&2
  exit 1
fi

if ! command -v rsync >/dev/null 2>&1; then
  echo "rsync is required to build a symlink-free bundle safely." >&2
  exit 1
fi

(
  cd "$STAGE_DIR"
  export SHARP_IGNORE_GLOBAL_LIBVIPS=1
  export npm_config_update_notifier=false
  export npm_config_fund=false
  export npm_config_audit=false
  npm install --omit=dev
  rsync -aL "node_modules/" "node_modules_flat/"
  rm -rf "node_modules"
  mv "node_modules_flat" "node_modules"
)

ARCHIVE_PATH="$OUT_DIR/${BASE_NAME}.tar.gz"
tar -czf "$ARCHIVE_PATH" -C "$OUT_DIR" "$BASE_NAME"

echo "$ARCHIVE_PATH"
