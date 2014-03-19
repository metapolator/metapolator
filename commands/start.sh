#!/bin/sh

python ./commands/metapolator.py \
  --axis   "name:foo|Pablo/norounding.ufo:Pablo/norounding.ufo|coefficient=1,metapolation=0" \
  --axis   "name:bar|Pablo/norounding.ufo:Pablo/norounding.ufo|coefficient=1,metapolation=0" \
  --family "EncodeNormal-Beta70" \
  --style "400 Regular" \
  I.ufo

# meld ./commands/fontbox/Roboto/A.ufo/glyphs ./commands/fontbox.ufo/glyphs
