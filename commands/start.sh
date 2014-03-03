#!/bin/sh

python ./commands/metapolator.py \
  --axis   "name:foo|A.ufo:B.ufo|koef=1,metap=0.5" \
  --axis   "name:bar|B.ufo:C.ufo|koef=0,metap=0" \
  --family "EncodeNormal-Beta70" \
  --style "400 Regular" \
  I.ufo

meld ./commands/Pablo/rounded.ufo/glyphs ./commands/fontbox.ufo/glyphs
