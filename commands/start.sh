#!/bin/sh

python ./commands/metapolator.py \
  --axis   "name:foo|A.ufo:B.ufo|koef=1,metap=0.5" \
  --axis   "name:bar|B.ufo:D.ufo|koef=1.5,metap=0.1" \
  --family "EncodeNormal-Beta70" \
  --style "400 Regular" \
  I.ufo
