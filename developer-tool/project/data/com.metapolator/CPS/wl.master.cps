@import 'wired-up.cps';

/* set up this masters parameters */
glyph, center, contour > p {
    widthFactor: 1.3;
}
glyph, center > *, contour > p {
    weightFactor: 0.2;
}

/* A quick, rough fix for a better spacing. A per glyph solution
 * (or a well behaving formula) would yield in a better result.
 * This is only to not make it worse than it has to be.
 */
glyph {
    width: baseNode:width * widthFactor - 70;
}

  glyph#dvI penstroke#bubble center
, glyph#dvDA penstroke#bubble center
, glyph#dvA penstroke#lowerBow center:i(0)
, glyph#dvA penstroke#lowerBow center:i(1)
{
    uniformScale: .5;
}
  glyph#a penstroke#stem center:i(-1)
, glyph#a penstroke#stem center:i(-2)
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
    serifLength: stemWidth * 3 + _serifOffset;
}

/********************
 * compensate for each skeleton/weight setup *
 *                           *****************/

@namespace("glyph#dvA") {
    @namespace(penstroke#upperBow) {
        center:i(1)>right, center:i(1)>left {
            inTension: .9;
        }
    }

    @namespace(penstroke#lowerBow) {
        /* the drop */
        center:i(0), center:i(1) {
            yTranslate: 72.5;
            xTranslate: 65;
        }
        center:i(2) {
            xTranslate: 26;
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
            xTranslate: -84.5;
        }
    }
}

@namespace("glyph#dvI") {
    @namespace(penstroke#sShape) {
        center:i(2) {
            xTranslate: 19.5;
            yTranslate: 0;
        }
        center:i(-3) {
            xTranslate: 19.5;
            yTranslate: 0;
        }

        center:i(-2) {
            xTranslate: 44.2;
            yTranslate: 0;
        }

        center:i(-1) {
            xTranslate: -26;
            yTranslate: 20;
            in: on + Polar 15 deg 342;
        }
        center:i(2) right{
            outTension: 1;
        }
    }
    @namespace(penstroke#verticalConnection) {
        center:i(0) left {
            offset: Vector 0 3;
            inDir: deg 190;
        }
    }
}

@namespace("glyph#dvKHA") {
    @namespace(penstroke#upperBow) {
        center:i(0) > left, center:i(0) > right{
            outTension: 1;
        }
        center:i(1) > left, center:i(1) > right{
            inTension: 1;
        }
    }

    @namespace(penstroke#bowConnection) {
        center:i(0) {
            xTranslate: -91;
        }
    }
    @namespace(penstroke#spiralBow) {
        center:i(-1) > left {
            inDirIntrinsic: deg -8;
        }
        center:i(2) > right {
            outTension: 0.9;
        }
    }
    @namespace("penstroke#stem") {
        center {
            stemFitComepensation: -3;
        }
        center:i(1) {
            yTranslate: 65;
        }
        center:i(2) {
            yTranslate: -45;
        }
        center:i(1) > left {
            outTension: 2;
            outDirIntrinsic: deg -5;
        }
        center:i(2) > left {
            inTesnsion: 2;
            inDirIntrinsic: deg 5;
        }
    }
}
@namespace("glyph#dvDA") {
    @namespace(penstroke#bow) {
        center:i(-1) {
            xTranslate: 60;
            yTranslate: 30;
            in: on + Polar 30 deg 210;
        }
        center:i(-2) > left, center:i(-2) > right {
            outTension: 1;
            outDirIntrinsic: 0;
            outDir: 0;
        }
        center:i(-2) {
            out: on + Polar 30 deg 0;
        }
    }
    @namespace(penstroke#verticalConnection) {
        center:i(0) left {
            offset: Vector 0 5;
            inDir: deg 190;
        }
    }
}
@namespace(glyph#dvDHA) {
    @namespace(penstroke#lowerBow) {
        center:i(0) {
            yTranslate: 25;
        }
    }
    @namespace(penstroke#bowConnection) {
        center:i(-1) {
            xTranslate: 84.5;
        }
    }
}
@namespace(glyph#dvSSA) {
    @namespace(penstroke#bow) {
        center:i(0) right, center:i(0) left {
            weightSummand: 3;
        }
        center:i(0) {
            yTranslate: 10;
        }
        center:i(0) right {
            outTension: 1.5;
        }
        center:i(1) left {
            inTension: .85;
        }
        center:i(1) right {
            outTension: .65;
        }
    }
}
@namespace("glyph#a") {
    @namespace("penstroke#stem") {
        center:i(0) {
            xTranslate: -90;
            yTranslate: 5;
        }
        center:i(1) {
            xTranslate: -50;
        }

        center:i(0) > left,
        center:i(0) > right{
            weightSummand: 1;
        }

        center:i(0) > right {
            outDirIntrinsic: parent:left:outDirIntrinsic;
        }

        center:i(0) > left{
            outDirIntrinsic: deg 15;
            outTension: .8;
        }
        center:i(1) > left{
            inTension: .9;
        }
        center:i(1) > right {
            inTension: 1;
        }

        center:i(-4)>right {
            outTension: .70;
        }
        center:i(-3)>left {
            outTension: 1;
            inTension: 1;
        }
        center:i(-3)>right {
            outTension: 1;
            inTension: 1;
        }
        center:i(-2)>right {
            inTension: 1.2;
        }
    }
    @namespace("penstroke#bowl") {
        center:i(0) {
            yTranslate: 30;
        }

        center:i(0) > left,
        center:i(0) > right{
            weightSummand: 1
        }
        center:i(0) > left,
        center:i(0) > right {
            outTension: 1;
        }
        center:i(-2) > left,
        center:i(-2) > right {
            outTension: 1.2;
        }
        center:i(-1) > left,
        center:i(-1) > right {
            inTension: 1;
        }

    }
}
@namespace(glyph#d) {
    @namespace("penstroke#bowl") {
        center:i(0) {
            yTranslate: 30;
        }
        center:i(1) {
            xTranslate: -30;
        }
    }
    center:i(0) > left {
        outTension: .7;
    }
    center:i(0) > right {
        outTension: .6;
    }
    center:i(1) > left {
        inTension: 1;
    }
    center:i(1) > right {
        inTension: 1.5;
    }
}
@namespace(glyph#h, glyph#n, glyph#m) {
    @namespace("penstroke#arch") {
        center:i(-1) > right,  center:i(-1) > left {
            inTension: 1.6;
            inDirIntrinsic: deg -27;
        }
        center:i(-2) > right, center:i(-2) > left {
            outTension: 1;
        }
    }
}
@namespace(glyph#m) {
    @namespace("penstroke#archLeft") {
        center.connection > right,  center.connection > left {
            inTension: 1.6;
            inDirIntrinsic: deg -27;
        }
        center.vertical > right{
            outTension: 1;
        }
    }
   @namespace("penstroke#archRight") {
        center.connection > right,  center.connection > left {
            inTension: 1.2;
        }
        center.connection {
            targetPoint: targetNode;
            in: _in + Vector 0 -5;
        }
        center.vertical > right {
            outTension: .9;
        }
   }
}


