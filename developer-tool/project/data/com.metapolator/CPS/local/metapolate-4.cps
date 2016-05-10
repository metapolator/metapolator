@import 'lib/MOM/primary.cps';

/* Boilerplate of a two master metapolation
 * Before this you may want to read single-inheritance.cps
 * because it basically does the same, but less complex.
 */
glyph {
    base1: baseMaster1:children[index];
    base2: baseMaster2:children[index];
    base3: baseMaster3:children[index];
    base4: baseMaster4:children[index];
}
contour > p {
    indexGlyph: parent:parent:index;
    indexContour: parent:index;
    base1: baseMaster1
                :children[indexGlyph]
                :children[indexContour]
                :children[index]
                ;
    base2: baseMaster2
                :children[indexGlyph]
                :children[indexContour]
                :children[index]
                ;
    base3: baseMaster3
                :children[indexGlyph]
                :children[indexContour]
                :children[index]
                ;
    base4: baseMaster4
                :children[indexGlyph]
                :children[indexContour]
                :children[index]
                ;
}

center {
    indexGlyph: parent:parent:index;
    indexPenstroke: parent:index;
    base1: baseMaster1
                :children[indexGlyph]
                :children[indexPenstroke]
                :children[index]
                ;
    base2: baseMaster2
                :children[indexGlyph]
                :children[indexPenstroke]
                :children[index]
                ;
    base3: baseMaster3
                :children[indexGlyph]
                :children[indexPenstroke]
                :children[index]
                ;
    base4: baseMaster4
                :children[indexGlyph]
                :children[indexPenstroke]
                :children[index]
                ;
}

center > * {
    indexGlyph: parent:parent:parent:index;
    indexPenstroke: parent:parent:index;
    indexCenter: parent:index;
    base1: baseMaster1
                :children[indexGlyph]
                :children[indexPenstroke]
                :children[indexCenter]
                :children[index]
                ;
    base2: baseMaster2
                :children[indexGlyph]
                :children[indexPenstroke]
                :children[indexCenter]
                :children[index]
                ;
    base3: baseMaster3
                :children[indexGlyph]
                :children[indexPenstroke]
                :children[indexCenter]
                :children[index]
                ;
    base4: baseMaster4
                :children[indexGlyph]
                :children[indexPenstroke]
                :children[indexCenter]
                :children[index]
                ;
}
* {
    /* Ensure that the used proportions sum up to
        * 1; any other value produces usually unwanted effects.
        * You don't want this? in your master redefine it as
        * interpolationUnit: 1;
        */
    interpolationUnit: 1/(proportion1 + proportion2 + proportion3 + proportion4);
    _p1: proportion1*interpolationUnit;
    _p2: proportion2*interpolationUnit;
    _p3: proportion3*interpolationUnit;
    _p4: proportion4*interpolationUnit;
}


glyph {
    width: base1:width * _p1 + base2:width * _p2 + base3:width * _p3 +  base4:width * _p4;
    height: base1:height * _p1 + base2:height * _p2 + base3:height * _p3 +  base4:height * _p4;
}

