@import 'wired-up.cps';
@import 'global.cps';

/* set up this masters parameters */
@dictionary {
    glyph, point > center, contour > p  {
        widthFactor: 0.5;
    }
    point > left, point > right, contour > p {
        weightFactor:  .2;
    }
}

@namespace("
  glyph#dvI penstroke#bubble point
, glyph#dvDA penstroke#bubble point
, glyph#dvA penstroke#lowerBow point:i(0)
, glyph#dvA penstroke#lowerBow point:i(1)
") {
    @dictionary {
        * {
            uniformScale: .5;
        }
    }
}

@namespace("
, glyph#a penstroke#stem point:i(-1)
, glyph#a penstroke#stem  point:i(-2)
, point.drop
") {
    @dictionary {
        * {
            uniformScale: .35;
        }
    }
}

@namespace("
    glyph#s point.drop
") {
    @dictionary {
        * {
            uniformScale: .6;
        }
    }
}

@namespace("
    glyph#i penstroke#dot point
,   glyph#j penstroke#dot point
,   glyph#y point.drop
") {
    @dictionary {
        * {
            uniformScale: .45;
        }
    }
}

@dictionary {
    point > * {
        _serifOffset: 0;
        serifLength: stemWidth * 1.4 + _serifOffset;
    }
}

/********************
 * compensate for each skeleton/weight setup *
 *                           *****************/


@namespace("glyph#dvA") {
    @namespace(penstroke#upperBow) {
        point:i(0)>right {
            outTension: .9;
        }
    }
    @namespace(penstroke#lowerBow) {
        /* the drop */
        @namespace("point:i(0), point:i(1)") {/* " ; */
            @dictionary{
                center {
                    yTranslate: 47.5;
                }
            }
        }
        @dictionary{
            point:i(2) > center{
                xTranslate: 5;
            }
        }
        point:i(2) > left{
           inTension: 1.3;
        }
        point:i(1) > right {
            outTension: .9;
        }
        point:i(2) > right {
            inTension: .9;
        }
    }
    @namespace(penstroke#bowConnection) {
        @dictionary {
            point:i(0) > center {
                xTranslate: -45;
            }
        }
    }
}

@namespace("glyph#dvI") {
    @namespace(penstroke#sShape) {
        @dictionary {
            point:i(-3) center {
                xTranslate: 20;
                yTranslate: -10;
            }
        }
    }
    @namespace(penstroke#verticalConnection) {
        @dictionary {
            point:i(0) left {
                offset: Vector 0 14;
            }
        }
    }
}
@namespace("glyph#dvKHA") {
    @namespace(penstroke#bowConnection) {
        @dictionary {
            point:i(0) center {
                xTranslate: -27;
            }
        }
    }
    @namespace("penstroke#spiralBow") {
        @dictionary {
            point:i(2) > center {
                xTranslate: 5;
            }

            point:i(-5) > center {
                xTranslate: 2.5;
            }
            point:i(-2) > center {
                xTranslate: 1;
            }
            point:i(-2) > left,  point:i(-2) > right,
            point:i(-1) > left,  point:i(-1) > right {
                weightSummand: 1;
            }
        }

        point:i(2) > left{
            outTension: 1.15;
        }


        point:i(-2) > left {
            outTension: 1;
        }
        point:i(-2) > right {
            outTension: 1;
        }
        point:i(-1) > left {
            inTension: 1;
            inDirIntrinsic: deg -9;
        }
    }

    @namespace("penstroke#stem") {
        @dictionary {
            point > center {
                stemFitComepensation: -3;
            }
        }
        point:i(1) > left {
            outTension: 15;
            outDirIntrinsic: deg -12;
        }
        point:i(2) > left {
            inTesnsion: 15;
            inDirIntrinsic: deg 12;
        }
    }
}

@namespace("glyph#dvBHA") {
    @namespace("penstroke#bow") {
        @dictionary {
            point:i(-3) > center{
                xTranslate: 5;
            }
        }

        point:i(-2) > right {
            inTension: 1.4;
        }
        point:i(-4) > right {
            outTension: 1.4;
        }

        point:i(2) > left {
            inTension: 1.15;
        }
    }
}
@namespace("glyph#dvDA") {
    @namespace(penstroke#verticalConnection) {
        @dictionary {
            point:i(0) left {
                offset: Vector 0 10;
            }
        }
        point:i(0) left {
            inDir: deg 180;
        }
    }
}
@namespace(glyph#dvDHA) {
    @namespace(penstroke#bowConnection) {
        @dictionary {
            point:i(-1) > center {
                xTranslate: 35.5;
            }
        }
    }
    @namespace(penstroke#upperBow) {
        point:i(0) > left {
            outTension: 1.1;
        }
    }
    @namespace(penstroke#upperBow) {
        point:i(-2) > left {
            outTension: 1.3;
        }
        @dictionary {
            point:i(-2) > center {
                xTranslate: -6;
            }
        }
    }
    @namespace(penstroke#lowerBow) {
        point:i(-2) > left {
            outTension: 4;
        }
    }
}
@namespace(glyph#dvSSA) {
    @namespace(penstroke#bow) {
        @dictionary{
            point:i(0) > right, point:i(0) > left {
                weightSummand: 3;
            }
            point:i(0) > center {
                yTranslate: -18;
            }
            point:i(1) > center {
                xTranslate: -2.5;
            }
            point:i(2) > center {
                yTranslate: -23;
            }
        }
        point:i(0) left {
            outTension: 1.2
        }
        point:i(1) left {
            inTension: .8;
            outTension: 1.2;
        }

        point:i(2) left {
            inTension: .7;
        }

        point:i(0) right {
            outTension: 1.2;
        }

        point:i(1) right {
            inTension: 1;
            outTension: 1.2;
        }
    }
}

