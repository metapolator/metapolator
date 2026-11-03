#!/bin/sh
# Regenerate tests/golden/ from tests/fixtures/ with the original JS engine.
#   tools/js-reference/regen-golden.sh            # all fixtures
# Requires: fetch-deps.sh has been run, `npm install` (or `corepack npm@10.9.2
# install`) in tools/js-reference/ for jsdom, Node >= 18.
set -eu
ROOT=$(cd "$(dirname "$0")/../.." && pwd)
mkdir -p "$ROOT/tests/golden"
for fx in "$ROOT"/tests/fixtures/*/; do
    name=$(basename "$fx")
    out="$ROOT/tests/golden/$name"
    rm -rf -- "${out:?}"
    node "$ROOT/tools/js-reference/golden.js" "$fx" "$out" 2>"$ROOT/tests/golden/$name.log.tmp" \
        || { cat "$ROOT/tests/golden/$name.log.tmp" >&2; exit 1; }
    rm -- "$ROOT/tests/golden/$name.log.tmp"
    echo "golden: $name -> tests/golden/$name"
done
( cd "$ROOT/tests/golden" && find . -type f ! -name SHA256SUMS -print0 | sort -z \
    | xargs -0 sha256sum > SHA256SUMS )
echo "wrote tests/golden/SHA256SUMS"
