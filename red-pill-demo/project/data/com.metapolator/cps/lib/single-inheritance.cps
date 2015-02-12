/* boilerplate single inheritance */

/* needs "base" of point-child-base.cps */

glyph {
    advanceWidth: base:advanceWidth;
    advanceHeight: base:advanceHeight;
}

point > * {
    inLength: base:inLength;
    outLength: base:outLength;

    inTension: base:inTension;
    outTension: base:outTension;

    inDirIntrinsic: base:inDirIntrinsic;
    outDirIntrinsic: base:outDirIntrinsic;
}

point > center {
    on: base:on;
    in: base:in;
    out: base:out;
}

contour > p {
    on: base:on;

    inDir: base:inDir;
    outDir: base:outDir;

    inTension: base:inTension;
    outTension: base:outTension;
}

point > left, point > right {
    onDir: base:onDir;
    onLength: base:onLength;
}

/* terminals overide of skeleton2outline */
point:i(0) > left,
point:i(0) > right {
    inDir: base:inDir;
}

point:i(-1) > right,
point:i(-1) > left {
    outDir: base:outDir;
}
/* end boilerplate single inheritance */