@namespace("glyph#a") {
    @namespace("penstroke#stem") {
        @dictionary {
            point:i(-3) > center {
                xTranslate: 5;
            }
            point:i(-2) > center,
            point:i(-1) > center {
                yTranslate: 25;
            }
            point:i(0) > left,
            point:i(0) > right {
                weightSummand: 1.5;
            }
        }
        point:i(0) > right{
            outDirIntrinsic: parent:left:outDirIntrinsic;
        }

        point:i(-4) > right {
            outTension: .6;
        }
        point:i(-3) > left {
            outTension: 1.3;
            inTension: 1.15;
        }
        point:i(-3) > right {
            outTension: 1;
            inTension: .92;
        }
        point:i(-2)>left {
            inTension: 1;
        }
        point:i(-2)>right {
            inTension: 1.5;
        }
    }
    @namespace("penstroke#bowl") {
        @dictionary {
            point:i(2) > center {
                xTranslate: -15;
            }
        }

        point:i(0) > left,
        point:i(0) > right {
            outTension: 1;
        }

        point:i(1) > left {
            inTension: 1.1;
            outTension: 1.5;
        }
        point:i(2) > right {
            outTension: 1.1;
        }
    }
}


@namespace(glyph#m) {
    @namespace("penstroke#archLeft") {
        point.vertical > right{
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

        @dictionary {
            point.drop.bottom > center {
                yTranslate: -25;
                xTranslate: 5;
            }
            point.horizontal.bottom > center {
                xTranslate: -8;
            }
            point.vertical.bottom > center{
                xTranslate: 10;
                yTranslate: 5;
            }

            point.vertical.top > center{
                xTranslate: -10;
                yTranslate: -5;
            }
            point.horizontal.top > center {
                xTranslate: 4;
            }
            point.drop.top > center {
                yTranslate: 20;
            }
        }
        point.horizontal.bottom > left {
            inTension: .65;
        }
        point.horizontal.bottom > right {
            inTension: .75;
        }

        point.horizontal.top > right {
            inTension: .65;
            outTension: .65;
        }
        point.horizontal.top > left {
            inTension: .75;
        }
    /**/
    }
}

@namespace("glyph#j") {
    @dictionary{
        point>center{
            extraX: 80;
            xTranslate: extraX;
        }
    }
    @namespace("penstroke#stem") {
        @dictionary {
            point.drop > center {
                yTranslate: -10;
            }
        }
        point.vertical > left {
            outTension: .7;
        }
        point.horizontal > left {
            inTension: 1.2;
        }
        point.horizontal > right{
            outTension: 1.2;
        }
    }
}

@namespace(glyph#b) {
    @namespace(penstroke#bowl) {
        point.horizontal.top > left {
            outTension: 1.7;
        }
        @dictionary{
            point.to-stem > *{
                weightSummand: 3;
            }
        }
    }
    @namespace(penstroke#stem) {
        @dictionary {
            point.bottom>center {
                pinTo: Vector 0 -85;
            }
        }
    }
    @namespace(contour#terminal) {
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
        }
        @dictionary {
            p.bridge {
                _y: -35 + _yRef:y;
                _x: 3 + _xRef:x;
            }
        }
    }
}
@namespace(glyph#c){
    @namespace("penstroke#cShape") {
        @dictionary {
            point.drop > center {
                yTranslate: 10;
            }
        }
        point.horizontal.top > right {
            outTension: 1.3;
        }
        point.drop.fixation > right {
            inTension: .75;
        }
        point.vertical.left > left {
            outTension: 1.2;
        }
    }
}

