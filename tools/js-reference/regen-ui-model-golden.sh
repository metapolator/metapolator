#!/bin/sh
# Regenerate tests/golden-ui-model/ with ui-model-golden.js (the UI model:
# parameter operators, master duplication, design space and instance,
# specimen text; steps in ui-model-steps.json) on the deployed v0.4.0
# default project.
#   tools/js-reference/regen-ui-model-golden.sh
set -eu
ROOT=$(cd "$(dirname "$0")/../.." && pwd)
OUT="$ROOT/tests/golden-ui-model"
rm -rf -- "${OUT:?}"
mkdir -p "$OUT"
cd "$ROOT"
node tools/js-reference/ui-model-golden.js "$OUT/default-project" >/dev/null 2>&1
( cd "$OUT" && find . -type f ! -name SHA256SUMS -print0 | sort -z | xargs -0 sha256sum > SHA256SUMS )
echo "wrote $OUT"
