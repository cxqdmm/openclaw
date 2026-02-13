#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Usage:
  ./install.sh [--prefix <dir>] [--bin-dir <dir>] [--no-verify]

Assumes this script is executed from an extracted offline bundle directory that contains:
  - openclaw.mjs
  - dist/
  - node_modules/

Installs the bundle to:
  <prefix>/lib/openclaw
and writes an `openclaw` launcher into:
  <bin-dir>/openclaw
EOF
}

SOURCE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

PREFIX="${HOME}/.openclaw-offline"
BIN_DIR=""
VERIFY="1"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --prefix)
      PREFIX="$2"
      shift 2
      ;;
    --bin-dir)
      BIN_DIR="$2"
      shift 2
      ;;
    --no-verify)
      VERIFY="0"
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

if [[ ! -f "$SOURCE_DIR/openclaw.mjs" || ! -d "$SOURCE_DIR/dist" || ! -d "$SOURCE_DIR/node_modules" ]]; then
  echo "Invalid bundle directory: $SOURCE_DIR" >&2
  echo "Expected openclaw.mjs, dist/, node_modules/ next to install.sh" >&2
  exit 1
fi

if [[ -z "$BIN_DIR" ]]; then
  if [[ -d "/usr/local/bin" && -w "/usr/local/bin" ]]; then
    BIN_DIR="/usr/local/bin"
  else
    BIN_DIR="${HOME}/.local/bin"
  fi
fi

mkdir -p "$PREFIX/lib"
mkdir -p "$BIN_DIR"

if ! command -v node >/dev/null 2>&1; then
  echo "node is not found in PATH. Install Node.js >= 22.12.0 first." >&2
  exit 1
fi

NODE_MAJOR="$(node -p 'Number(process.versions.node.split(".")[0])')"
NODE_MINOR="$(node -p 'Number(process.versions.node.split(".")[1])')"
if [[ "$NODE_MAJOR" -lt 22 || ( "$NODE_MAJOR" -eq 22 && "$NODE_MINOR" -lt 12 ) ]]; then
  echo "Node.js >= 22.12.0 is required. Detected: $(node -v)" >&2
  exit 1
fi

INSTALL_DIR="$PREFIX/lib/openclaw"
mkdir -p "$INSTALL_DIR"

if command -v rsync >/dev/null 2>&1; then
  rsync -a --delete "${SOURCE_DIR}/" "${INSTALL_DIR}/" --exclude "install.sh"
else
  rm -rf "$INSTALL_DIR"
  mkdir -p "$INSTALL_DIR"
  cp -R -p "${SOURCE_DIR}/" "${INSTALL_DIR}/"
  rm -f "${INSTALL_DIR}/install.sh" || true
fi

WRAPPER_PATH="$BIN_DIR/openclaw"
cat >"$WRAPPER_PATH" <<EOF
#!/usr/bin/env bash
set -euo pipefail

if ! command -v node >/dev/null 2>&1; then
  echo "openclaw: node is not found in PATH. Install Node.js >= 22.12.0." >&2
  exit 1
fi

NODE_MAJOR="\$(node -p 'Number(process.versions.node.split(".")[0])')"
NODE_MINOR="\$(node -p 'Number(process.versions.node.split(".")[1])')"
if [[ "\$NODE_MAJOR" -lt 22 || ( "\$NODE_MAJOR" -eq 22 && "\$NODE_MINOR" -lt 12 ) ]]; then
  echo "openclaw: Node.js >= 22.12.0 is required. Detected: \$(node -v)" >&2
  exit 1
fi

exec node "${INSTALL_DIR}/openclaw.mjs" "\$@"
EOF
chmod +x "$WRAPPER_PATH"

echo "Installed OpenClaw to: $INSTALL_DIR"
echo "Installed launcher to: $WRAPPER_PATH"

if [[ "$VERIFY" == "1" ]]; then
  "$WRAPPER_PATH" --version
fi
