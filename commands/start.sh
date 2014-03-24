#!/bin/sh

python ./commands/metapolator.py \
  --axis   "name:foo|Encode/EncodeNormal-Beta70-100 Thin.ufo:Encode/EncodeNormal-Beta70-900 Black.ufo|coefficient=1,metapolation=0" \
  --family "EncodeCondensed-Beta70" \
  --style "400 Regular" \
  I.ufo

# meld ./commands/data/fontbox/Pablo/norounding.ufo ./commands/data/fontbox.ufo
