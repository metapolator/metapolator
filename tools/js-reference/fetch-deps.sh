#!/bin/sh
# Recreate app/lib/bower_components/ from deps.lock at the pinned commits.
# Replaces `npm install && bower install`: npm/bower are not needed, and the
# unpinned ">=" bower ranges would no longer resolve to what this port was
# measured against.
set -eu
HERE=$(cd "$(dirname "$0")" && pwd)
DEST="$HERE/../../app/lib/bower_components"
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
