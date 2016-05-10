@import 'wired-up.cps';

/* set up this masters parameters */
glyph, center, contour > p  {
    widthFactor: 0.5;
}
glyph, center > *, contour > p {
    weightFactor:  .2;
}

  glyph#dvI penstroke#bubble center
, glyph#dvDA penstroke#bubble center
, glyph#dvA penstroke#lowerBow center:i(0)
, glyph#dvA penstroke#lowerBow center:i(1)
{
    uniformScale: .5;
}

, glyph#a penstroke#stem center:i(-1)
, glyph#a penstroke#stem  center:i(-2)
, center.drop
{
    uniformScale: .35;
}

glyph#s center.drop {
    uniformScale: .6;
}

    glyph#i penstroke#dot center
,   glyph#j penstroke#dot center
,   glyph#y center.drop
{
    uniformScale: .45;
}

center {
    _serifOffset: 0;
    serifLength: stemWidth * 1.4 + _serifOffset;
}
/********************
 * compensate for each skeleton/weight setup *
 *                           *****************/


@namespace("glyph#dvA") {
    @namespace(penstroke#upperBow) {
        center:i(0)>right {
            outTension: .9;
        }
    }
    @namespace(penstroke#lowerBow) {
        /* the drop */
        center:i(0), center:i(1) {
            yTranslate: 47.5;
        }
        center:i(2) {
            xTranslate: 5;
        }
        center:i(2) > left{
           inTension: 1.3;
        }
        center:i(1) > right {
            outTension: .9;
        }
        center:i(2) > right {
            inTension: .9;
        }
    }
    @namespace(penstroke#bowConnection) {
        center:i(0) {
            xTranslate: -45;
        }
    }
}

@namespace("glyph#dvI") {
    @namespace(penstroke#sShape) {
        center:i(-3) {
            xTranslate: 20;
            yTranslate: -10;
        }
    }
    @namespace(penstroke#verticalConnection) {
        center:i(0) left {
            offset: Vector 0 14;
        }
    }
}
@namespace("glyph#dvKHA") {
    @namespace(penstroke#bowConnection) {
        center:i(0)  {
            xTranslate: -27;
        }
    }
    @namespace("penstroke#spiralBow") {
        center:i(2) {
            xTranslate: 5;
        }
        center:i(-5) {
            xTranslate: 2.5;
        }
        center:i(-2) {
            xTranslate: 1;
        }
        center:i(-2) > left,  center:i(-2) > right,
        center:i(-1) > left,  center:i(-1) > right {
            weightSummand: 1;
        }
        center:i(2) > left{
            outTension: 1.15;
        }
        center:i(-2) > left {
            outTension: 1;
        }
        center:i(-2) > right {
            outTension: 1;
        }
        center:i(-1) > left {
            inTension: 1;
            inDirIntrinsic: deg -9;
        }
    }

    @namespace("penstroke#stem") {
        center {
            stemFitComepensation: -3;
        }
        center:i(1) > left {
            outTension: 15;
            outDirIntrinsic: deg -12;
        }
        center:i(2) > left {
            inTesnsion: 15;
            inDirIntrinsic: deg 12;
        }
    }
}

@namespace("glyph#dvBHA") {
    @namespace("penstroke#bow") {
        center:i(-3) {
            xTranslate: 5;
        }
        center:i(-2) > right {
            inTension: 1.4;
        }
        center:i(-4) > right {
            outTension: 1.4;
        }
        center:i(2) > left {
            inTension: 1.15;
        }
    }
}
@namespace("glyph#dvDA") {
    @namespace(penstroke#verticalConnection) {
        center:i(0) left {
            offset: Vector 0 10;
        }
        center:i(0) left {
            inDir: deg 180;
        }
    }
}
@namespace(glyph#dvDHA) {
    @namespace(penstroke#bowConnection) {
        center:i(-1) {
            xTranslate: 35.5;
        }
    }
    @namespace(penstroke#upperBow) {
        center:i(0) > left {
            outTension: 1.1;
        }
    }
    @namespace(penstroke#upperBow) {
        center:i(-2) > left {
            outTension: 1.3;
        }
        center:i(-2)  {
            xTranslate: -6;
        }
    }
    @namespace(penstroke#lowerBow) {
        center:i(-2) > left {
            outTension: 4;
        }
    }
}
@namespace(glyph#dvSSA) {
    @namespace(penstroke#bow) {
        center:i(0) > right, center:i(0) > left {
            weightSummand: 3;
        }
        center:i(0) {
            yTranslate: -18;
        }
        center:i(1) {
            xTranslate: -2.5;
        }
        center:i(2) {
            yTranslate: -23;
        }

        center:i(0) left {
            outTension: 1.2
        }
        center:i(1) left {
            inTension: .8;
            outTension: 1.2;
        }

        center:i(2) left {
            inTension: .7;
        }

        center:i(0) right {
            outTension: 1.2;
        }

        center:i(1) right {
            inTension: 1;
            outTension: 1.2;
        }
    }
}

