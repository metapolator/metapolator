#!/bin/bash
#
# A small example that uses a temporary metapolator workspace
# and brings in a single glyph from two masters, and exports
# an instance between those two masters.
#
# This is mainly for investivating the non glif font output.
#
# It is assumed that directories in /tmp are ok to be deleted,
# for example /tmp/result.ufo will be removed if it exists.
#
# Usage: 
#
#   ./interpolate-for-non-glif-investigation.sh
# 
# Expected result:
#
#    With no args:
#      A resulting UFO file at /tmp/result.ufo that is a 50% interpolation
#        between the two masters  which are Merriweather Regular and Bold by default.
#      A metapolator workbench will be left as an artifact at the following location
#        in case debugging is required.
#        /tmp/interpolate-for-non-glif-investigation
#
#
SCRIPTDIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
BASEDIR="$SCRIPTDIR/../../../../"
FONTINPUTDIR="$BASEDIR/data/fonts/subsets/"
TMPWSDIR="/tmp/interpolate-for-non-glif-investigation"
RESULTPATH="/tmp/result.ufo"

METAPOLATOR="$BASEDIR/metapolator"
FF_EXPORT_SUBSET="$SCRIPTDIR/../../fontforge-export-subset.py"

MASTERREG="Merriweather-Regular-Subset-nop.ufo"
MASTERBOLD="Merriweather-Bold-Subset-nop.ufo"

# clean up any old run project
echo "creating a temporary workspace in $TMPWSDIR"
rm -rf $TMPWSDIR

# create a new metapolator project for this run
cd $(dirname $TMPWSDIR)
$METAPOLATOR init $(basename $TMPWSDIR)
cd $TMPWSDIR
pwd

# import the single glyph subsets from the two masters
$FF_EXPORT_SUBSET -i $FONTINPUTDIR/$MASTERREG \
    -o /tmp/out.ufo -g A
$METAPOLATOR import /tmp/out.ufo regular

$FF_EXPORT_SUBSET -i $FONTINPUTDIR/$MASTERBOLD \
    -o /tmp/out.ufo -g A
$METAPOLATOR import /tmp/out.ufo bold

# Interpolate and output
$METAPOLATOR  interpolate regular,bold 0.5,0.5 interp
rm -rf $RESULTPATH
$METAPOLATOR  export      interp $RESULTPATH

echo ""
echo "See $RESULTPATH for the resulting font of a 50/50 interpolation."
echo ""
