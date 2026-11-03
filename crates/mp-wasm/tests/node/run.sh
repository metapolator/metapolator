#!/bin/sh
# Build mp-wasm for Node and replay the UI model golden through it.
#   crates/mp-wasm/tests/node/run.sh
# The package goes to $TMPDIR/mp-wasm-node (scratch).
set -eu
ROOT=$(cd "$(dirname "$0")/../../../.." && pwd)
PKG="${TMPDIR:-/tmp}/mp-wasm-node"
cd "$ROOT"
wasm-pack build crates/mp-wasm --release --target nodejs --out-dir "$PKG" --no-pack
node crates/mp-wasm/tests/node/ui-model.js "$PKG"
