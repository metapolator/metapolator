#!/bin/sh
# Build the web UI (crates/mp-ui) into a static site.
#   tools/build-ui.sh [OUTDIR]        (default: target/ui)
# Serve it with `metapolator serve [OUTDIR]` or any static web server.
set -eu
ROOT=$(cd "$(dirname "$0")/.." && pwd)
OUT=$(cd "$ROOT" && mkdir -p "${1:-target/ui}" && cd "${1:-target/ui}" && pwd)
cd "$ROOT"
wasm-pack build crates/mp-ui --release --target web --out-dir "$OUT/pkg" --no-pack --no-typescript
cp -r crates/mp-ui/static/. "$OUT/"
rm -f -- "$OUT/pkg/.gitignore"
echo "built $OUT"
