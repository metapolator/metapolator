@import 'wired-up.cps';

/* set up this masters parameters */
glyph, center, contour > p {
    widthFactor: 0.7;
}
glyph, center > *, contour > p {
    weightFactor: 1.5;
}


/* A quick, rough fix for a better spacing. A per glyph solution
 * (or a well behaving formula) would yield in a better result.
 * This is only to not make it worse than it has to be.
 */
glyph {
    extraWidth: 180;
    width: baseNode:width * widthFactor + extraWidth;
}


  glyph#dvI penstroke#bubble center
, glyph#dvDA penstroke#bubble center
{
    uniformScale: 1;
}
  glyph#a penstroke#stem center:i(-1)
, glyph#a penstroke#stem center:i(-2)
, center.drop
{
    uniformScale: 1.15;
}
  glyph#dvA penstroke#lowerBow center:i(0)
, glyph#dvA penstroke#lowerBow center:i(1)
{
    uniformScale: 1.2;
}
  glyph#i penstroke#dot center
, glyph#j penstroke#dot center
{
    uniformScale: 1.5;
}
    glyph#s center.drop
{
    uniformScale: 1.25;
}

center {
    serifLength: stemWidth / 6;
}
/********************
 * compensate for each skeleton/weight setup *
 *                           *****************/

@namespace("glyph#dvA") {
    /* moving it back into the viewport */
    center {
        extraX: 105;
        xTranslate: extraX;
    }

    @namespace(penstroke#lowerBow, penstroke#upperBow) {
        center:i(-3) {
            xTranslate: 21 + extraX;
        }
    }

    @namespace(penstroke#upperBow) {
        center:i(-1) > left {
            inTension: 1.1;
            inDirIntrinsic: deg 0;
        }
        center:i(-2) > left {
            on: Polar onLength onDir + parent:on + Vector 17 0;
            outTension: 1.2;
            inTension: 1.5;
        }

        center:i(2) > left {
            outTension: 1.5
        }
        center:i(-3) > left {
            inTension: .5;
            outTension: .5;
        }

    }

    @namespace(penstroke#lowerBow) {
        center:i(-2) left {
            on: penstroke:children[-1]:left:on;
        }
        center:i(-1) left {
            in: on;
        }
        center:i(-2) left {
            out: on;
        }
        /* the drop */
        center:i(0), center:i(1) {
            xTranslate: -91 + extraX;
            yTranslate: -25;
        }
        center:i(2) > left {
            outTension: 1.5
        }
        center:i(-2) > left{
            inTension: 1.5;
        }
        center:i(-3) > left {
            inTension: .5;
            outTension: .5;
        }
        center:i(1) > left {
            outTension: 2;
            inTension: 2;
        }
    }
    @namespace(penstroke#stem) {
        center {
            xTranslate: 112 + extraX;
        }
    }
    @namespace(penstroke#bar) {
        center:i(0) {
            xTranslate: 154 + extraX;
        }
        center:i(1) {
            xTranslate: 45.5 + extraX;
        }
    }
    @namespace(penstroke#bowConnection) {
        center:i(0) {
            xTranslate: 52.5 + extraX;
        }
    }
}

@namespace("glyph#dvI") {
    center {
        extraX: 40;
        xTranslate: extraX;
    }
    @namespace(penstroke#sShape) {
        center:i(0) {
            xTranslate: 31 + extraX;
            yTranslate: 0;
        }
        center:i(1) {
            xTranslate: 14 + extraX;
            yTranslate: 0;
        }
        center:i(-3) {
            xTranslate: 10.5 + extraX;
            yTranslate: 0;
        }
        center:i(-2) {
            xTranslate: -7 + extraX;
            yTranslate: 0;
        }
        center:i(-1) {
            xTranslate: -7 + extraX;
            yTranslate: 0;
        }
    }

    @namespace(penstroke#verticalConnection) {
        center:i(0) left {
            offset: Vector 0 -25;
            inDir: deg 200;
        }
    }
}

