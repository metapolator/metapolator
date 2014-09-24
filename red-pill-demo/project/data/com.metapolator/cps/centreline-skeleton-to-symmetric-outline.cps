* {
    on: onIntrinsic;
    in: inIntrinsic;
    out: outIntrinsic;
    inDir: inDirIntrinsic;
    outDir: outDirIntrinsic;
    inTension: 0;
    outTension: 0;
    inIntrinsic: Vector 0 0;
    outIntrinsic: Vector 0 0;
    onDir: 0;
    inDirIntrinsic: 0;
    outDirIntrinsic: 0;
}

point > center {
    on: onIntrinsic + parent:skeleton:on;
    in: inIntrinsic + on;
    out: outIntrinsic + on;
}

point > left,
point > right {
    on: Polar onLength onDir + parent:center:on;
    in: inIntrinsic + parent:center:on + parent:center:inIntrinsic + onIntrinsic;
    out: outIntrinsic + parent:center:on + parent:center:outIntrinsic + onIntrinsic;
    inDir: inDirIntrinsic + parent:center:inDir;
    outDir: outDirIntrinsic + parent:center:outDir;
}

point > left {
    onDir: deg 180 + parent:right:onDir;
    onLength: parent:right:onLength;
}
