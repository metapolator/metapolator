/* change the weight */
/* needs a "base", see lib/point-child-base.cps */
point > left,
point > right {
    length: base:onLength*weightFactor + weightSummand;
    onLength: length;
}

/* define default higher level properties, override in your master */
glyph,
point > left,
point > right,
p {
    weightFactor: 1;
    weightSummand: 0;
}
