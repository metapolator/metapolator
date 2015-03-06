@import 'wired-up.cps';
@import 'global.cps';

/* set up this masters parameters */
@dictionary {
    glyph, point > center, contour > p {
        widthFactor: 1.3;
    }
    point > left, point > right, contour > p {
        weightFactor: .2;
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
  glyph#a penstroke#stem point:i(-1)
, glyph#a penstroke#stem point:i(-2)
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
        serifLength: stemWidth * 3 + _serifOffset;
    }
}

/********************
 * compensate for each skeleton/weight setup *
 *                           *****************/

@namespace("glyph#dvA") {
    @namespace(penstroke#upperBow) {
        point:i(1)>right, point:i(1)>left {
            inTension: .9;
        }
    }

    @namespace(penstroke#lowerBow) {
        /* the drop */
        @namespace("point:i(0), point:i(1)") {/* " ; */
            @dictionary{
                center {
                    yTranslate: 72.5;
                    xTranslate: 65;
                }
            }
        }
        @dictionary {
            point:i(2) > center {
                xTranslate: 26;
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
                xTranslate: -84.5;
            }
        }
    }
}

@namespace("glyph#dvI") {
    @namespace(penstroke#sShape) {
        @dictionary {
            point:i(2) center {
                xTranslate: 19.5;
                yTranslate: 0;
            }
            point:i(-3) center {
                xTranslate: 19.5;
                yTranslate: 0;
            }

            point:i(-2) center {
                xTranslate: 44.2;
                yTranslate: 0;
            }

            point:i(-1) center {
                xTranslate: -26;
                yTranslate: 20;
            }
        }
        point:i(2) right{
            outTension: 1;
        }
        point:i(-1) center {
            in: on + Polar 15 deg 342;
        }
    }
    @namespace(penstroke#verticalConnection) {
        @dictionary {
            point:i(0) left {
                offset: Vector 0 3;
            }
        }

        point:i(0) left {
            inDir: deg 190;
        }
    }
}

