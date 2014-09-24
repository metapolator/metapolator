@dictionary {
    point>*{
        indexGlyph: parent:parent:parent:index;
        indexPenstroke: parent:parent:index;
        indexPoint: parent:index;
        equivalent_A: S"master#base":children[indexGlyph]:children[indexPenstroke]:children[indexPoint]:children[index];
        equivalent_B: S"master#bold":children[indexGlyph]:children[indexPenstroke]:children[indexPoint]:children[index];
        proportion_A: .5;
        proportion_B: .5;
    }
}

* {
    on: equivalent_A:on * proportion_A + equivalent_B:on * proportion_B;
    onLength: equivalent_A:onLength * proportion_A + equivalent_B:onLength * proportion_B;
    in: equivalent_A:in * proportion_A + equivalent_B:in * proportion_B;
    out: equivalent_A:out * proportion_A + equivalent_B:out * proportion_B;
    inDir: equivalent_A:inDir * proportion_A + equivalent_B:inDir * proportion_B;
    outDir: equivalent_A:outDir * proportion_A + equivalent_B:outDir * proportion_B;
    onDir: equivalent_A:onDir * proportion_A + equivalent_B:onDir * proportion_B;
    inTension: equivalent_A:inTension * proportion_A + equivalent_B:inTension * proportion_B;
    outTension: equivalent_A:outTension * proportion_A + equivalent_B:outTension * proportion_B;
    inIntrinsic: equivalent_A:inIntrinsic * proportion_A + equivalent_B:inIntrinsic * proportion_B;
    outIntrinsic: equivalent_A:outIntrinsic * proportion_A + equivalent_B:outIntrinsic * proportion_B;
    inDirIntrinsic: equivalent_A:inDirIntrinsic * proportion_A + equivalent_B:inDirIntrinsic * proportion_B;
    outDirIntrinsic: equivalent_A:outDirIntrinsic * proportion_A + equivalent_B:outDirIntrinsic * proportion_B;
    onIntrinsic: equivalent_A:onIntrinsic * proportion_A + equivalent_B:onIntrinsic * proportion_B;
}

point > left,
point > right {
    on: Polar onLength onDir + parent:center:on;
    in: inIntrinsic + parent:center:on + parent:center:inIntrinsic + onIntrinsic;
    out: outIntrinsic + parent:center:on + parent:center:outIntrinsic + onIntrinsic;
    inDir: inDirIntrinsic + parent:center:inDir;
    outDir: outDirIntrinsic + parent:center:outDir;
}