@namespace("glyph#a") {
    @namespace("penstroke#stem") {
        center:i(-3) {
            xTranslate: 5;
        }
        center:i(-2),
        center:i(-1) {
            yTranslate: 25;
        }
        center:i(0) > left,
        center:i(0) > right {
            weightSummand: 1.5;
        }

        center:i(0) > right {
            outDirIntrinsic: parent:left:outDirIntrinsic;
        }

        center:i(-4) > right {
            outTension: .6;
        }
        center:i(-3) > left {
            outTension: 1.3;
            inTension: 1.15;
        }
        center:i(-3) > right {
            outTension: 1;
            inTension: .92;
        }
        center:i(-2)>left {
            inTension: 1;
        }
        center:i(-2)>right {
            inTension: 1.5;
        }
    }
    @namespace("penstroke#bowl") {
        center:i(2) {
            xTranslate: -15;
        }
        center:i(0) > left,
        center:i(0) > right {
            outTension: 1;
        }
        center:i(1) > left {
            inTension: 1.1;
            outTension: 1.5;
        }
        center:i(2) > right {
            outTension: 1.1;
        }
    }
}


@namespace(glyph#m) {
    @namespace("penstroke#archLeft") {
        center.vertical > right{
            outTension: 1.3;
        }
    }
}

@namespace(glyph#k) {
    @namespace(penstroke#tail) {
        .terminal > left {
            inTension: 1.15;
        }
    }
}


@namespace(glyph#s) {
    @namespace(penstroke#sShape) {
        center.drop.bottom {
            yTranslate: -25;
            xTranslate: 5;
        }
        center.horizontal.bottom {
            xTranslate: -8;
        }
        center.vertical.bottom {
            xTranslate: 10;
            yTranslate: 5;
        }

        center.vertical.top {
            xTranslate: -10;
            yTranslate: -5;
        }
        center.horizontal.top {
            xTranslate: 4;
        }
        center.drop.top {
            yTranslate: 20;
        }
        center.horizontal.bottom > left {
            inTension: .65;
        }
        center.horizontal.bottom > right {
            inTension: .75;
        }

        center.horizontal.top > right {
            inTension: .65;
            outTension: .65;
        }
        center.horizontal.top > left {
            inTension: .75;
        }
    }
}

@namespace("glyph#j") {
    center {
        extraX: 80;
        xTranslate: extraX;
    }
    @namespace("penstroke#stem") {
        center.vertical > left {
            outTension: .7;
        }
        center.horizontal > left {
            inTension: 1.2;
        }
        center.horizontal > right{
            outTension: 1.2;
        }
    }
}

@namespace(glyph#b) {
    @namespace(penstroke#bowl) {
        center.horizontal.top > left {
            outTension: 1.7;
        }
        center.to-stem > *{
            weightSummand: 3;
        }
    }
    @namespace(penstroke#stem) {
        center.bottom {
            pinTo: Vector 0 -85;
        }
    }
    @namespace(contour#C\:terminal) {
        p.top.right {
            inTension: .6;
        }
        p.connection.upper{
            outTension: 2;
        }
        p.connection.lower {
            inTension: .6;
        }
        p.bridge {
            outTension: 2;
            _y: -35 + _yRef:y;
            _x: 3 + _xRef:x;
        }
    }
}
@namespace(glyph#c){
    @namespace("penstroke#cShape") {
        center.drop {
            yTranslate: 10;
        }
        center.horizontal.top > right {
            outTension: 1.3;
        }
        center.drop.fixation > right {
            inTension: .75;
        }
        center.vertical.left > left {
            outTension: 1.2;
        }
    }
}

