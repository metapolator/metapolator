#!/bin/sh
# Test driver for export tests
# Called from export/__all__.js

# Each font in the space-separated lists is imported, exported, and the
# exported result compared with the original.
FONTS_SUCCEED=""
FONTS_FAIL="Inconsolata sean_hairline"

# Special setup for sean
if test ! -L sean_hairline.ufo; then
    rm -f test-data/sean_hairline.ufo
    ln -s ../../../../../sean/master_template/sean_hairline.ufo test-data/
fi

TEST_DIR=test-data
MASTER_NAME=new_master
TEST_FONT=test
METAPOLATOR=`pwd`/../../../../metapolator

cd $TEST_DIR

test () {
    font=$1

    rm -rf $TEST_FONT.ufo
    $METAPOLATOR init $TEST_FONT
    cd $TEST_FONT.ufo
    pwd
    $METAPOLATOR import ../$font.ufo $MASTER_NAME
    cd ..
}

# Test fonts that should pass
for i in $FONTS_SUCCEED; do
    test $i
    diff -r $i.ufo $TEST_FONT.ufo
done

# Test fonts that should fail, failing if they pass
for i in $FONTS_FAIL; do
    test $FONTS_FAIL
    ( diff -r $i.ufo $TEST_FONT.ufo && exit 1 ) || true
done
