/* Boilerplate of a two master metapolation
 * Before this you may want to read single-inheritance.cps
 * because it basically does the same, but less complex.
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
    onDir: base1:onDir * _p1 + base2:onDir * _p2; 
    
    inLength: base1:inLength * _p1 + base2:inLength * _p2;
    outLength: base1:outLength * _p1 + base2:outLength * _p2;
    
    inTension: base1:inTension * _p1 + base2:inTension * _p2;
    outTension: base1:outTension * _p1 + base2:outTension * _p2;
    
    inDirIntrinsic: base1:inDirIntrinsic * _p1 + base2:inDirIntrinsic * _p2;
    outDirIntrinsic: base1:outDirIntrinsic * _p1 + base2:outDirIntrinsic * _p2;
}

point > left, point > right{
    onLength: base1:onLength * _p1 + base2:onLength * _p2;
}

point > center {
    on: base1:on * _p1 + base2:on * _p2;
    in: base1:in * _p1 + base2:in * _p2;
    out: base1:out * _p1 + base2:out * _p2;
}

/* terminals overide of skeleton2outline */
point:i(0) > left,
point:i(0) > right {
    inDir: base1:inDir * _p1 + base2:inDir * _p2;
}

point:i(-1) > right,
point:i(-1) > left {
    outDir: base1:outDir * _p1 + base2:outDir * _p2;
}
/* end boilerplate two master metapolation */

/* set up this masters super masters */
@dictionary {
    * {
        baseMaster1: S"master#anyOther";
        baseMaster2: S"master#any";
        proportion1: .5;
        proportion2: .5;
    }
}
