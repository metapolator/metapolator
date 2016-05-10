/* change the weight */
/* needs a "baseNode" */
center > left,
center > right {
    length: baseNode:onLength*weightFactor + weightSummand;
    onLength: length;
}

/* define  higher level parameters, override in your master */
glyph,
center > *,
p {
    weightFactor: 1;
    weightSummand: 0;
}
