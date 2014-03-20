#!/bin/sh

python ./commands/metapolator.py \
  --axis   "name:foo|ABCD/A.ufo:ABCD/B.ufo|coefficient=1,metapolation=0.5" \
  --axis   "name:bar|ABCD/C.ufo:ABCD/D.ufo|coefficient=0,metapolation=0" \
  --family "EncodeNormal-Beta70" \
  --style "400 Regular" \
  I.ufo

meld ./commands/data/fontbox/Pablo/norounding.ufo ./commands/data/fontbox.ufo
