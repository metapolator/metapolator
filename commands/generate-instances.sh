#!/bin/bash

# Set metapolation step
rm -rf ./commands/output
STEP=0.05
FONTA="Encode/EncodeNormal-Beta70-100 Thin.ufo"
FONTB="Encode/EncodeNormal-Beta70-900 Black.ufo"
declare -i i=0
while [ $i -le 100 ]
do
    val=`echo "scale=2; ${i}/100"| bc`

    echo ===================================
    echo "generating with metapolation ${i}"
    python ./commands/metapolator.py \
      --axis   "name:foo|${FONTA}:${FONTB}|coefficient=1,metapolation=${val}" \
      --family "EncodeNormal-Beta70-${val}" \
      --style "400 Regular" \
      I.ufo
    i=`expr "$i + 5" | bc`;
    mkdir -p commands/output
    cp ./commands/data/fontbox.ttf ./commands/output/EncodeNormal-Beta70-${val}.ttf
done