@namespace("glyph#dvKHA") {
    /* moving it back into the viewport */
    center {
        extraX: 35;
        xTranslate: extraX;
    }

    @namespace(penstroke#bowConnection) {
        center:i(0) {
            xTranslate: 66.5 + extraX;
        }
        center:i(1) {
            target: spiralBow:children[0]:right:on:x;
            pinTo: Vector (target-_on:x) 0;
        }
    }
    @namespace("penstroke#spiralBow") {
        center:i(-1), center:i(-2), center:i(-3), center:i(-4), center:i(-5) {
                spiralOffset: 119;
                individualOffset: 0;
                xTranslate: extraX + spiralOffset + individualOffset;
        }
        center:i(1) {
            xTranslate: extraX + 42;
        }
        center:i(2) {
            xTranslate: extraX + 63;
        }
        center:i(-5) {
            individualOffset: 21
        }
        center:i(-4) {
            individualOffset: -10.5
        }
        center:i(-3) {
            individualOffset: -28
        }
        center:i(-2) {
            individualOffset: -7
        }
        center:i(-1) {
            individualOffset: 10.5;
        }
        center:i(-1) left,  center:i(-1) right{
            weightSummand: 5;
        }
        center:i(2) left,  center:i(2) right{
            outTension: .9;
        }
        center:i(-4) left {
            inTension: 2;

        }
        center:i(-3) left {
            inTension: 1;
            outTension: 1;
        }
        center:i(-1) right {
            inTension: 1.5;
        }
    }
    @namespace("penstroke#stem") {
        center {
            stemFitComepensation: right:onLength * 0.45;
        }
    }
    @namespace("penstroke#bar") {
        center:i(0) {
            xTranslate: extraX + 224;
        }
    }
}
@namespace("glyph#dvBHA") {
    center {
        extraX: 20;
        xTranslate: extraX;
    }
    @namespace("penstroke#bow") {
        center:i(1) {
            xTranslate: -10.5 + extraX;
        }
        center:i(2) {
            xTranslate: 5.6 + extraX;
        }
        center:i(-3) {
            xTranslate: 35 + extraX;
        }
        center:i(-2) {
            xTranslate: 3.5 + extraX;
        }
        center:i(-1) {
            xTranslate: -10.5 + extraX;
        }
        center:i(2) > left {
            inTension: 1.3;
            outTension: 1.8;
        }
        center:i(-2) > left{
            outTension: 2;
            inTension: 3;
        }
        center:i(-1) > left{
            inTension: .8;
            inDirIntrinsic: deg -3;
        }
    }
    @namespace("penstroke#stem") {
        center {
            xTranslate: 108.5 + extraX;
        }
    }
    @namespace("penstroke#bar") {
        center:i(0) {
            xTranslate: 147 + extraX;
        }
        center:i(-1) {
            xTranslate: 63 + extraX;
        }

    }
}
@namespace("glyph#dvDA") {
    center {
        extraX: 77;
        xTranslate: extraX;
    }
    @namespace(penstroke#bar) {
        center:i(0) {
            xTranslate: extraX - 49;
        }
        center:i(-1) {
            xTranslate: extraX + 35;
        }
    }
    @namespace(penstroke#bow) {
        center:i(2) {
            xTranslate: extraX - 28;
        }
    }
    @namespace(penstroke#verticalConnection) {
        center:i(0) left {
            offset: Vector 0 -25;
            inDir: deg 200;
        }
    }
}
@namespace(glyph#dvDHA) {
    center {
        extraX: 77;
        xTranslate: extraX;
    }
    @namespace(penstroke#upperBow) {
        center:i(-2) {
            xTranslate: -25.2 + extraX;
        }
        center:i(-1) {
            xTranslate: -21 + extraX ;
        }
        center:i(-1) > right {
            inTension: .75;
        }
        center:i(0) > right {
            outTension: .9;
        }
    }
    @namespace(penstroke#lowerBow) {
        center:i(-2) {
            xTranslate: -25.2 + extraX ;
        }
        center:i(0) {
            xTranslate: 14 + extraX;
        }
    }
    @namespace(penstroke#bowConnection) {
        center:i(-1) {
            xTranslate: -59.5 + extraX;
        }
    }
    @namespace(penstroke#leftBar) {
        /* move this 0 center x to upperBow -1 right x */
        center:i(0) {
            targetPoint: upperBow:children[-1];
            target: targetPoint:_on:x;
            rightOffset: (Polar targetPoint:right:onLength targetPoint:right:onDir):x;
            pinTo: Vector (target + rightOffset - this:_on:x) 0;
        }
        center:i(-1) {
            xTranslate: -21;
        }
    }
    @namespace(penstroke#rightBar) {
        center:i(0) {
            xTranslate: 112 + extraX;
        }
        center:i(1) {
            xTranslate: 17.5 + extraX;
        }
    }
}
@namespace(glyph#dvSSA) {
    center {
        extraX: 77;
        xTranslate: extraX;
    }
    @namespace(penstroke#bow) {
        center:i(0) {
            xTranslate: 30.1 + extraX;
        }
        center:i(1) {
            xTranslate: 24.5 + extraX;
        }
        center:i(0) > right{
            outTension: 2;
        }
        center:i(1) > right{
            outTension: 1;
            inTension: .9;
        }
    }
    @namespace(penstroke#bar) {
        center:i(0) {
            xTranslate: 126 + extraX;
        }
        center:i(-1) {
            xTranslate: -42  + extraX;
        }
    }
}
@namespace(glyph#a) {
    center {
        extraX: 77;
        xTranslate: extraX;
    }
    @namespace(penstroke#stem){
        center:i(0) {
            xTranslate: 120 + extraX;
            yTranslate: 0;
        }

        center:i(0) > right{
            weightSummand: 3;
             outTension: 1;
        }

        center:i(1) {
            xTranslate: 100 + extraX;
        }

        center:i(2),
        center:i(3) {
            xTranslate: 60 + extraX;
        }

        center:i(-1),
        center:i(-2) {
            xTranslate: -25 + extraX;
        }

        center:i(1)>right{
            inTension: 1;
            outTension: .75;
        }

        center:i(1)>left,
        center:i(1)>right {
            sinTension: Infinity;
        }

    }
    @namespace(penstroke#bowl) {
        center:i(2) {
            xTranslate: -15 + extraX;
        }
        center:i(1) {
            xTranslate: -10 + extraX;
        }
        center:i(0) {
            xTranslate: 10 + extraX;
        }
    }
}
@namespace(glyph#d) {
    center {
        extraX: 100;
        xTranslate: extraX;
    }
    @namespace(penstroke#stem) {
        center {
            xTranslate: 20 + extraX;
        }
    }
    @namespace(penstroke#bowl) {
        center:i(1) {
            xTranslate: -10 + extraX;
        }
        center:i(2) {
            xTranslate: -28 + extraX;
        }
        center:i(-2) {
            xTranslate: -15 + extraX;
        }
        center:i(1) > right {
            inTension: 3;
            outTension: 2.5;
        }
        center:i(-2) > right {
            outTension: 3;
            inTension: 2.5;
        }
    }
}

