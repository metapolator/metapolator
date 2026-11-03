#!/bin/sh
# Recreate the JavaScript Metapolator that the goldens come from, in
# tools/js-reference/legacy/ (git-ignored):
#  - legacy/app/: the AngularJS app as it was before the Rust port (it was
#    deleted from the tree), taken from git history at LEGACY_COMMIT;
#  - legacy/app/lib/bower_components/: the engine libraries from deps.lock
#    at the pinned commits. This replaces `npm install && bower install`:
#    npm/bower are not needed, and the unpinned ">=" bower ranges would no
#    longer resolve to what this port was measured against.
set -eu
HERE=$(cd "$(dirname "$0")" && pwd)
ROOT=$(cd "$HERE/../.." && pwd)
# upstream metapolator master, the base of the rust-wasm-port branch
LEGACY_COMMIT=f7aecce754a45f767e0a3c8bd84484bd2217036d
LEGACY="$HERE/legacy"
if [ ! -f "$LEGACY/app/lib/main.js" ]; then
    mkdir -p "$LEGACY"
    git -C "$ROOT" archive "$LEGACY_COMMIT" app | tar -x -C "$LEGACY"
    echo "app @ $LEGACY_COMMIT"
fi
DEST="$LEGACY/app/lib/bower_components"
mkdir -p "$DEST"
grep -v '^#' "$HERE/deps.lock" | while read -r name url commit; do
    [ -n "$name" ] || continue
    if [ ! -d "$DEST/$name/.git" ]; then
        git clone -q "$url" "$DEST/$name"
    fi
    git -C "$DEST/$name" -c advice.detachedHead=false checkout -q "$commit" \
        || { git -C "$DEST/$name" fetch -q origin "$commit"; git -C "$DEST/$name" checkout -q "$commit"; }
    echo "$name @ $commit"
done
# genericConfig.js maps 'obtain' to %bower%/obtainjs (lowercase)
ln -sfn obtainJS "$DEST/obtainjs"
