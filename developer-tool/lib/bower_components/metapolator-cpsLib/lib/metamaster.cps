@import 'lib/MOM/primary.cps';
@import 'lib/metapolator/single-inheritance.cps';
@import 'lib/metapolator/weight.cps';
@import 'lib/metapolator/scale.cps';


/* set up some names */

center {
    penstroke: parent;
}

center > * {
    penstroke: parent:penstroke;
}

glyph {
    glyph: this;
}

p {
    contour: parent;
}

point > center, contour > p {
    /* TODO: Where's xTranslate used? */
    xTranslate: sidebearingLeftSummand;
}

glyph {
    width: baseNode:width * widthFactor + sidebearingLeftSummand + sidebearingRightSummand;
}

/* defaults and "inheritance" wiring */

glyph, center, contour > p, component  {
    sidebearingLeftSummand: 0.5 * master:SpacingS + 0.5 * glyph:SpacingS;
    sidebearingRightSummand: 0.5 * master:SpacingS + 0.5 * glyph:SpacingS;
    widthFactor: master:WidthF * glyph:WidthF;
    heightFactor: master:HeightF * glyph:HeightF;
}

center > left, center > right {
    weightFactor: master:WeightF * glyph:WeightF  * parent:WeightF;
}

master {
    SpacingS: 0;
    WidthF: 1;
    HeightF: 1;
    WeightF: 1;
}

glyph {
    SpacingS: 0;
    WidthF: 1;
    HeightF: 1;
    WeightF: 1;
}


center {
    WeightF: 1;
}
