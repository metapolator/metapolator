/* define a "base" for point > *  */
glyph {
    base: baseMaster:children[index];
}

point > * {
    indexGlyph: parent:parent:parent:index;
    indexPenstroke: parent:parent:index;
    indexPoint: parent:index;
    base: baseMaster
                :children[indexGlyph]
                :children[indexPenstroke]
                :children[indexPoint]
                :children[index]
                ;
}

contour > p {
    indexGlyph: parent:parent:index;
    indexContour: parent:index;
    base: baseMaster
                :children[indexGlyph]
                :children[indexContour]
                :children[index]
                ;
}

/* do this to set up this masters super master 
* {
    baseMaster: S"master#any";
}
*/