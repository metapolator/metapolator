#!/bin/sh
# Build the web UI, serve it with `metapolator serve` and run smoke.js in
# headless Chromium. Screenshots and the export go to $TMPDIR/mp-ui-e2e.
#   crates/mp-ui/tests/e2e/run.sh
set -eu
ROOT=$(cd "$(dirname "$0")/../../../.." && pwd)
OUT="${TMPDIR:-/tmp}/mp-ui-e2e"
cd "$ROOT"
tools/build-ui.sh target/ui >/dev/null
cargo build --release -q -p mp-cli
rm -rf -- "${OUT:?}"
mkdir -p "$OUT"
target/release/metapolator serve --ui target/ui --addr 127.0.0.1:8766 > "$OUT/serve.log" 2>&1 &
SERVER=$!
trap 'kill $SERVER' EXIT
sleep 1
node --experimental-websocket crates/mp-ui/tests/e2e/smoke.js http://127.0.0.1:8766/ "$OUT"
kill $SERVER
# a project served from disk opens in the UI
target/release/metapolator init "$OUT/myfont" >/dev/null
target/release/metapolator import-ui data/fonts/subsets/Merriweather-Light-Subset-nop.ufo "$OUT/myfont" --name light >/dev/null
target/release/metapolator serve "$OUT/myfont" --ui target/ui --addr 127.0.0.1:8767 > "$OUT/serve2.log" 2>&1 &
SERVER=$!
sleep 1
node --experimental-websocket crates/mp-ui/tests/e2e/smoke.js http://127.0.0.1:8767/ "$OUT/served" master-light
