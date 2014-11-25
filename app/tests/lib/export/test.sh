#!/bin/sh
# Test driver for export tests
# Called from export/_all_.js
# Each font in the space-separated lists is imported, exported, and the
# exported result compared with the original.
FONTS_SUCCEED="Inconsolata-PAN Sean_hairline-PAN"
FONTS_FAIL=""
FONTS_CRASH="foo"

TMPDIR="/tmp/"

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


cd ../../../../../
BASEDIR=`pwd`
cd -

TESTFONTDIR="$BASEDIR/data/fonts/test/"
######
# Simple test of component round tripping
../roundtrip.sh "$TESTFONTDIR/components" $EXPORT_UFO
../xpath-selector.js exported1.ufo/glyphs/a.glif '//component[@base="b"]' 1
echo Result $?
../xpath-selector.js exported1.ufo/glyphs/b.glif '//component[@base="c"]' 1
echo Result $?
../xpath-selector.js exported1.ufo/glyphs/c.glif '//component' 0
echo Result $?
../xpath-selector.js exported2.ufo/glyphs/a.glif '//component[@base="b"]' 1
echo Result $?
../xpath-selector.js exported2.ufo/glyphs/b.glif '//component[@base="c"]' 1
echo Result $?
../xpath-selector.js exported2.ufo/glyphs/c.glif '//component' 0
echo Result $?
diff -r ${EXPORT_UFO}1.ufo ${EXPORT_UFO}2.ufo
echo Result $?



#############
# A case to 
#   import, 
#   modify the component transformation, 
#   export 
# and see that the transform comes through in the resulting UFO.

cat >> imported1.ufo/data/com.metapolator/cps/new_master.cps <<EOF

glyph#b component:i(1) {
    transformation: (Translation -100 0) * originalTransformation;
}

glyph#a component:i(1) {
    transformation: (Translation 0 100) * originalTransformation;
}

EOF

rm -rf ${EXPORT_UFO}1.ufo
METAPOLATOR="node --stack_trace_limit=100 `pwd`/../../../../../bin/metapolator"
$METAPOLATOR export imported1.ufo/new_master ${EXPORT_UFO}1.ufo

sed -i -e 's/yOffset/yoffset/g' exported1.ufo/glyphs/a.glif
sed -i -e 's/xOffset/xoffset/g' exported1.ufo/glyphs/b.glif
../xpath-selector.js ${EXPORT_UFO}1.ufo/glyphs/a.glif '//component[@base="b" and @yoffset="100"]' 1
echo Result $?
../xpath-selector.js ${EXPORT_UFO}1.ufo/glyphs/b.glif '//component[@base="c" and @xoffset="-100"]' 1
echo Result $?


