/* define a "base" for point > *  */
@dictionary {
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
}

/* set up this masters super master */
@dictionary {
    * {
        baseMaster: S"master#any";/* define this in your master! */
    }
}
