@import 'generated/centreline-skeleton-to-symmetric-outline.cps';

glyph {
{{#n}}
    base{{.}}: baseMaster{{.}}[Selector "glyph#" + this:id];
{{/n}}
}

contour > p {
    indexContour: parent:index;
{{#n}}
    base{{.}}: parent:parent:base{{.}}
        :children[indexContour]
        :children[index]
        ;
{{/n}}
}

point > * {
    indexPenstroke: parent:parent:index;
    indexPoint: parent:index;
{{#n}}
    base{{.}}: parent:parent:parent:base{{.}}
        :children[indexPenstroke]
        :children[indexPoint]
        :children[index]
        ;
{{/n}}
}

* {
    /* Ensure that the used proportions sum up to 1.
     * Any other value produces usually unwanted effects.
     * If you don't want this in your master redefine it as
     * interpolationUnit: 1;
     */
    interpolationUnit: 1/(0{{#n}}
        + proportion{{.}}{{/n}});
{{#n}}
    _p{{.}}: proportion{{.}} * interpolationUnit;
{{/n}}
}

glyph {
    advanceWidth: 0{{#n}}
        + base{{.}}:advanceWidth * _p{{.}}{{/n}};
    advanceHeight: 0{{#n}}
        + base{{.}}:advanceHeight * _p{{.}}{{/n}};
}

point > * {
    inLength: 0{{#n}}
        + base{{.}}:inLength * _p{{.}}{{/n}};
    outLength: 0{{#n}}
        + base{{.}}:outLength * _p{{.}}{{/n}};
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
    inTension: 0{{#n}}
        + (min 1000 base{{.}}:inTension * _p{{.}}){{/n}};
    outTension: 0{{#n}}
        + (min 1000 base{{.}}:outTension * _p{{.}}){{/n}};
    inDirIntrinsic: 0{{#n}}
        + (normalizeAngle base{{.}}:inDirIntrinsic) * _p{{.}}{{/n}};
    outDirIntrinsic: 0{{#n}}
        + (normalizeAngle base{{.}}:outDirIntrinsic) * _p{{.}}{{/n}};
}

contour > p {
    on: Vector 0 0{{#n}}
        + base{{.}}:on * _p{{.}}{{/n}};
    inDir: 0{{#n}}
        + (normalizeAngle base{{.}}:inDir) * _p{{.}}{{/n}};
    outDir: 0{{#n}}
        + (normalizeAngle base{{.}}:outDir) * _p{{.}}{{/n}};
    inTension: 0{{#n}}
        + (min 10000 base{{.}}:inTension) * _p{{.}}{{/n}};
    outTension: 0{{#n}}
        + (min 10000 base{{.}}:outTension) * _p{{.}}{{/n}};
}

point > left, point > right {
    onDir: 0{{#n}}
        + (normalizeAngle base{{.}}:onDir) * _p{{.}}{{/n}};
    onLength: 0{{#n}}
        + base{{.}}:onLength * _p{{.}}{{/n}};
}

point > center {
    on: Vector 0 0{{#n}}
        + base{{.}}:on * _p{{.}}{{/n}};
    in: Vector 0 0{{#n}}
        + base{{.}}:in * _p{{.}}{{/n}};
    out: Vector 0 0{{#n}}
        + base{{.}}:out * _p{{.}}{{/n}};
}

/* terminals overide of skeleton2outline */
point:i(0) > left,
point:i(0) > right {
    inDir: 0{{#n}}
        + (normalizeAngle base{{.}}:inDir) * _p{{.}}{{/n}};
}

point:i(-1) > right,
point:i(-1) > left {
    outDir: 0{{#n}}
        + (normalizeAngle base{{.}}:outDir) * _p{{.}}{{/n}};
}

master * {
{{#n}}
    baseMaster{{.}}: master:baseMaster{{.}};
{{/n}}
{{#n}}
    proportion{{.}}: master:proportion{{.}};
{{/n}}
}

/****
 * set up the baseMasters and the proportions of the <MOM Master>:

 master {
{{#n}}
    baseMaster{{.}}: S"master#anyName_{{.}}";
{{/n}}
{{#n}}
    proportion{{.}}: 1;
{{/n}}
}

****/
