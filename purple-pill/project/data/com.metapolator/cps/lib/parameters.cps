@import 'lib/flexmaster.cps';

glyph, point > center, contour > p  {
    sidebearingLeftSummand: 0.5 * master:spacingS + 0.5 * glyph:spacingS;
    sidebearingRightSummand: 0.5 * master:spacingS + 0.5 * glyph:spacingS;
    widthFactor: master:widthF * glyph:widthF;
    heightFactor: master:heightF * glyph:heightF;
}

point > left, point > right, contour > p {
    weightFactor: master:weightF * glyph:weightF;
}

master {
    spacingS: 0;
    widthF: 1;
    heightF: 1;
    weightF: 1;
}

glyph {
    spacingS: 0;
    widthF: 1;
    heightF: 1;
    weightF: 1;
}