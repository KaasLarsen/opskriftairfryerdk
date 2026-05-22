#!/usr/bin/env bash
# Fejl hvis kladde-/støjstrenge dukker op i opskrifter (fra uheldig generering).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
if grep -RIn --include='*.md' -E '(dokument STOP| dokument STOP)' "$ROOT/src/content/recipes"; then
  echo >&2 "[check-recipe-no-ai-junk] Fjern støjtekst før commit."
  exit 1
fi
echo "recipe md: ingen kendte støjmarkers fundet."
