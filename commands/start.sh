#!/bin/sh

python ./commands/metapolator.py \
  --axis   "name:foo|A.ufo:B.ufo|coefficient=1,metapolation=0.5" \
  --axis   "name:bar|B.ufo:C.ufo|coefficient=0,metapolation=0" \
  --family "EncodeNormal-Beta70" \
  --style "400 Regular" \
  I.ufo

meld ./commands/Pablo/norounding.ufo/glyphs ./commands/fontbox.ufo/glyphs
