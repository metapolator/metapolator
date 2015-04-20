* {
}

glyph {
    advanceWidth: originalAdvanceWidth;
    advanceHeight: originalAdvanceHeight;
}

component {
    transformation: originalTransformation;
}

contour > p {
    on: skeleton:on;
    in: tension2controlIn pointBefore:on pointBefore:outDir inTension inDir on;
    out: tension2controlOut on outDir outTension pointAfter:inDir pointAfter:on;
    inDir: (on - skeleton:in):angle;
    outDir: (skeleton:out - on):angle;
    inLength: (on - skeleton:in):length;
    outLength: (skeleton:out - on):length;
    inTension: magnitude2tensionIn pointBefore:on pointBefore:outDir inLength inDir on;
    outTension: magnitude2tensionOut on outDir outLength pointAfter:inDir pointAfter:on;
    pointBefore: parent:children[index - 1];
    pointAfter: parent:children[index+1];
}

contour > p:i(0) {
    pointBefore: parent:children[parent:children:length - 1];
}

contour > p:i(-1) {
    pointBefore: pointAfter: parent:children[0];
}

point > center {
    on: parent:skeleton:on;
    in: parent:skeleton:in;
    out: parent:skeleton:out;
    inDir: (on - in):angle;
    outDir: (out - on):angle;
}

point > * {
    pointBefore: parent:parent:children[parent:index - 1][this:type];
    pointAfter: parent:parent:children[parent:index+1][this:type];
}

point > left,
point > right {
    on: Polar onLength onDir + parent:center:on;
    in: tension2controlIn pointBefore:on pointBefore:outDir inTension inDir on;
    out: tension2controlOut on outDir outTension pointAfter:inDir pointAfter:on;
    inDir: inDirIntrinsic + parent:center:inDir;
    outDir: outDirIntrinsic + parent:center:outDir;
}

point > left {
    onDir: deg 180 + parent:right:onDir;
    onLength: parent:right:onLength;
}

/*opening terminal*/

point:i(0) > left {
    in: tension2controlOut on (inDir + deg 180) inTension parent:right:inDir parent:right:on;
}

point:i(0) > right {
    in: tension2controlIn parent:left:on (parent:left:inDir  + deg 180) inTension inDir on;
}

/*closing terminal*/

point:i(-1) > right {
    out: tension2controlOut on outDir outTension (parent:left:outDir + deg 180) parent:left:on;
}

point:i(-1) > left {
    out: tension2controlIn parent:right:on parent:right:outDir outTension (outDir + deg 180) on;
}