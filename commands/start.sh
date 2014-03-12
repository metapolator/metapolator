#!/bin/sh

python ./commands/metapolator.py \
  --axis   "name:foo|Roboto/A.ufo:Roboto/A.ufo|coefficient=1,metapolation=0" \
  --axis   "name:bar|Roboto/A.ufo:Roboto/A.ufo|coefficient=1,metapolation=0" \
  --family "EncodeNormal-Beta70" \
  --style "400 Regular" \
  I.ufo

# meld ./commands/Pablo/norounding.ufo/glyphs ./commands/fontbox.ufo/glyphs