@namespace(glyph#h, glyph#n) {
    center {
        extraX: 77;
        xTranslate: extraX;
    }
    @namespace("penstroke#arch") {
        /* move all points, we want to make it wider here*/
        center {
            origin: penstroke:children[-1]:_on:x;
            target: stem:children[0]:right:on:x;
            pinTo: Vector (target - origin) 0;
        }
        center:i(-2) > left {
            inTension: 2.3;
            soutTension: 1;
        }
    }
    penstroke#bottomLeftSerif center.serif.bottom.right,
    penstroke#bottomRightSerif center.serif.bottom.left {
        serifLength: 0;
    }

}


glyph#m {
    extraWidth: 280;
}
@namespace(glyph#m) {
    center {
        extraX: 77;
        xTranslate: extraX;
    }
    /* move all points, we need to make it wider here*/
    penstroke#archLeft center,
    penstroke#archRight center {
        origin: penstroke[S"center.connection"]:_on:x;
        pinTo: Vector (target - origin) 0;
        target: penstroke[S"center.connection"]:target;
    }
    penstroke#archRight center {
        target: penstroke[S"center.connection"]:target;
    }
    penstroke#archRight center.connection {
        target: _target - 8;
    }
    penstroke#archLeft center:i(-2) > left {
        inTension: 2.3;
        outTension: 1;
    }
    penstroke#archRight center:i(-2) > left {
        inTension: 2.3;
        outTension: 1;
    }
    penstroke#bottomLeftSerif center.serif.bottom.right,
    penstroke#bottomRightSerif center.serif.bottom.left,
    penstroke#bottomCenterSerif center.serif.bottom {
        serifLength: 0;
    }
}

