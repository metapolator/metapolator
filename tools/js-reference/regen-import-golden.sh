#!/bin/sh
# Regenerate tests/golden-import/ with the original JS importer
# (import-golden.js): every UFO in data/fonts/test and data/fonts/subsets is
# imported into a fresh project, saved, and exported again.
# The large sean_hairline-nop result is stored as a .tar.xz (about 300 KB
# instead of 10.6 MB); its sha256 is recorded in SHA256SUMS like every file.
#
#   tools/js-reference/regen-import-golden.sh
set -eu
ROOT=$(cd "$(dirname "$0")/../.." && pwd)
OUT="$ROOT/tests/golden-import"
SCRATCH=${TMPDIR:-/tmp}/mp-import-golden.$$
rm -rf -- "${OUT:?}"
mkdir -p "$OUT"
cd "$ROOT"
node tools/js-reference/import-golden.js "$SCRATCH" \
    data/fonts/test/*.ufo data/fonts/subsets/*.ufo >"$SCRATCH.log" 2>&1 \
    || { tail -20 "$SCRATCH.log" >&2; exit 1; }
for d in "$SCRATCH"/*/; do
    name=$(basename "$d")
    if [ "$name" = "sean_hairline-nop" ]; then
        ( cd "$SCRATCH" && tar --sort=name --mtime=@0 --owner=0 --group=0 --numeric-owner \
              -cf - "$name" | xz -9e > "$OUT/$name.tar.xz" )
    else
        cp -r "$d" "$OUT/$name"
    fi
done
# the verbatim sean_hairline.ufo is broken (contents.plist names a missing
# r.glif); the JS import fails, which the Rust test checks too
rm -rf -- "${SCRATCH:?}" "${SCRATCH:?}.log"
( cd "$OUT" && find . -type f ! -name SHA256SUMS -print0 | sort -z | xargs -0 sha256sum > SHA256SUMS )
echo "wrote $OUT"
