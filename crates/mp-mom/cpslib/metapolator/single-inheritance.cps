/* boilerplate single inheritance */

glyph {
    width: baseNode:width;
    height: baseNode:height;
}

center > * {
    inLength: baseNode:inLength;
    outLength: baseNode:outLength;

    inTension: baseNode:inTension;
    outTension: baseNode:outTension;

    inDirIntrinsic: baseNode:inDirIntrinsic;
    outDirIntrinsic: baseNode:outDirIntrinsic;
}

center {
    on: baseNode:on;
    in: baseNode:in;
    out: baseNode:out;
}

contour > p {
    on: baseNode:on;

    inDir: baseNode:inDir;
    outDir: baseNode:outDir;

    inTension: baseNode:inTension;
    outTension: baseNode:outTension;

    inLength: baseNode:inLength;
    outLength: baseNode:outLength;
}

center > left, center > right {
    onDir: baseNode:onDir;
    onLength: baseNode:onLength;
}

/* terminals overide of skeleton2outline */
center:i(0) > left,
center:i(0) > right {
    inDir: baseNode:inDir;
}

center:i(-1) > right,
center:i(-1) > left {
    outDir: baseNode:outDir;
}

component {
    transformation: baseNode:transformation;
    baseGlyphName: baseNode:baseGlyphName;
}
/* end boilerplate single inheritance */