@namespace(glyph#l) {
    center {
        extraX: 77;
        xTranslate: extraX;
    }
}
@namespace(glyph#k) {
    penstroke#bottomSerif center.right {
        serifLength: 0;
    }
    center {
        extraX: 77;
        xTranslate: extraX;
    }
    @namespace(penstroke#tail) {
        center {
            xTranslate: 50 + extraX;
        }
        .south-east > left {
            onLength: 80;
            inTension: Infinity;
            outDir: (on - penstroke[S".to-diagonal left"]:on):angle;
        }
        .to-diagonal > left {
            outTension: Infinity;
        }
    }
}
@namespace(glyph#e) {
    center {
        extraX: 97;
        xTranslate: extraX;
    }
    @namespace("penstroke#stroke") {
        center:i(1) > left {
            inTension: 2.7;
            outTension: 2.7;
        }
        center:i(0) {
            xTranslate: 32 + extraX;
        }
        center:i(2) {
            xTranslate: -32 + extraX;
        }
    }
}
@namespace(glyph#s) {
    center, center > * {
        xTranslate: extraX;
        extraX: 50;
    }
    @namespace(penstroke#sShape) {
        center.horizontal.top  {
            xTranslate: 25 + extraX;
        }
        center.drop.top {
            xTranslate: 25 + extraX;
            yTranslate: 5;
        }
        center.horizontal.bottom {
            xTranslate: -15 + extraX;
        }
        center.drop.bottom  {
            xTranslate: -22 + extraX;
            yTranslate: -10;
        }
    }
}
@namespace("glyph#i, glyph#j") {
    center, center > * {
        xTranslate: extraX;
        extraX: 50;
    }
    @namespace("penstroke#dot") {
        center {
            dotFixation: penstroke:children[-1]:baseNode:on;
        }
    }
}
@namespace("glyph#j") {
    center, center > * {
        extraX: 120;
    }
    @namespace("penstroke#stem") {
        center.drop {
            xTranslate: -25 + extraX;
        }
    }
}


@namespace(glyph#o) {
    center {
        xTranslate: extraX;
        extraX: 97;
    }
    center.horizontal > left {
        horizontalInnerTension: 2.7;
    }
    center.vertical {
        verticalXTranslate: 30;
    }
    penstroke#left center.vertical {
        xTranslate: -verticalXTranslate + extraX;
    }
    penstroke#right center.vertical {
        xTranslate: verticalXTranslate + extraX;
    }
    penstroke#left center.horizontal.top > left {
        outTension: horizontalInnerTension;
    }
    penstroke#left center.horizontal.bottom > left {
        inTension: horizontalInnerTension;
    }
    penstroke#right center.horizontal.top > left {
        inTension: horizontalInnerTension;
    }
    penstroke#right center.horizontal.bottom > left {
        outTension: horizontalInnerTension;
    }
}

