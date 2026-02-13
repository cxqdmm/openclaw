#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

PREFIX="${OPENCLAW_OFFLINE_PREFIX:-${HOME}/.openclaw-offline}"
if [[ -n "${OPENCLAW_OFFLINE_BIN_DIR:-}" ]]; then
  BIN_DIR="${OPENCLAW_OFFLINE_BIN_DIR}"
else
  if [[ -d "/usr/local/bin" && -w "/usr/local/bin" ]]; then
    BIN_DIR="/usr/local/bin"
  else
    BIN_DIR="${HOME}/.local/bin"
  fi
fi

if [[ ! -f "${SCRIPT_DIR}/install.sh" ]]; then
  echo "Missing install.sh next to this installer." >&2
  exit 1
fi

bash "${SCRIPT_DIR}/install.sh" --prefix "${PREFIX}" --bin-dir "${BIN_DIR}"

echo ""
echo "Done."
echo "If 'openclaw' is not found, ensure this directory is in your PATH:"
echo "  ${BIN_DIR}"
echo ""
read -r -p "Press Enter to close..." _
