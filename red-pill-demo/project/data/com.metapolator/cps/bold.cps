@dictionary{
    point > * {
        /* howto:  (list (_print parent:parent:parent:index) _print "hint")[0] */
        indexGlyph: parent:parent:parent:index;
        indexPenstroke: parent:parent:index;
        indexPoint: parent:index;
        base: S"master#base":children[indexGlyph]:children[indexPenstroke]:children[indexPoint]:children[index];
    }
    point > left, point > right {
        length: base:onLength * 1.5;
    }
}

* {
    on: base:on;
    in:  base:in;
    out:  base:out;
    inDir:  base:inDir;
    outDir: base:outDir;
    onDir: base:onDir;
    inTension: base:inTension;
    outTension: base:outTension;
    inIntrinsic: base:inIntrinsic;
    outIntrinsic: base:outIntrinsic;
    inDirIntrinsic: base:inDirIntrinsic;
    outDirIntrinsic: base:outDirIntrinsic;
    onIntrinsic: base:onIntrinsic;
}

point > left,
point > right {
    onLength: length;
    on: Polar onLength onDir + parent:center:on;
}