@namespace("glyph#dvKHA") {
    @namespace(penstroke#upperBow){
        point:i(0) > left, point:i(0) > right{
            outTension: 1;
        }
        point:i(1) > left, point:i(1) > right{
            inTension: 1;
        }
    }

    @namespace(penstroke#bowConnection) {
        @dictionary {
            point:i(0) > center {
                xTranslate: -91;
            }
        }
    }
    @namespace(penstroke#spiralBow) {
        point:i(-1) > left {
            inDirIntrinsic: deg -8;
        }
        point:i(2) > right {
            outTension: 0.9;
        }
    }
    @namespace("penstroke#stem") {
        @dictionary {
            point > center {
                stemFitComepensation: -3;
            }
            point:i(1) > center {
                yTranslate: 65;
            }
            point:i(2) > center {
                yTranslate: -45;
            }
        }

        point:i(1) > left {
            outTension: 2;
            outDirIntrinsic: deg -5;
        }
        point:i(2) > left {
            inTesnsion: 2;
            inDirIntrinsic: deg 5;
        }
    }
}
@namespace("glyph#dvDA") {
    @namespace(penstroke#bow) {
        @dictionary{
            point:i(-1) > center {
                xTranslate: 60;
                yTranslate: 30;
            }
        }
        point:i(-2) > left, point:i(-2) > right {
            outTension: 1;
            outDirIntrinsic: 0;
            outDir: 0;
        }
        point:i(-2) > center {
            out: on + Polar 30 deg 0;
        }
        point:i(-1) > center {
            in: on + Polar 30 deg 210;
        }
    }
    @namespace(penstroke#verticalConnection) {
        @dictionary {
            point:i(0) left {
                offset: Vector 0 5;
            }
        }
        point:i(0) left {
            inDir: deg 190;
        }
    }
}
@namespace(glyph#dvDHA) {
    @namespace(penstroke#lowerBow) {
        @dictionary {
            point:i(0) > center {
                yTranslate: 25;
            }
        }
    }
    @namespace(penstroke#bowConnection) {
        @dictionary {
            point:i(-1) > center {
                xTranslate: 84.5;
            }
        }
    }
}
@namespace(glyph#dvSSA) {
    @namespace(penstroke#bow) {
        @dictionary{
            point:i(0) right, point:i(0) left {
                weightSummand: 3;
            }
            point:i(0) center {
                yTranslate: 10;
            }
        }
        point:i(0) right {
            outTension: 1.5;
        }
        point:i(1) left {
            inTension: .85;
        }
        point:i(1) right {
            outTension: .65;
        }
    }
}
@namespace("glyph#a") {
    @namespace("penstroke#stem") {
        @dictionary{
            point:i(0) > center{
                xTranslate: -90;
                yTranslate: 5;
            }
            point:i(1) > center{
                xTranslate: -50;
            }

            point:i(0) > left,
            point:i(0) > right{
                weightSummand: 1;
            }
        }

        point:i(0) > right{
            outDirIntrinsic: parent:left:outDirIntrinsic;
        }

        point:i(0) > left{
            outDirIntrinsic: deg 15;
            outTension: .8;
        }
        point:i(1) > left{
            inTension: .9;
        }
        point:i(1) > right {
            inTension: 1;
        }

        point:i(-4)>right {
            outTension: .70;
        }
        point:i(-3)>left {
            outTension: 1;
            inTension: 1;
        }
        point:i(-3)>right {
            outTension: 1;
            inTension: 1;
        }
        point:i(-2)>right {
            inTension: 1.2;
        }
    }
    @namespace("penstroke#bowl") {
        @dictionary{
            point:i(0) > center {
                yTranslate: 30;
            }

            point:i(0) > left,
            point:i(0) > right{
                weightSummand: 1
            }
        }
        point:i(0) > left,
        point:i(0) > right {
            outTension: 1;
        }
        point:i(-2) > left,
        point:i(-2) > right {
            outTension: 1.2;
        }
        point:i(-1) > left,
        point:i(-1) > right {
            inTension: 1;
        }

    }
}
@namespace(glyph#d) {
    @namespace("penstroke#bowl") {
        @dictionary{
            point:i(0) > center {
                yTranslate: 30;
            }
            point:i(1) > center {
                xTranslate: -30;
            }
        }
    }
    point:i(0) > left {
        outTension: .7;
    }
    point:i(0) > right {
        outTension: .6;
    }
    point:i(1) > left {
        inTension: 1;
    }
    point:i(1) > right {
        inTension: 1.5;
    }
}
@namespace(glyph#h, glyph#n, glyph#m) {
    @namespace("penstroke#arch") {
        point:i(-1) > right,  point:i(-1) > left {
            inTension: 1.6;
            inDirIntrinsic: deg -27;
        }
        point:i(-2) > right, point:i(-2) > left {
            outTension: 1;
        }
    }
}
@namespace(glyph#m) {
    @namespace("penstroke#archLeft") {
        point.connection > right,  point.connection > left {
            inTension: 1.6;
            inDirIntrinsic: deg -27;
        }
        point.vertical > right{
            outTension: 1;
        }
    }
   @namespace("penstroke#archRight") {
        point.connection > right,  point.connection > left {
            inTension: 1.2;
        }
        @dictionary{
            point.connection > center {
                targetType: "center";
            }
        }
        point.connection > center {
            in: _in + Vector 0 -5;
        }
        point.vertical > right {
            outTension: .9;
        }
   }
}


