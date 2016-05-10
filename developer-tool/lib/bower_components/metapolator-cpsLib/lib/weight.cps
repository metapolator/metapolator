/* change the weight */
center > left,
center > right {
    length: baseNode:onLength * weightFactor + weightSummand;
    onLength: length;
}

/* define default higher level properties, override in your master */
glyph,
center > left,
center > right,
p {
    weightFactor: 1;
    weightSummand: 0;
}
