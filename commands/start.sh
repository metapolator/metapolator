#!/bin/sh

python ./commands/metapolator.py \
  --axis   "name:foo|A.ufo:B.ufo|koef=0" \
  --axis   "name:bar|B.ufo:C.ufo|koef=1,metap=1" \
  --family "EncodeNormal-Beta70" \
  --style "400 Regular" \
  I.ufo
