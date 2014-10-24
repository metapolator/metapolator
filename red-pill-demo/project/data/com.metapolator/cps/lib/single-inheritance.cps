/* boilerplate single inheritance */

/* needs "base" of point-child-base.cps */

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
