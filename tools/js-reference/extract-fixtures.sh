#!/bin/sh
# Extract the Metapolator v0.4.0 demo projects (current on-disk format:
# data/com.metapolator/{CPS,MOM}) from the upstream gh-pages branch.
# The examples/Canola-* submodules use the pre-0.4 format and do not load
# in the current Atem-MOM engine.
#
#   tools/js-reference/extract-fixtures.sh [min|full ...]
#
# Needs the `upstream` remote (github.com/metapolator/metapolator) fetched.
# The gh-pages deploy adds index.html directory listings for its REST IO; we
# drop them.
set -eu
ROOT=$(cd "$(dirname "$0")/../.." && pwd)
REF=${REF:-upstream/gh-pages}
for v in "${@:-min}"; do
    out="$ROOT/tests/fixtures/v0.4.0-$v"
    mkdir -p "$out"
    git -C "$ROOT" archive "$REF" "v0.4.0/$v/project" \
        | tar -x -C "$out" --strip-components=3 --exclude='index.html'
    echo "extracted $REF:v0.4.0/$v/project -> $out"
done