@namespace(glyph){

center, center > * {
    inLength: base1:inLength * _p1 + base2:inLength * _p2 + base3:inLength * _p3 + base4:inLength * _p4;
    outLength: base1:outLength * _p1 + base2:outLength * _p2 + base3:outLength * _p3 + base4:outLength * _p4;

    /* This transforms tensions of Infinity to 10000. Then we can interpolate
     * without creating NaN values.
     *
     * NaN is produced when a tension is Infinity and a proportion is zero:
     * Infinity * 0 => NaN.
     * AFAIK this behavior is mathematically correct.
     * But in that case we clearly want a 0 as result, because a proportion
     * of 0 means we don't want to include the master into the Interpolation.
     *
     * 10000 will set the control point very very close to the on-curve
     * point.
     * FIXME: it would be better to keep the Infinity value when all
     * `base*:**Tension` values are Infinity. But I think there is no way
     * to do this right now.
     * something like:
     * ifelse (isInfinity base1:inTension and _p1 equals 0) 0 (base1:inTension * _p1)
     * but that would require the new operators `ifelse` `isInfinity` `equals` `and`
     * and that would require the booleans `true` and `false` also, consequently
     * we'd like also to introduce `not` `or` `isNaN`
     * But we are holding off conditional execution at the moment, because
     * we don't want to introduce to much power/complexity in CPS.
     *
     * (base1:inTension * _p1) elseif (isInfinity base1:inTension and _p1 equals 0) 0
     *
     * In another situation we may wan't to `grow` a control point in
     * an interpolation. For better control, the master `not` having that
     * control point can set the tension value to some big value itself.
     * This is really the workaround for the missing `ifelse` etc.
     * What a good value is must be determined in the case itself. I think
     * it's likely that it would be well under 50 then.
     * FIXME: Thus it may better here to go with a lower replacement value
     * for Infinity, e.g. 10 or 100?
     */
    inTension: (min 10000 base1:inTension) * _p1
             + (min 10000 base2:inTension) * _p2
             + (min 10000 base3:inTension) * _p3
             + (min 10000 base4:inTension) * _p4;

    outTension: (min 10000 base1:outTension) * _p1
              + (min 10000 base2:outTension) * _p2
              + (min 10000 base3:outTension) * _p3
              + (min 10000 base4:outTension) * _p4;

    inDirIntrinsic: (normalizeAngle base1:inDirIntrinsic) * _p1
                  + (normalizeAngle base2:inDirIntrinsic) * _p2
                  + (normalizeAngle base3:inDirIntrinsic) * _p3
                  + (normalizeAngle base4:inDirIntrinsic) * _p4;
    outDirIntrinsic: (normalizeAngle base1:outDirIntrinsic) * _p1
                   + (normalizeAngle base2:outDirIntrinsic) * _p2
                   + (normalizeAngle base3:outDirIntrinsic) * _p3
                   + (normalizeAngle base4:outDirIntrinsic) * _p4;
}

contour > p {
    on: base1:on * _p1 + base2:on * _p2 + base3:on * _p3 + base4:on * _p4;

    inDir: (normalizeAngle base1:inDir) * _p1
         + (normalizeAngle base2:inDir) * _p2
         + (normalizeAngle base3:inDir) * _p3
         + (normalizeAngle base4:inDir) * _p4;
    outDir: (normalizeAngle base1:outDir) * _p1
          + (normalizeAngle base2:outDir) * _p2
          + (normalizeAngle base3:outDir) * _p3
          + (normalizeAngle base4:outDir) * _p4;

    inTension: (min 10000 base1:inTension) * _p1
             + (min 10000 base2:inTension) * _p2
             + (min 10000 base3:inTension) * _p3
             + (min 10000 base4:inTension) * _p4;

    outTension: (min 10000 base1:outTension) * _p1
              + (min 10000 base2:outTension) * _p2
              + (min 10000 base3:outTension) * _p3
              + (min 10000 base4:outTension) * _p4;
}

center > left, center > right {
    onDir: (normalizeAngle base1:onDir) * _p1
         + (normalizeAngle base2:onDir) * _p2
         + (normalizeAngle base3:onDir) * _p3
         + (normalizeAngle base4:onDir) * _p4;
    onLength: base1:onLength * _p1 + base2:onLength * _p2 + base3:onLength * _p3 + base4:onLength * _p4;
}

center {
    on: base1:on * _p1 + base2:on * _p2 + base3:on * _p3 + base4:on * _p4;
    in: base1:in * _p1 + base2:in * _p2 + base3:in * _p3 + base4:in * _p4;
    out: base1:out * _p1 + base2:out * _p2 + base3:out * _p3 + base4:out * _p4;
}

/* terminals overide of skeleton2outline */
center:i(0) > left,
center:i(0) > right {
    inDir: (normalizeAngle base1:inDir) * _p1
         + (normalizeAngle base2:inDir) * _p2
         + (normalizeAngle base3:inDir) * _p3
         + (normalizeAngle base4:inDir) * _p4;
}

center:i(-1) > right,
center:i(-1) > left {
    outDir: (normalizeAngle base1:outDir) * _p1
          + (normalizeAngle base2:outDir) * _p2
          + (normalizeAngle base3:outDir) * _p3
          + (normalizeAngle base4:outDir) * _p4;
}

}
/* end boilerplate two master metapolation */

/* set up this masters super masters */
* {
    baseMaster1: S"master#anyOther";
    baseMaster2: S"master#any";
    baseMaster3: S"master#any";
    baseMaster4: S"master#any";
    proportion1: .25;
    proportion2: .25;
    proportion3: .25;
    proportion4: .25;
}