@namespace(glyph#b) {
    center {
        extraX: 100;
        xTranslate: extraX;
    }
    /*
    @namespace(penstroke#stem) {
        center {
            xTranslate: 20 + extraX;
        }
    }
    */
    @namespace(penstroke#bowl) {
        center.horizontal.top,
        center.connection {
            xTranslate: 37 + extraX;

        }
        center.vertical.right {
            xTranslate: 63 + extraX;
        }
        center.horizontal.top > left {
            inTension: 2.4;
            outTension: 1.8;
        }
        center.horizontal.to-stem > left {
            inTension: 2.1;
        }
        center.vertical.right>left {
            outTension: 1;
        }
        center.connection>left {
            outTension: 2.4;
        }
    }
    @namespace(contour#C\:terminal) {
        p.connection.upper {
            outTension: 2.1;
        }
        p.bridge {
            _y: baseNode:on:y;
            _x: -30 + _xRef:x;
        }
    }
}

@namespace(glyph#c) {
    center, center > * {
        extraX: 85;
        xTranslate: extraX;
    }
    @namespace("penstroke#cShape") {
        center.drop {
            xTranslate: 15 + extraX;
        }
        center.vertical.left {
            xTranslate: -40 + extraX;
        }
    }
}
@namespace(glyph#f) {
    center {
        extraX: 55;
        xTranslate: extraX;
    }
    @namespace("penstroke#stem") {
        center.drop {
            xTranslate: 25 + extraX;
        }
    }
    @namespace("penstroke#horizontalStroke") {
        center.right {
            xTranslate: 35 + extraX;
        }
    }
}

@namespace(glyph#g) {
    center, center > * {
        extraX: 80;
        xTranslate: 25 + extraX;
    }
    @namespace("penstroke#ear") {
        center {
            earX: 30;
        }
        center.drop {
            xTranslate: 30 + earX + extraX;
            yTranslate: -10;
        }
        center.horizontal {
            xTranslate: 10 + earX + extraX;
        }
        center.vertical {
            xTranslate: -15 + earX + extraX;
            yTranslate: 10;
        }

        center.to-base {
            yTranslate: 15;
            xTranslate: 5 + earX + extraX;;
        }
        center.horizontal>right{
            inTension: 1.1;
        }

        center.vertical>right{
            outTension: 1.1;
        }
        center.to-base {
            out: _out + Vector -15 0;
        }

    }

    @namespace("penstroke#leftBowl, penstroke#rightBowl") {
        center.vertical.left {
            xTranslate: -20 + extraX;
        }
        center.vertical.right {
            xTranslate: 58 + extraX;
        }
    }

    @namespace("penstroke#leftBowl") {
        center.horizontal.top > left {
            outTension: 1.9;
        }
        center.vertical.left > left {
            inTension: 1.7;
            outTension: 1.7;
        }
        center.horizontal.bottom > left {
            inTension: 1.5;
        }
    }
    @namespace("penstroke#rightBowl") {

        center.horizontal.top > left {
            inTension: 1.9;
        }
        center.vertical.right > left {
            inTension: 1.7;
            outTension: 1.4;
        }
        center.horizontal.bottom > left {
            outTension: 1.8;
        }
    }
    @namespace("penstroke#loop") {
        center.vertical.left.upper,
        center.vertical.left.lower,
        center.end {
            xTranslate: -45 + extraX;
        }
        center.vertical.right {
            xTranslate: 90 + extraX;
        }
        center.vertical.upper.left > left{
            outTension: 1.3;
        }
    }
}

