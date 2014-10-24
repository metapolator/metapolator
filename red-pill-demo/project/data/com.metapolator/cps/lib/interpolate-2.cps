/* Boilerplate of a simple two master interpolation
 * CAUTION: You won't be able to use a master of this
 * like a normal master because it only defines the
 * final outline curve points. If you wan't to have
 * more control over your resulting master you may
 * wan't to use a metapolation approach.
 */
@dictionary {
    point > * {
        indexGlyph: parent:parent:parent:index;
        indexPenstroke: parent:parent:index;
        indexPoint: parent:index;
        base1: baseMaster1
                    :children[indexGlyph]
                    :children[indexPenstroke]
                    :children[indexPoint]
                    :children[index]
                    ;
        base2: baseMaster2
                    :children[indexGlyph]
                    :children[indexPenstroke]
                    :children[indexPoint]
                    :children[index]
                    ;
        /* Ensure that the used proportions sum up to
         * 1; any other value produces usually unwanted effects.
         * You don't want this? in your master redefine it as 
         * interpolationUnit: 1;
         */
        interpolationUnit: 1/(proportion1 + proportion2);
        _p1: proportion1*interpolationUnit;
        _p2: proportion2*interpolationUnit;
    }
}

point > * {
    on: base1:on * _p1 +  base2:on * _p2;
    in: base1:in * _p1 + base2:in * _p2;
    out: base1:out * _p1 + base2:out * _p2;
}

/* set up this masters super masters */
@dictionary {
    * {
        baseMaster1: S"master#anyOther";
        baseMaster2: S"master#any";
        proportion1: .5;
        proportion2: .5;
    }
}
