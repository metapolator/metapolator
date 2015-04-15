@import 'flexmaster.cps';

glyph, point > center, contour > p  {
    sidebearingLeftSummand: 0.5 * master:spacingSummand + 0.5 * glyph:spacingSummand;
    sidebearingRightSummand: 0.5 * master:spacingSummand + 0.5 * glyph:spacingSummand;
    widthFactor: master:widthFactor * glyph:widthFactor;
    heightFactor: master:heightFactor * glyph:heightFactor;
}

point > left, point > right, contour > p {
    weightFactor: master:weightFactor * glyph:weightFactor;
}

master {
    spacingSummand: 40;
    widthFactor: 1;
    heightFactor: 1;
    weightFactor: 1;
}

glyph {
    glyph:this;
    spacingSummand: 0;
    widthFactor: 1;
    heightFactor: 1;
    weightFactor: 1;
}