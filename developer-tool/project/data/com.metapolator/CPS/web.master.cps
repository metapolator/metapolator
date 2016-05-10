@import 'wired-up.cps';

/* set up this masters parameters */
glyph, center, contour > p  {
    widthFactor: 1.3;
}
glyph, center > *, contour > p {
    weightFactor: 1.5;
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
    _serifOffset: 0;
    serifLength: stemWidth / 4 + _serifOffset;
}
/********************
 * compensate for each skeleton/weight setup *
 *                           *****************/

@namespace("glyph#dvA") {
    @namespace(penstroke#lowerBow) {
        center:i(0), center:i(1) {
            yTranslate: -30;
        }
        center:i(1) > left {
            outTension: 2;
            inTension: 2;
        }
    }
    @namespace(penstroke#bowConnection) {
        center:i(0) {
            xTranslate: 71.5;
        }
    }
}

@namespace("glyph#dvI") {
    @namespace(penstroke#sShape) {
        center:i(0) {
            xTranslate: 36;
            yTranslate: 8.4;
        }

        center:i(1) {
            xTranslate: 0;
            yTranslate: 8.4;
        }

        center:i(2) {
            xTranslate: 12;
            yTranslate: 0;
        }

        center:i(-3) {
            xTranslate: 18;
            yTranslate: -6;
        }

        center:i(-2) {
            xTranslate: 18;
            yTranslate: 0;
        }

        center:i(-1) {
            xTranslate: -36;
            yTranslate: 18;
            in: on + Polar 15 deg 342;
        }

        center:i(2) left {
            inTension: 1.9;
            outTension: 1.9;
        }
        center:i(-3) right {
            inTension: 1.7;
        }
    }
    @namespace(penstroke#verticalConnection) {
        center:i(0) left {
            offset: Vector 0 -10;
            inDir: deg 160;
        }
    }
}
@namespace("glyph#dvKHA") {
    @namespace("penstroke#spiralBow") {
        center:i(-1), center:i(-2), center:i(-3), center:i(-4), center:i(-5) {
            spiralOffset: 26;
            xTranslate: spiralOffset;
        }
        center:i(1),
        center:i(2){
            xTranslate: 13;
        }
        center:i(-1) > left {
            weightSummand: 5;
        }
    }
    @namespace("penstroke#bowConnection") {
        center:i(0) {
            xTranslate: 39;
        }
        center:i(1) {
            target: spiralBow:children[0]:right:on:x;
            pinTo: Vector (target-_on:x) 0;
        }
    }
}
@namespace("glyph#dvDA") {
    @namespace(penstroke#verticalConnection) {
        center:i(0) > left {
            offset: Vector 0 -10;
            inDir: deg 200;
        }
    }
}
@namespace("glyph#dvDHA") {
    @namespace(penstroke#bowConnection) {
        center:i(-1) {
            xTranslate: -53;
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
    }
}
@namespace("glyph#a") {
    @namespace(penstroke#stem) {
        center:i(0) > right{
            weightSummand: 5;
        }
        center:i(-2) > left {
            inTension: 2;
        }
    }
    @namespace(penstroke#bowl) {
        center:i(0){
            xTranslate: 4;
        }
        center:i(1)>right{
            outTension: .75;
        }
    }
}

@namespace(glyph#h, glyph#n) {
    @namespace("penstroke#arch") {
        /* move all points, we want to make it wider here*/
        center {
            origin: penstroke:children[-1]:_on:x;
            target: stem:children[0]:right:on:x;
            pinTo: Vector (target - origin) 0;
        }
        center:i(-1) > right,  center:i(-1) > left {
            inTension: 1.6;
            inDirIntrinsic: deg -13;
        }
        center:i(-2) > right, center:i(-2) > left {
            outTension: 1;
        }
    }
}

@namespace(glyph#m) {
    /* move all points, we want to make it wider here*/
    penstroke#archRight center.connection{
        target: _target - 10;
    }
}

@namespace(glyph#s) {
    center, center > * {
        xTranslate: extraX;
        extraX: 50;
    }
    @namespace(penstroke#sShape) {
        center.horizontal.top {
            xTranslate: 15 + extraX;
        }
        center.drop.top {
            xTranslate: 33 + extraX;
        }
        center.horizontal.bottom {
            xTranslate: -7.5 + extraX;
        }
        center.drop.bottom {
            xTranslate: -15 + extraX;
            yTranslate: -8;
        }
        center.drop.bottom.fixation > left {
            outTension: 4;
        }
        center.vertical.bottom > left {
            outTension: 2.3;
            inTension: 2.3;
        }
        center.vertical.top > right {
            inTension: 2.3;
            outTension: 2.3;
        }
        center.drop.top.fixation > right{
            inTension: 3.5;
        }
    }
}

@namespace("glyph#i,glyph#j") {
    @namespace("penstroke#dot") {
        center {
            dotFixation: penstroke:children[-1]:baseNode:on;
        }
    }
}
@namespace("glyph#j") {
    center{
        extraX: 110;
        xTranslate: extraX;
    }
}

@namespace(glyph#b) {
    @namespace(contour#C\:terminal) {
        p.bridge {
            _y: baseNode:on:y;
            _x: -30 + _xRef:x;
        }
    }
}
@namespace(glyph#c) {
    @namespace("penstroke#cShape") {
        center.drop.fixation > right {
            inTension: 1.3;
        }
    }
}

@namespace(glyph#g) {
    @namespace("penstroke#ear") {
        center.drop {
            yTranslate: -10;
        }
        center.horizontal {
            xTranslate: 5;
        }
        center.to-base {
            yTranslate: 8;
        }
    }
    @namespace("penstroke#loop") {
        center.vertical.upper.left > left{
            outTension: 1.1;
        }

        center.vertical.lower.left > left{
            inTension: 1.7;
        }
    }
}

@namespace(glyph#t) {
    @namespace(penstroke#stem) {
        center.terminal > right {
            outTension: 3;
        }
    }
}


@namespace(glyph#v, glyph#w, glyph#y) {
    penstroke#topLeftSerif center.left,
    penstroke#topCenterSerif center.left {
        _serifOffset: -15;
    }
    penstroke#topLeftSerif center.right,
    penstroke#topCenterSerif center.right {
        _serifOffset: 15;
    }
    penstroke#topRightSerif center.left  {
        _serifOffset: 20;
    }
    penstroke#topRightSerif center.right {
        _serifOffset: 0;
    }
}
@namespace(glyph#v) {
    penstroke#downDiagonalOne center.bottom {
        _downDiagonalLengthFactor: .3;
    }
}
@namespace(glyph#w) {
    penstroke#upDiagonalOne center.top {
        _centerConnectionLengthFactor: .8;
    }
    penstroke#downDiagonalOne center.bottom,
    penstroke#downDiagonalTwo center.bottom {
        _downDiagonalLengthFactor: .3;
    }
}
@namespace(glyph#y) {
    penstroke#downDiagonalOne center.bottom {
        _downDiagonalLengthFactor: -.15;
    }
    @namespace(penstroke#upDiagonalOne){
        center.diagonal-connection {
            _baselineMovement: 0;
        }
        center.drop {
            dropX: 0;
            _xTranslate: dropX + extraX;
        }
        center.drop.fixation left {
            weightSummand: -45;
        }
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
        _serifOffset: -10;
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
        _xCorrection: -35;
    }
    penstroke#upStrokeRight {
        _xCorrection: 35;
    }
}
@namespace(glyph#z) {
    * {
        xTranslate: 15;
        _leftAdjust: -25;
        _rightAdjust: 15;
    }
}
