#!/bin/sh

python ./commands/metapolator.py \
  --axis   "name:metapolation|A.ufo:B.ufo|-0.2,1.2" \
  --axis   "name:metapolationCD|C.ufo:D.ufo|-0.2,1.2" \
  --master "A.ufo|metapolation:0.0|metapolationCD:0.0" \
  --master "B.ufo|metapolation:0.0|metapolationCD:1.0" \
  --master "C.ufo|metapolation:1.0|metapolationCD:0.0" \
  --master "D.ufo|metapolation:1.0|metapolationCD:1.0" \
  --instance "metapolation:0.75|metapolationCD:0.29030000000000001|family:EncodeNormal-Beta70|stylename:400 Regular" \
  I.ufo
