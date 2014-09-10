#!/bin/sh
# Test driver for export tests
# Called from export/_all_.js
# Each font in the space-separated lists is imported, exported, and the
# exported result compared with the original.
FONTS_SUCCEED="Inconsolata-PAN Sean_hairline-PAN"
FONTS_FAIL=""
FONTS_CRASH="foo"

set -e

TEST_DIR=test-data
EXPORT_UFO=exported

cd $TEST_DIR

# Test fonts that should pass
for i in $FONTS_SUCCEED; do
    echo "Testing $i"
    ../roundtrip.sh $i $EXPORT_UFO
    diff -r ${EXPORT_UFO}1.ufo ${EXPORT_UFO}2.ufo
    echo Result $?
done

# Test fonts that should fail, failing if they pass
for i in $FONTS_FAIL; do
    echo "Testing (expected to fail) $i"
    ../roundtrip.sh $i $EXPORT_UFO
    ( diff -r ${EXPORT_UFO}1.ufo ${EXPORT_UFO}2.ufo && exit 1; ) || true
    echo Result $?
done

# Test fonts that should crash, failing if they don't
for i in $FONTS_CRASH; do
    echo "Testing (expected to crash) $i"
    ( ../roundtrip.sh $i $EXPORT_UFO && exit 1 ) || true
    echo Result $?
done