@namespace(glyph#p) {
    center {
        extraX: 100;
        xTranslate: extraX;
    }
    @namespace(penstroke#bowl) {
        center.horizontal.top {
            xTranslate: 45 + extraX;
        }
        center.vertical {
            xTranslate: 48 + extraX;
        }
        center.horizontal.bottom {
            xTranslate: 45 + extraX;
        }
        center.horizontal.top > right {
            inTension: 3;
            outTension: 2.5;
        }
        center.horizontal.bottom > right {
            outTension: 3;
            inTension: 2.5;
        }
    }
}

@namespace(glyph#q) {
    center {
        extraX: 100;
        xTranslate: extraX;
    }
    @namespace(penstroke#bowl) {
        center.horizontal.top {
            xTranslate: -45 + extraX;
        }
        center.vertical {
            xTranslate: -48 + extraX;
        }
        center.horizontal.bottom {
            xTranslate: -45 + extraX;
        }
        center.horizontal.top > left {
            inTension: 3;
            outTension: 2.5;
        }
        _center.horizontal.bottom > left {
            outTension: 3;
            inTension: 2.5;
        }
    }
}

@namespace(glyph#r) {
    center {
        extraX: 100;
        xTranslate: extraX;
    }
    @namespace(penstroke#drop) {
       center.drop > center {
            xTranslate: 75 + extraX;
        }
        center.connection > left{
            weightSummand: 5;
        }
        center.connection > left{
            outTension: .47;
        }
    }
}

@namespace(glyph#t) {
    center {
        extraX: 100;
        xTranslate: extraX;
    }
    penstroke#stem center.terminal,
    penstroke#horizontalStroke center.right {
        xTranslate: 20 + extraX;
    }
    @namespace(penstroke#stem) {
        center.horizontal {
            xTranslate: 10 + extraX;
        }
        center.terminal > right {
            outTension: 3;
        }
        center.horizontal > right {
            outTension: 2.3;
            inTension: 2.3
        }
    }
}

@namespace(glyph#u) {
    center {
        extraX: 77;
        xTranslate: extraX;
    }
    @namespace("penstroke#stem") {
        /* move all points, we want to make it wider here*/
        center {
            xTranslate: 62 + extraX;
        }
    }
    @namespace("penstroke#arch") {
        center.horizontal > right {
            inTension: 2.3;
            outTension: 2.3;
        }
    }
    penstroke#topRightSerif center.serif.top.left {
        serifLength: 0;
    }
}
@namespace(glyph#v, glyph#w, glyph#y) {
    center {
        extraX: 100;
        xTranslate: extraX;
    }
    penstroke#topLeftSerif center.right,
    penstroke#topCenterSerif center.right,
    penstroke#topRightSerif center.left {
        serifLength: 0;
    }

}
@namespace(glyph#v) {
    penstroke#downDiagonalOne center.bottom {
        _downDiagonalLengthFactor: -.5;
    }
}
@namespace(glyph#w) {
    penstroke#upDiagonalOne center.top {
        _centerConnectionLengthFactor: 1.1;
    }
    penstroke#downDiagonalOne center.bottom,
    penstroke#downDiagonalTwo center.bottom {
        _downDiagonalLengthFactor: -.35;
    }
}
@namespace(glyph#y) {
    penstroke#downDiagonalOne center.bottom {
        _downDiagonalLengthFactor: -.6;
    }
    @namespace(penstroke#upDiagonalOne){
        center.diagonal-connection {
            _baselineMovement: 0;
        }
        center.drop.fixation left {
            weightSummand: -45;
        }
    }
}

@namespace(glyph#x) {
    center {
        extraX: 100;
        xTranslate: extraX;
    }
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
        serifLength: 0;
    }
    penstroke#topRightSerif center.left,
    penstroke#bottomLeftSerif center.right {
        serifLength: 0;
    }
    penstroke#upStrokeLeft{
        _xCorrection: -70;
    }
    penstroke#upStrokeRight {
        _xCorrection: 70;
    }
}

@namespace(glyph#z) {
    * {
        xTranslate: 75;
        _leftAdjust: -45;
        _rightAdjust: 55;
    }
}