@namespace(glyph#e) {
    @namespace("penstroke#stroke") {
        center:i(1) > left {
            inTension: 1;
            outTension: 1;
        }
        center:i(2) > left {
            inTension: 1
        }
    }
}
@namespace(glyph#s) {
    @namespace(penstroke#sShape) {
        center.drop.bottom {
            xTranslate: 10;
            yTranslate: -8;
        }

        center.drop.top {
            yTranslate: -5;
        }
        center.drop.bottom.fixation > right{
            outTension: 1.6;
        }
        center.horixontal.bottom > right{
            inTension: 1;
        }
        center.vertical.bottom > right{
            outTension: 1;
        }
        center.vertical.top > right{
            inTension: 1;
        }
        center.drop.top.fixation > left{
            inTension: 1.6;
        }
    }
}

@namespace("glyph#j") {
    center {
        extraX: 120;
        xTranslate: extraX;
    }
    @namespace("penstroke#stem") {
        center.horizontal > left {
            outTension: .9;
        }
    }
}

@namespace(glyph#b) {
    @namespace(penstroke#bowl) {
        center.horizontal.top > left {
            outTension: 1.7;
            inTension: 1.5;
        }

        center.connection > left {
            outTension: 1.5;
        }

        center.to-stem > *{
            yTranslate: -30;
            weightSummand: 3;
        }
    }
    @namespace(penstroke#stem) {
        center.bottom {
            pinTo: Vector 0 -35;
        }
    }
    @namespace(contour#C\:terminal) {
        p.top.right {
            inTension: .93;
        }
        p.connection.upper{
            outTension: 1.4;
        }
        p.connection.lower {
            inTension: .53;
        }
        p.bridge {
            outTension: 3.4;
            inTension: 2.5;
        }
        p.bridge {
            _y: -45 + _yRef:y;
            _x: 2 +_xRef:x;
        }
    }
}

@namespace(glyph#c) {
    @namespace("penstroke#cShape") {
        center.horizontal.top > right {
            outTension: 1.1;
            inTension: 1.9;
        }
    }
}

@namespace(glyph#f){
    @namespace("penstroke#stem") {
        center.vertical.left > right {
            outTension: .55;
        }
        center.vertical.left > left {
            outTension: .6;
        }
        center.horizontal.top > right {
            inTension: 1.2;
        }
        center.horizontal.top > left {
            inTension: .9;
        }
    }
}