@namespace(glyph#f){
    @namespace("penstroke#stem") {
        @dictionary {
            point.top.drop > center{
                yTranslate: 10;
            }
        }
        point.vertical.left > left {
            outTension: .7;
        }
        point.horizontal.top > left {
            inTension: 1.2;
        }
    }
}
@namespace(glyph#g) {
    @namespace("penstroke#ear") {
        @dictionary {
            point.drop>center {
                yTranslate: 5;
            }
            point.drop.fixation>center {
                yTranslate: 15;
            }
            point.to-base>center {
                yTranslate: -9;
                xTranslate: -9;
            }
            point.vertical>center {
                xTranslate: -20;
            }
        }
        point.horizontal>left{
            inTension: 1.1;
        }
        point.vertical>left{
            outTension: 1;
            inTension: 1;
        }
        point.vertical>right{
            outTension: 1;
            inTension: .9;
        }
        point.to-base>center {
            out: _out + Vector 7 0;
        }
    }
    @namespace("penstroke#leftBowl) {
        point.horizontal.top > left {
            outTension: 1.7;
        }
        point.horizontal.bottom > left {
            inTension: 1.7;
        }
    }
    @namespace("penstroke#rightBowl) {
        point.horizontal.top > left {
            inTension: 1.7;
        }
        point.horizontal.bottom > left {
            outTension: 1.7;
        }

    }
    @namespace("penstroke#loop") {
        @dictionary {
            point.horizontal.upper.left > center {
                xTranslate: 15;
            }
            point.end > center {
                xTranslate: 20;
                yTranslate: 50;
            }
            point.vertical.left.lower > right,
            point.vertical.left.lower > left {
                weightSummand: 3;
            }
            point.vertical.left.lower > center {
                yTranslate: 10;
            }
        }
        point.horizontal.upper.left > left,
        point.horizontal.upper.left > right {
            inTension: 1;
        }
        point.horizontal.bottom > left{
            inTension: 1;
            outTension: .55;
        }
        point.horizontal.bottom > right {
            inTension: 1;
            outTension: .65;
        }
        point.horizontal.upper.right > right {
            outTension: .8;
        }
        point.horizontal.upper.right > left {
            outTension: .8;
        }
        point.vertical.right > right {
            outTension: 1.2;
            inTension: 1;
        }
        point.vertical.right>left {
            outTension: 1;
        }
        point.vertical.left.lower > right {
            inTension: .8;
        }
        point.vertical.left.lower > left {
            inTension: 1.8;
        }
        point.end > right {
            inDir: deg 60;
        }
        point.end > left {
            inTension: 1.5;
        }
    }
}

@namespace(glyph#t) {
    @namespace("contour#inStroke") {
        p.bottom.left {
            inDir: deg 230;
        }
        p.top.left {
            outDir: deg 268;
        }
    }
    @namespace("penstroke#stem") {
        point.horizontal > right{
            outTension: 1.2;
        }
    }
}

@namespace(glyph#u) {
    @namespace("penstroke#arch") {
        point.to-stem > right{
            outTension: 1.6;
        }
    }
}

@namespace(glyph#v, glyph#w, glyph#y) {
    @dictionary {
        penstroke#topLeftSerif point.left > center,
        penstroke#topCenterSerif point.left > center {
            _serifOffset: -5;
        }
        penstroke#topLeftSerif point.right > center,
        penstroke#topCenterSerif point.right > center {
            _serifOffset: 5;
        }
        penstroke#topRightSerif point.left > center {
            _serifOffset: 7;
        }
        penstroke#topRightSerif point.right > center {
            _serifOffset: -7;
        }
    }
}
@namespace(glyph#v) {
    @dictionary {
        penstroke#downDiagonalOne .bottom center{
            _downDiagonalLengthFactor: .6;
        }
    }
}
@namespace(glyph#w) {
    @dictionary {
        penstroke#upDiagonalOne .top center {
            _centerConnectionLengthFactor: 1;
        }
        penstroke#downDiagonalOne .bottom center,
        penstroke#downDiagonalTwo .bottom center {
            _downDiagonalLengthFactor: .63;
        }
    }
}
@namespace(glyph#y) {
    @dictionary {
        penstroke#downDiagonalOne .bottom center{
            _downDiagonalLengthFactor: .64;
        }
    }
    @namespace(penstroke#upDiagonalOne){
        @dictionary {
            .diagonal-connection center {
                _baselineMovement: 0;
            }
            .drop center{
                dropX: 0;
                xTranslate: dropX;
            }
            .drop.fixation center {
               xTranslate: 15 + dropX;
            }
            .drop.fixation left {
               weightSummand: -45;
            }
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
    @dictionary {
        /* outer serifs */
        penstroke#topLeftSerif point.left > center,
        penstroke#bottomRightSerif point.right > center {
            _serifOffset: -10;
        }
        penstroke#topRightSerif point.right > center,
        penstroke#bottomLeftSerif point.left > center {
            _serifOffset: -15;
        }
        /* inner serifs */
        penstroke#topLeftSerif point.right > center,
        penstroke#bottomRightSerif point.left > center {
            _serifOffset: -5;
        }
        penstroke#topRightSerif point.left > center,
        penstroke#bottomLeftSerif point.right > center {
            _serifOffset: 5;
        }
    }
}

@namespace(glyph#z) {
    @dictionary {
        * {
            _leftAdjust: 15;
            _rightAdjust: -25;
        }
    }
}
