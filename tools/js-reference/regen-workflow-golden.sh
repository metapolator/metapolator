#!/bin/sh
# Regenerate tests/golden-workflow/ with workflow-golden.js (the UI workflow:
# import two UFOs as base-/master- pairs, metapolate an instance 50/50,
# save, export every master as UFO 3, unrounded UFO 2 and OTF).
#   tools/js-reference/regen-workflow-golden.sh
set -eu
ROOT=$(cd "$(dirname "$0")/../.." && pwd)
OUT="$ROOT/tests/golden-workflow"
rm -rf -- "${OUT:?}"
mkdir -p "$OUT"
cd "$ROOT"
node tools/js-reference/workflow-golden.js "$OUT/merriweather-light-bold" \
    light=data/fonts/subsets/Merriweather-Light-Subset-nop.ufo \
    bold=data/fonts/subsets/Merriweather-Bold-Subset-nop.ufo \
    --instance light=0.5,bold=0.5 >/dev/null 2>&1
( cd "$OUT" && find . -type f ! -name SHA256SUMS -print0 | sort -z | xargs -0 sha256sum > SHA256SUMS )
echo "wrote $OUT"
