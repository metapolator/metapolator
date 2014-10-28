#!/bin/sh
# Do a round-trip import/export

set -e

MASTER_NAME=new_master
IMPORT_UFO=imported
METAPOLATOR="node --stack_trace_limit=100 `pwd`/../../../../../bin/metapolator"

if test $# -ne 2; then
    echo Usage: roundtrip.sh FONT EXPORT_UFO
    exit 1
fi

font=$1
export=$2

# Remove any previous test results
rm -rf ${IMPORT_UFO}*.ufo ${export}*.ufo

# Import and export the original font
$METAPOLATOR init ${IMPORT_UFO}1.ufo
$METAPOLATOR import $font.ufo ${IMPORT_UFO}1.ufo/$MASTER_NAME
$METAPOLATOR export --precision 3 ${IMPORT_UFO}1.ufo/$MASTER_NAME ${export}1.ufo

# Import and export the first test export
$METAPOLATOR init ${IMPORT_UFO}2.ufo
$METAPOLATOR import ${export}1.ufo ${IMPORT_UFO}2.ufo/$MASTER_NAME
$METAPOLATOR export --precision 3 ${IMPORT_UFO}2.ufo/$MASTER_NAME ${export}2.ufo
