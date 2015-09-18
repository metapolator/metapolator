@import 'centreline-skeleton-to-symmetric-outline.cps';
@import 'lib/point-child-base.cps';
@import 'lib/single-inheritance.cps';
@import 'lib/weight.cps';
@import 'lib/scale.cps';
@import 'global.cps';

/* set up this masters parameters */

* {
    baseMaster: S"master#base";
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
