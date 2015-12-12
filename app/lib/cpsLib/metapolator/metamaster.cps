@import 'generated/centreline-skeleton-to-symmetric-outline.cps';
@import 'lib/metapolator/point-child-base.cps';
@import 'lib/metapolator/single-inheritance.cps';
@import 'lib/metapolator/weight.cps';
@import 'lib/metapolator/scale.cps';
@import 'global.cps';

/* set up this masters parameters */

master * {
    baseMaster: master:baseMaster;
}

point > center, contour > p {
    skeleton: base;
}

/* set up some names */

point > *{
    glyph: parent:parent:parent;
    penstroke: parent:parent;
}

penstroke, component{
    glyph: parent;
}

glyph {
    glyph: this;
}

p {
    glyph: parent:parent;
    contour: parent;
}

point > center, contour > p {
    xTranslate: sidebearingLeftSummand;
}

glyph {
    advanceWidth: base:advanceWidth * widthFactor + sidebearingLeftSummand + sidebearingRightSummand;
}
