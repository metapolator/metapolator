@import 'flexmaster.cps';

glyph, point > center, contour > p  {
    sidebearingLeftSummand: master:sidebearingLeftSummand;
    sidebearingRightSummand: master:sidebearingRightSummand;
    widthFactor: master:widthFactor * glyph:widthFactor;
    heightFactor: master:heightFactor * glyph:heightFactor;
}

point > left, point > right, contour > p {
    weightFactor: master:weightFactor * glyph:weightFactor;
}

master {
    sidebearingLeftSummand: 0;
    sidebearingRightSummand: 0;
    widthFactor: 1;
    heightFactor: 1;
    weightFactor: 1;
}

glyph {
    widthFactor: 1;
    heightFactor: 1;
    weightFactor: 1;
}