@namespace(glyph#e) {
    @namespace("penstroke#stroke") {
        point:i(1) > left {
            inTension: 1;
            outTension: 1;
        }
        point:i(2) > left {
            inTension: 1
        }
    }
}
@namespace(glyph#s) {
    @namespace(penstroke#sShape) {
        @dictionary {
            point.drop.bottom > center {
                xTranslate: 10;
                yTranslate: -8;
            }

            point.drop.top > center {
                yTranslate: -5;
            }
        }
        point.drop.bottom.fixation > right{
            outTension: 1.6;
        }
        point.horixontal.bottom > right{
            inTension: 1;
        }
        point.vertical.bottom > right{
            outTension: 1;
        }
        point.vertical.top > right{
            inTension: 1;
        }
        point.drop.top.fixation > left{
            inTension: 1.6;
        }
    }
}

@namespace("glyph#j") {
    @dictionary{
        point>center{
            extraX: 120;
            xTranslate: extraX;
        }
    }
    @namespace("penstroke#stem") {
        point.horizontal > left {
            outTension: .9;
        }
    }
}

@namespace(glyph#b) {
    @namespace(penstroke#bowl) {
        point.horizontal.top > left {
            outTension: 1.7;
            inTension: 1.5;
        }

        point.connection > left {
            outTension: 1.5;
        }

        @dictionary {
            point.to-stem > *{
                yTranslate: -30;
                weightSummand: 3;
            }
        }
    }
    @namespace(penstroke#stem) {
        @dictionary {
            point.bottom>center {
                pinTo: Vector 0 -35;
            }
        }
    }
    @namespace(contour#terminal) {
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
        @dictionary{
            p.bridge {
                _y: -45 + _yRef:y;
                _x: 2 +_xRef:x;
            }
        }
    }
}

@namespace(glyph#c) {
    @namespace("penstroke#cShape") {
        point.horizontal.top > right {
            outTension: 1.1;
            inTension: 1.9;
        }
    }
}

@namespace(glyph#f){
    @namespace("penstroke#stem") {
        point.vertical.left > right {
            outTension: .55;
        }
        point.vertical.left > left {
            outTension: .6;
        }
        point.horizontal.top > right {
            inTension: 1.2;
        }
        point.horizontal.top > left {
            inTension: .9;
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
                yTranslate: 11;
            }
            point.to-base>center {
                yTranslate: -15;
                xTranslate: -18;
            }
        }
        point.horizontal>left{
            inTension: 1.1;
        }
        point.vertical>right{
            outTension: .8;
            inTension: 1.2;
        }
        point.to-base>right {
            outTension: 1.5;
        }
        point.to-base>left {
            outTension: 1.5;
        }
        point.to-base>center {
            out: _out + Vector 27 0;
        }
    }
    @namespace("penstroke#leftBowl") {
        point.horizontal.top > right {
            outTension: 1;
        }
        point.vertical.left > right{
            outTension: .8;
            inTension: .8;
        }
        point.vertical.left > left{
            inTension: .65;
        }
    }
    @namespace("penstroke#rightBowl") {
        point.horizontal.top > right {
            inTension: .7;
        }
        point.vertical.right > right{
            outTension: 1;
            inTension: .8;
        }
        point.vertical.right > left{
            outTension: .65;
            inTension: .65;
        }
    }
    @namespace("penstroke#loop") {
        @dictionary {
            point.end > center {
                xTranslate: 25;
                yTranslate: 45;
            }
            point.vertical.left.lower > center {
                yTranslate: 10;
            }
            point.vertical.left.lower > right,
            point.vertical.left.lower > left {
                weightSummand: 3;
            }
        }
        point.horizontal.upper.left > left,
        point.horizontal.upper.left > right {
            inTension: 1;
        }
        point.horizontal.bottom > left{
            inTension: 1;
            outTension: .8;
        }
        point.horizontal.bottom > right {
            inTension: 1;
            outTension: .8;
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
            inTension: 1.1;
            outTension: 1.2;
        }
        point.vertical.left.lower > left {
            inTension: 1.3;
            outTension: 1.2;
        }
        point.end > right {
            inDir: deg 35;
            inTension: 1.5;
        }
        point.end > left {
            inTension: 1.5;
        }
    }
}