@namespace(glyph#g) {
    @namespace("penstroke#ear") {
        center.drop {
            yTranslate: 5;
        }
        center.drop.fixation {
            yTranslate: 11;
        }
        center.to-base {
            yTranslate: -15;
            xTranslate: -18;
        }
        center.horizontal>left{
            inTension: 1.1;
        }
        center.vertical>right{
            outTension: .8;
            inTension: 1.2;
        }
        center.to-base>right {
            outTension: 1.5;
        }
        center.to-base>left {
            outTension: 1.5;
        }
        center.to-base>center {
            out: _out + Vector 27 0;
        }
    }
    @namespace("penstroke#leftBowl") {
        center.horizontal.top > right {
            outTension: 1;
        }
        center.vertical.left > right{
            outTension: .8;
            inTension: .8;
        }
        center.vertical.left > left{
            inTension: .65;
        }
    }
    @namespace("penstroke#rightBowl") {
        center.horizontal.top > right {
            inTension: .7;
        }
        center.vertical.right > right{
            outTension: 1;
            inTension: .8;
        }
        center.vertical.right > left{
            outTension: .65;
            inTension: .65;
        }
    }
    @namespace("penstroke#loop") {
        center.end {
            xTranslate: 25;
            yTranslate: 45;
        }
        center.vertical.left.lower {
            yTranslate: 10;
        }
        center.vertical.left.lower > right,
        center.vertical.left.lower > left {
            weightSummand: 3;
        }

        center.horizontal.upper.left > left,
        center.horizontal.upper.left > right {
            inTension: 1;
        }
        center.horizontal.bottom > left{
            inTension: 1;
            outTension: .8;
        }
        center.horizontal.bottom > right {
            inTension: 1;
            outTension: .8;
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
            inTension: 1.1;
            outTension: 1.2;
        }
        center.vertical.left.lower > left {
            inTension: 1.3;
            outTension: 1.2;
        }
        center.end > right {
            inDir: deg 35;
            inTension: 1.5;
        }
        center.end > left {
            inTension: 1.5;
        }
    }
}

@namespace(glyph#p) {
    @namespace("penstroke#bowl") {
        center.connection {
            yTranslate: -30;
        }
    }
    center.connection > left {
        outTension: .9;
    }
    center.connection > right {
        outTension: .7;
    }
}

@namespace(glyph#q) {
    @namespace("penstroke#bowl") {
        center.connection  {
            yTranslate: -30;
        }
    }
    center.connection > right {
        outTension: .85;
    }
    center.connection > left {
        outTension: .75;
    }
}

@namespace(glyph#r) {
    @namespace(penstroke#drop) {
        center.connection {
            yTranslate: -45;
        }
        center.connection > left{
            outTension: .9;
        }
        center.connection > right{
            outTension: 1.1;
        }
        center.drop.fixation > left {
            inTension: 1.1;
        }
        center.drop.fixation > right {
            inTension: 1.1;
            outTension: .6;
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
        center.horizontal > right {
            outTension: .6;
        }
        center.horizontal > left {
            outTension: .8;
        }
    }
}

@namespace(glyph#u) {
    @namespace("penstroke#arch") {
        center.to-stem > right,  center.to-stem > left {
            outTension: 1.6;
            outDirIntrinsic: deg -20;
        }
        center.horizontal > right, center.horizontal > left {
            inTension: .9;
        }
    }
}

@namespace(glyph#v, glyph#w, glyph#y) {
    center {
        extraX: -100;
        xTranslate: extraX;
    }
    penstroke#topLeftSerif center.left,
    penstroke#topCenterSerif center.left {
        _serifOffset: -15;
    }
    penstroke#topLeftSerif center.right,
    penstroke#topCenterSerif center.left {
        _serifOffset: 15;
    }
    penstroke#topRightSerif center.left {
        _serifOffset: 20;
    }
    penstroke#topRightSerif center.right {
        _serifOffset: -20;
    }
}
@namespace(glyph#v) {
    penstroke#downDiagonalOne center.bottom {
        _downDiagonalLengthFactor: .88;
    }
}
@namespace(glyph#w) {
    penstroke#upDiagonalOne center.top {
        _centerConnectionLengthFactor: .85;
    }
    penstroke#downDiagonalOne center.bottom,
    penstroke#downDiagonalTwo center.bottom {
        _downDiagonalLengthFactor: .88;
    }
}

@namespace(glyph#y) {
    penstroke#downDiagonalOne center.bottom {
        _downDiagonalLengthFactor: .89;
    }
    @namespace(penstroke#upDiagonalOne){
        center.diagonal-connection {
            _baselineMovement: .5;
        }
        center.drop {
            dropX: -105;
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
        outTension: 1.1;
    }
}
@namespace(glyph#x) {
    /* outer serifs */
    penstroke#topLeftSerif center.left,
    penstroke#bottomRightSerif center.right {
        _serifOffset: -20;
    }
    penstroke#topRightSerif center.right,
    penstroke#bottomLeftSerif center.left {
        _serifOffset: -30;
    }
    /* inner serifs */
    penstroke#topLeftSerif center.right,
    penstroke#bottomRightSerif center.left {
        _serifOffset: -10;
    }
    penstroke#topRightSerif center.left,
    penstroke#bottomLeftSerif center.right {
        _serifOffset: 10;
    }

    penstroke#upStrokeLeft{
        _xCorrection: 15;
    }
    penstroke#upStrokeRight {
        _xCorrection: -15;
    }

}

@namespace(glyph#z) {
    * {
        _leftAdjust: 55;
        _rightAdjust: -80;
    }
}
