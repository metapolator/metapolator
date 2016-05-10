/* scale the centerline */
center, contour > p{
    /* this way we can override scale and still have access to it's
        * original value
        */
    _scale: (Scaling widthFactor heightFactor);
    scale: _scale;
    _translate: (Translation xTranslate yTranslate);
    translate: _translate;
    transform:  translate * scale;
}

glyph {
    width: baseNode:width * widthFactor;
    height: baseNode:height * heightFactor;
}

center {
    on: transform * baseNode:on;
    in: transform * baseNode:in;
    out: transform * baseNode:out;
}
/*
 * scaling contours may yield in suboptimal results!
 */
contour > p {
    on: transform * baseNode:on;
}


/* define higher level parameters */
glyph, center, contour > p {
    widthFactor: 1;
    xTranslate: 0;
    yTranslate: 0;
    heightFactor: 1;
}
