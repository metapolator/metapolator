#!/bin/sh
# Test driver for export tests
# Called from export/_all_.js
# Each font in the space-separated lists is imported, exported, and the
# exported result compared with the original.
FONTS_SUCCEED="Inconsolata-PAN Sean_hairline-PAN foo" # FIXME: non-existent "foo" Should fail! See issue #136
FONTS_FAIL=""

set -e

TEST_DIR=test-data
MASTER_NAME=new_master
IMPORT_UFO=imported
EXPORT_UFO=exported
METAPOLATOR="node --stack_trace_limit=100 `pwd`/../../../../metapolator"

cd $TEST_DIR

test () {
    font=$1

    # Remove any previous test results
    rm -rf ${IMPORT_UFO}*.ufo ${EXPORT_UFO}*.ufo

    # Import and export the original font
    $METAPOLATOR init ${IMPORT_UFO}1
    cd ${IMPORT_UFO}1.ufo
    $METAPOLATOR import ../$font.ufo $MASTER_NAME
    $METAPOLATOR export --precision 3 $MASTER_NAME ../${EXPORT_UFO}1
    cd ..

    # Import and export the first test export
    $METAPOLATOR init ${IMPORT_UFO}2
    cd ${IMPORT_UFO}2.ufo
    $METAPOLATOR import ../${EXPORT_UFO}1.ufo $MASTER_NAME
    $METAPOLATOR export --precision 3 $MASTER_NAME ../${EXPORT_UFO}2
    cd ..
}

# Test fonts that should pass
for i in $FONTS_SUCCEED; do
    echo "Testing $i"
    test $i
    diff -r ${EXPORT_UFO}1.ufo ${EXPORT_UFO}2.ufo
    echo Result $?
done

# Test fonts that should fail, failing if they pass
for i in $FONTS_FAIL; do
    echo "Testing (expected to fail) $i"
    test $FONTS_FAIL
    { diff -r ${EXPORT_UFO}1.ufo ${EXPORT_UFO}2.ufo && exit 1; } || true
    echo Result $?
done