@namespace(glyph#f){
    @namespace("penstroke#stem") {
        center.top.drop{
            yTranslate: 10;
        }
        center.vertical.left > left {
            outTension: .7;
        }
        center.horizontal.top > left {
            inTension: 1.2;
        }
    }
}
@namespace(glyph#g) {
    @namespace("penstroke#ear") {
        center.drop {
            yTranslate: 5;
        }
        center.drop.fixation {
            yTranslate: 15;
        }
        center.to-base {
            yTranslate: -9;
            xTranslate: -9;
            out: _out + Vector 7 0;
        }
        center.vertical {
            xTranslate: -20;
        }
        center.horizontal>left{
            inTension: 1.1;
        }
        center.vertical>left{
            outTension: 1;
            inTension: 1;
        }
        center.vertical>right{
            outTension: 1;
            inTension: .9;
        }
    }
    @namespace("penstroke#leftBowl") {
        center.horizontal.top > left {
            outTension: 1.7;
        }
        center.horizontal.bottom > left {
            inTension: 1.7;
        }
    }
    @namespace("penstroke#rightBowl") {
        center.horizontal.top > left {
            inTension: 1.7;
        }
        center.horizontal.bottom > left {
            outTension: 1.7;
        }

    }
    @namespace("penstroke#loop") {
        center.horizontal.upper.left {
            xTranslate: 15;
        }
        center.end {
            xTranslate: 20;
            yTranslate: 50;
        }
        center.vertical.left.lower > right,
        center.vertical.left.lower > left {
            weightSummand: 3;
        }
        center.vertical.left.lower {
            yTranslate: 10;
        }

        center.horizontal.upper.left > left,
        center.horizontal.upper.left > right {
            inTension: 1;
        }
        center.horizontal.bottom > left{
            inTension: 1;
            outTension: .55;
        }
        center.horizontal.bottom > right {
            inTension: 1;
            outTension: .65;
        }
        center.horizontal.upper.right > right {
            outTension: .8;
        }
        center.horizontal.upper.right > left {
            outTension: .8;
        }
        center.vertical.right > right {
            outTension: 1.2;
            inTension: 1;
        }
        center.vertical.right>left {
            outTension: 1;
        }
        center.vertical.left.lower > right {
            inTension: .8;
        }
        center.vertical.left.lower > left {
            inTension: 1.8;
        }
        center.end > right {
            inDir: deg 60;
        }
        center.end > left {
            inTension: 1.5;
        }
    }
}

@namespace(glyph#t) {
    @namespace("contour#C\:inStroke") {
        p.bottom.left {
            inDir: deg 230;
        }
        p.top.left {
            outDir: deg 268;
        }
    }
    @namespace("penstroke#stem") {
        center.horizontal > right{
            outTension: 1.2;
        }
    }
}

@namespace(glyph#u) {
    @namespace("penstroke#arch") {
        center.to-stem > right{
            outTension: 1.6;
        }
    }
}

@namespace(glyph#v, glyph#w, glyph#y) {
    penstroke#topLeftSerif center.left,
    penstroke#topCenterSerif center.left {
        _serifOffset: -5;
    }
    penstroke#topLeftSerif center.right,
    penstroke#topCenterSerif center.right {
        _serifOffset: 5;
    }
    penstroke#topRightSerif center.left {
        _serifOffset: 7;
    }
    penstroke#topRightSerif center.right {
        _serifOffset: -7;
    }
}
@namespace(glyph#v) {
    penstroke#downDiagonalOne center.bottom {
        _downDiagonalLengthFactor: .6;
    }
}
@namespace(glyph#w) {
    penstroke#upDiagonalOne center.top {
        _centerConnectionLengthFactor: 1;
    }
    penstroke#downDiagonalOne center.bottom,
    penstroke#downDiagonalTwo center.bottom {
        _downDiagonalLengthFactor: .63;
    }
}
@namespace(glyph#y) {
    penstroke#downDiagonalOne center.bottom {
        _downDiagonalLengthFactor: .64;
    }
    @namespace(penstroke#upDiagonalOne){
        center.diagonal-connection {
            _baselineMovement: 0;
        }
        center.drop {
            dropX: 0;
            xTranslate: dropX;
        }
        center.drop.fixation {
            xTranslate: 15 + dropX;
        }
        center.drop.fixation left {
            weightSummand: -45;
        }
    }
    penstroke#upDiagonalOne .drop.terminal left {
        outTension: .8;
    }
    penstroke#upDiagonalOne .drop.fixation left {
        inTension: 1.3;
        outTension: 1.6;
    }
    penstroke#upDiagonalOne .drop.fixation right {
        outTension: 1.25;
    }
}

@namespace(glyph#x) {
    /* outer serifs */
    penstroke#topLeftSerif center.left,
    penstroke#bottomRightSerif center.right {
        _serifOffset: -10;
    }
    penstroke#topRightSerif center.right,
    penstroke#bottomLeftSerif center.left {
        _serifOffset: -15;
    }
    /* inner serifs */
    penstroke#topLeftSerif center.right,
    penstroke#bottomRightSerif center.left {
        _serifOffset: -5;
    }
    penstroke#topRightSerif center.left,
    penstroke#bottomLeftSerif center.right {
        _serifOffset: 5;
    }
}

@namespace(glyph#z) {
    * {
        _leftAdjust: 15;
        _rightAdjust: -25;
    }
}