@namespace(glyph#p) {
    @namespace("penstroke#bowl") {
        @dictionary{
            point.connection > center {
                yTranslate: -30;
            }
        }
    }
    point.connection > left {
        outTension: .9;
    }
    point.connection > right {
        outTension: .7;
    }
}

@namespace(glyph#q) {
    @namespace("penstroke#bowl") {
        @dictionary{
            point.connection > center {
                yTranslate: -30;
            }
        }
    }
    point.connection > right {
        outTension: .85;
    }
    point.connection > left {
        outTension: .75;
    }
}

@namespace(glyph#r) {
    @namespace(penstroke#drop) {
        @dictionary{
            point.connection > center {
                yTranslate: -45;
            }
        }
        point.connection > left{
            outTension: .9;
        }
        point.connection > right{
            outTension: 1.1;
        }
        point.drop.fixation > left {
            inTension: 1.1;
        }
        point.drop.fixation > right {
            inTension: 1.1;
            outTension: .6;
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
        point.horizontal > right {
            outTension: .6;
        }
        point.horizontal > left {
            outTension: .8;
        }
    }
}

@namespace(glyph#u) {
    @namespace("penstroke#arch") {
        point.to-stem > right,  point.to-stem > left {
            outTension: 1.6;
            outDirIntrinsic: deg -20;
        }
        point.horizontal > right, point.horizontal > left {
            inTension: .9;
        }
    }
}

@namespace(glyph#v, glyph#w, glyph#y) {
    @dictionary {
        point > center {
            extraX: -100;
            xTranslate: extraX;
        }
        penstroke#topLeftSerif point.left > center,
        penstroke#topCenterSerif point.left > center {
            _serifOffset: -15;
        }
        penstroke#topLeftSerif point.right > center,
        penstroke#topCenterSerif point.left > center {
            _serifOffset: 15;
        }
        penstroke#topRightSerif point.left > center {
            _serifOffset: 20;
        }
        penstroke#topRightSerif point.right > center {
            _serifOffset: -20;
        }
    }
}
@namespace(glyph#v) {
    @dictionary {
        penstroke#downDiagonalOne .bottom center{
            _downDiagonalLengthFactor: .88;
        }
    }
}
@namespace(glyph#w) {
    @dictionary {
        penstroke#upDiagonalOne .top center {
            _centerConnectionLengthFactor: .85;
        }
        penstroke#downDiagonalOne .bottom center,
        penstroke#downDiagonalTwo .bottom center {
            _downDiagonalLengthFactor: .88;
        }
    }
}

@namespace(glyph#y) {
    @dictionary {
        penstroke#downDiagonalOne .bottom center{
            _downDiagonalLengthFactor: .89;
        }
    }
    @namespace(penstroke#upDiagonalOne){
        @dictionary {
            .diagonal-connection center {
                _baselineMovement: .5;
            }
            .drop center{
                dropX: -105;
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
        outTension: 1.1;
    }
}
@namespace(glyph#x) {
    @dictionary {
        /* outer serifs */
        penstroke#topLeftSerif point.left > center,
        penstroke#bottomRightSerif point.right > center {
            _serifOffset: -20;
        }
        penstroke#topRightSerif point.right > center,
        penstroke#bottomLeftSerif point.left > center {
            _serifOffset: -30;
        }
        /* inner serifs */
        penstroke#topLeftSerif point.right > center,
        penstroke#bottomRightSerif point.left > center {
            _serifOffset: -10;
        }
        penstroke#topRightSerif point.left > center,
        penstroke#bottomLeftSerif point.right > center {
            _serifOffset: 10;
        }

        penstroke#upStrokeLeft{
            _xCorrection: 15;
        }
        penstroke#upStrokeRight {
            _xCorrection: -15;
        }
    }
}

@namespace(glyph#z) {
    @dictionary {
        * {
            _leftAdjust: 55;
            _rightAdjust: -80;
        }
    }
}
