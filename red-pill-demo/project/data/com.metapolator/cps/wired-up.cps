@import 'centreline-skeleton-to-symmetric-outline.cps';
@import 'lib/point-child-base.cps';
@import 'lib/single-inheritance.cps';
@import 'lib/weight.cps';
@import 'lib/scale.cps';

/* set up this masters parameters */
@dictionary {
    * {
        baseMaster: S"master#base";
    }
    point > center, contour > p {
        skeleton: base;
    }
}

/* standard names */
@dictionary {
    point > *{
        master: parent:parent:parent:parent;
        glyph: parent:parent:parent;
        penstroke: parent:parent;
    }
    penstroke{
        master: parent:parent;
        glyph: parent;
    }
    p {
        master: parent:parent:parent;
        glyph: parent:parent;
        contour: parent;
    }
}

/***********
 * reusable patterns *
            **********/

/** pin-to pattern **/
@dictionary {
    glyph#dvA penstroke#lowerBow point > center
  , glyph#dvA penstroke#horizontalConnection point>center
  , glyph#dvA penstroke#stem  point>center
  , glyph#dvI penstroke#bubble point > center
  , glyph#dvI penstroke#appendix point:i(1) > center
  , glyph#dvI penstroke#verticalConnection point > center
  , glyph#dvKHA penstroke#stem point > center
  , glyph#dvKHA penstroke#upperBow point:i(-1) > center
  , glyph#dvKHA penstroke#bowConnection point:i(1) > center
  , glyph#dvBHA penstroke#bow point:i(0) > center
  , glyph#dvBHA penstroke#horizontalConnection point > center
  , glyph#dvBHA penstroke#stem point:i(-1) > center
  , glyph#dvDA penstroke#verticalConnection point > center
  , glyph#dvDA penstroke#bubble point > center
  , glyph#dvDA penstroke#appendix point:i(0) > center
  , glyph#dvDHA penstroke#upperBow point:i(-1) > center
  , glyph#dvDHA penstroke#stem point > center
  , glyph#dvDHA penstroke#leftBar point:i(0) > center /* used in the bold versions */
  , glyph#dvSSA penstroke#stem point > center
  , glyph#dvSSA penstroke#crossBar point:i(0) > center
  , glyph#a penstroke#bowl point > center
  , glyph#a penstroke#stem point:i(-1) > center
  , glyph#a penstroke#stem point:i(-2) > center
  , glyph#d penstroke#topSerif point:i(0)>center
  , glyph#d penstroke#topSerif point:i(-1)>center
  , glyph#d penstroke#bottomSerif point:i(0)>center
  , glyph#d penstroke#bottomSerif point:i(-1)>center
  , glyph#d penstroke#bowl point > center
  , point.serif > center
  , point.no-serif > center
  , glyph#h penstroke#arch point > center
  , glyph#n penstroke#arch point > center
  , glyph#e penstroke#bar point > center
  , glyph#e penstroke#stroke point:i(-1) > center
  , glyph#e penstroke#stroke point:i(-2) > center
  , point.drop > center
  , glyph#i penstroke#dot point > center
  , glyph#j penstroke#dot point > center
  , glyph#b penstroke#bowl point.to-stem > center
  , glyph#b penstroke#bowl point.top.horizontal > center
  , glyph#b penstroke#bowl point.connection>center
  , glyph#b penstroke#stem point.bottom>center
  , glyph#c penstroke#cShape point.outstroke > center
  , glyph#c penstroke#cShape point.horizontal.bottom > center
  , glyph#f penstroke#horizontalStroke point.left > center
  , glyph#g penstroke#ear point.to-base > center
  , glyph#k penstroke#diagonal point > center
  , glyph#m penstroke#archLeft point > center
  , glyph#m penstroke#archRight point > center
  , glyph#p penstroke#bowl  point.connection > center
  , glyph#p penstroke#bowl  point.end > center
  , glyph#q penstroke#bowl  point.connection > center
  , glyph#q penstroke#bowl  point.end > center
  , glyph#r penstroke#drop point > center
  , glyph#t penstroke#horizontalStroke point.crossbar > center
  , glyph#u penstroke#arch point.to-stem > center
  , glyph#u penstroke#arch point.horizontal > center
  , glyph#v penstroke#downDiagonalOne point > center
  , glyph#v penstroke#upDiagonalOne point > center
  , glyph#w penstroke#downDiagonalOne point > center
  , glyph#w penstroke#upDiagonalOne point > center
  , glyph#w penstroke#downDiagonalTwo point > center
  , glyph#w penstroke#upDiagonalTwo point > center
  , glyph#y penstroke#downDiagonalOne point > center
  , glyph#y penstroke#upDiagonalOne point > center
  , glyph#x penstroke#upStrokeLeft point > center
  , glyph#x penstroke#upStrokeRight point > center
  , glyph#x penstroke#downStroke point > center
  , glyph#z penstroke point > center
    {
        pinTo: Vector 0 0;
        _on: transform * skeleton:on;
        _in: transform * skeleton:in;
        _out: transform * skeleton:out;
    }
}

  glyph#dvA penstroke#lowerBow point > center
, glyph#dvI penstroke#bubble point > center
, glyph#dvI penstroke#appendix point:i(1) > center
, glyph#dvKHA penstroke#stem point > center
, glyph#dvKHA penstroke#upperBow point:i(-1) > center
, glyph#dvKHA penstroke#bowConnection point:i(1) > center
, glyph#dvBHA penstroke#bow point:i(0) > center
, glyph#dvBHA penstroke#horizontalConnection point > center
, glyph#dvBHA penstroke#stem point:i(-1) > center
, glyph#dvDA penstroke#bubble point > center
, glyph#dvDA penstroke#appendix point:i(0) > center
, glyph#dvDHA penstroke#upperBow point:i(-1) > center
, glyph#dvDHA penstroke#stem point > center
, glyph#dvDHA penstroke#leftBar point:i(0) > center /* used in condensed extra bold */
, glyph#dvSSA penstroke#stem point > center
, glyph#dvSSA penstroke#crossBar point:i(0) > center
, glyph#a penstroke#bowl point > center
, glyph#a penstroke#stem point:i(-1) > center
, glyph#a penstroke#stem point:i(-2) > center
, glyph#d penstroke#topSerif point:i(0)>center
, glyph#d penstroke#topSerif point:i(-1)>center
, glyph#d penstroke#bottomSerif point:i(0)>center
, glyph#d penstroke#bottomSerif point:i(-1)>center
, glyph#d penstroke#bowl point > center
, point.serif > center
, point.no-serif > center
, glyph#h penstroke#arch point > center
, glyph#n penstroke#arch point > center
, glyph#e penstroke#bar point > center
, glyph#e penstroke#stroke point:i(-1) > center
, glyph#e penstroke#stroke point:i(-2) > center
, point.drop > center
, glyph#i penstroke#dot point > center
, glyph#j penstroke#dot point > center
, glyph#b penstroke#bowl point.to-stem > center
, glyph#b penstroke#bowl point.top.horizontal > center
, glyph#b penstroke#bowl point.connection>center
, glyph#b penstroke#stem point.bottom>center
, glyph#c penstroke#cShape point.outstroke > center
, glyph#c penstroke#cShape point.horizontal.bottom > center
, glyph#f penstroke#horizontalStroke point.left > center
, glyph#g penstroke#ear point.to-base > center
, glyph#k penstroke#diagonal point > center
, glyph#m penstroke#archLeft point > center
, glyph#m penstroke#archRight point > center
, glyph#p penstroke#bowl point.connection > center
, glyph#p penstroke#bowl point.end > center
, glyph#q penstroke#bowl point.connection > center
, glyph#q penstroke#bowl point.end > center
, glyph#r penstroke#drop point > center
, glyph#t penstroke#horizontalStroke point.crossbar > center
, glyph#u penstroke#arch point.to-stem > center
, glyph#u penstroke#arch point.horizontal > center
, glyph#v penstroke#downDiagonalOne point > center
, glyph#v penstroke#upDiagonalOne point > center
, glyph#w penstroke#downDiagonalOne point > center
, glyph#w penstroke#upDiagonalOne point > center
, glyph#w penstroke#downDiagonalTwo point > center
, glyph#w penstroke#upDiagonalTwo point > center
, glyph#y penstroke#downDiagonalOne point > center
, glyph#y penstroke#upDiagonalOne point > center
, glyph#x penstroke#upStrokeLeft point > center
, glyph#x penstroke#upStrokeRight point > center
, glyph#x penstroke#downStroke point > center
, glyph#z penstroke point > center
{
    on: _on + pinTo;
    in: _in + pinTo;
    out: _out + pinTo;
}

/** position the vertical connection as seen in dvI between bar and sShape
 *
 * this requires:
 *    - the stroke to move must be named "verticalConnection"
 *    - verticalTargetStroke set to a penstroke element
 *    - bar set to the bar penstroke element
 *    - the glyph#{name} penstroke#verticalConnection point > center element
 *      must be present in the pin-to pattern dictionary, but not in the
 *      second rule of that.
 */

@namespace("
  glyph#dvI penstroke#verticalConnection
, glyph#dvDA penstroke#verticalConnection
") {
    @dictionary {
        point > center {
            target: verticalTargetStroke:children[0]:center:on;
            rightIntrinsic: Polar parent:right:onLength parent:right:onDir;
            top: bar:children[0]:center:on;
        }

        point:i(0) left {
            offset: Vector 0 0;
            _on: (Polar length base:onDir) + offset;
        }
    }
    point:i(1) > center {
        on: Vector (target:x - rightIntrinsic:x)  top:y;
    }
    point:i(0) > center {
        on: Vector (target:x - rightIntrinsic:x) (target:y - rightIntrinsic:y);
    }
    point > center {
        on: Vector (target:x - rightIntrinsic:x)  _on:y;
        in: Vector (target:x - rightIntrinsic:x) _in:y;
        out: Vector (target:x - rightIntrinsic:x) _out:y;
    }

    /* end inside of the verticalTargetStroke
     * these values will probably need change in the masters
     */
    point:i(0) > left {
        onDir: _on:angle;
        onLength: _on:length;
    }
    point:i(0) > right {
        inTension: Infinity;
    }
}

/** uniform scale **
 * this makes the penstroke independed from the rest of
 * the width/weigth setup by scaling it uniformly
 * use 1 for the original size
 */
@namespace("
  glyph#dvA penstroke#lowerBow point:i(0)
, glyph#dvA penstroke#lowerBow point:i(1)

, glyph#dvI penstroke#bubble point
, glyph#dvDA penstroke#bubble point

") {
    @dictionary {
        * {
            uniformScale: 1;
        }
        center {
            heightFactor: uniformScale;
            widthFactor: uniformScale;
        }
        left, right {
            weightFactor: uniformScale;
        }
    }
}

@namespace("
, glyph#a penstroke#stem point:i(-1)
, glyph#a penstroke#stem point:i(-2)
, point.drop
, glyph#i penstroke#dot point
, glyph#j penstroke#dot point
") {
    @dictionary {
        * {
            uniformScale: 1;
        }
        center {
            scale: Scaling uniformScale uniformScale;
        }
        left, right {
            weightFactor: uniformScale;
        }
    }
}


/**
 * Point class bases setup of the simple serifs of this font
 */
@dictionary {
    point.serif > center,
    point.no-serif > center {
        origin: this:_on:x;
        moveX: 0;
        pinTo: Vector moveX 0;
    }
    point > * {
    /* should be defined within the masters*/
        serifLength: 0;
    }
    point.serif > center {
        _serifLength: serifLength;
    }
    point.no-serif > center {
        _serifLength: 0;
    }

    /* We'll need to set `referenceStroke` to the actual penstroke that
     * is the reference stroke of the serif.
     *
     */
    point.serif.top > center, point.no-serif.top > center {
        target: referenceStroke[S"point.top"];
    }

    point.serif.bottom > center, point.no-serif.bottom > center {
        target: referenceStroke[S"point.bottom"];
    }

    point.serif.left > center, point.no-serif.left > center {
        moveX: target:left:on:x - origin - _serifLength;
    }
    point.serif.right > center, point.no-serif.right > center {
        moveX: target:right:on:x - origin + _serifLength;
    }
}


/*********************
 * general setup that pins point to positions etc. *
                             ***********************/
@namespace("glyph#dvA") {
    @dictionary{
        point > *{
            bowConnection: glyph[S"#bowConnection"];
            lowerBow: glyph[S"#lowerBow"];
            upperBow: glyph[S"#upperBow"];
            stem: glyph[S"#stem"];
            bar: glyph[S"#bar"];
        }
    }
    @namespace(penstroke#bowConnection) {
        point > left, point > right {
            onLength: (upperBow:children[0]:left:on:y - lowerBow:children[-1]:left:on:y) / 2;
        }
    }
    @namespace(penstroke#horizontalConnection) {
        point:i(0) > center {
            on: Vector stem:children[0]:center:on:x _on:y;
        }
        point:i(1) > center {
            on: Vector lowerBow:children[-3]:center:on:x _on:y;
        }
    }
    @namespace(penstroke#stem) {
        point:i(-1) > center {
            on: Vector _on:x bar:children[0]:center:on:y;
        }
    }
}

@namespace("glyph#dvI") {
    @dictionary{
        point>* {
            sShape: glyph[S"#sShape"];
            bar: glyph[S"#bar"];
            verticalTargetStroke: sShape;
        }
    }
    @namespace(penstroke#bubble) {
        @dictionary {
            point > center {
                /* calculate the unpinned location, so we can calculate
                 * the offset to move
                 */
                target: sShape:children[-1]:left:on;
                pinTo: target - penstroke:children[-1]:center:_on;
            }
        }

    }
    @namespace(penstroke#appendix) {
        @dictionary {
            point:i(1) > center {
                target: sShape:children[-1]:left:on;
                reference: penstroke:children[1];
                rightIntrinsic: Polar reference:right:onLength reference:right:onDir;
                pinTo: target - reference:center:_on - rightIntrinsic;
            }
        }

        point:i(1) > center {
            /* point:i(0) is positioned relative from here */
            in: on + Polar 25 deg 250;
        }

        point:i(0)>center{
            on: penstroke:children[1]:center:on + Polar 128 deg 235;
            out: penstroke:children[1]:center:on + Polar 90 deg 242;
        }
    }
}
@namespace("glyph#dvKHA") {
    @dictionary {
        point > *{
            bowConnection: glyph[S"#bowConnection"];
            spiralBow: glyph[S"#spiralBow"];
            upperBow: glyph[S"#upperBow"];
            stem: glyph[S"#stem"];
            bar: glyph[S"#bar"];
        }
    }

    @namespace("penstroke#upperBow") {
        @dictionary{
            point:i(-1) center {
                target: bar:children[-1]:left:on:y;
                yOff: (Polar parent:left:onLength parent:left:onDir):y;
                pinTo: Vector 0 (target - _on:y - yOff);
            }
        }
    }
    @namespace("penstroke#stem") {
        @namespace("point:i(1), point:i(2)") /*";*/ {
            right {
                inTension: Infinity;
                outTension: Infinity;
            }
        }
        @dictionary {
            point > center {
                target: spiralBow:children[-5]:right:on:x;
                reference: penstroke:children[0]:center:_on:x;
                pinTo: Vector (target - reference + stemFitComepensation) 0;
                /* There is no correct rule for this. I'm picking just
                 * something that is roughly right.
                 */
                stemFitComepensation: parent:right:onLength/3
            }
        }
    }
}
@namespace("glyph#dvBHA") {
    @dictionary {
        point > *{
            bowConnection: glyph[S"#bowConnection"];
            bow: glyph[S"#bow"];
            stem: glyph[S"#stem"];
            bar: glyph[S"#bar"];
        }
    }
    @namespace("penstroke#bow") {
        @dictionary {
            point:i(0) > center {
                target: penstroke:children[-3]:left:on:x;
                pinTo: Vector (target - _on:x) 0;
            }
        }
    }
    @namespace("penstroke#horizontalConnection") {
        @dictionary {
            point:i(-1) > center {
                target: bow:children[-3]:center:on:x;
                pinTo: Vector (target - _on:x) 0;
            }
            point:i(0) > center {
                target: stem:children[0]:center:on:x;
                pinTo: Vector (target - _on:x) 0;
            }
        }
    }
    @namespace("penstroke#stem") {
        @dictionary {
            point:i(-1) > center {
                target: bar:children[0]:center:on:y;
                pinTo: Vector 0 (target - _on:y);
            }
        }
    }
}
@namespace("glyph#dvDA") {
    @dictionary {
        point > *{
            verticalConnection: glyph[S"#verticalConnection"];
            bow: glyph[S"#bow"];
            stem: glyph[S"#stem"];
            bar: glyph[S"#bar"];
            verticalTargetStroke: bow;
        }
    }
    @namespace(penstroke#bubble) {
        @dictionary {
            point > center {
                /* calculate the unpinned location, so we can calculate
                 * the offset to move
                 */
                target: bow:children[-1]:right:on;
                pinTo: target - penstroke:children[-1]:center:_on;
            }
        }
    }
    @namespace(penstroke#appendix) {
        @dictionary {
            point:i(0) > center {
                target: bow:children[-1]:right:on;
                reference: penstroke:children[0];
                rightIntrinsic: Polar reference:right:onLength reference:right:onDir;
                pinTo: target - reference:center:_on - rightIntrinsic;
            }
        }
        point:i(0) > center {
            /* point:i(1) is positioned relative from here */
            out: on + Polar 25 deg 300;
        }

        point:i(1) > center{
            on: penstroke:children[0]:center:on + Polar 128 deg 325;
            in: penstroke:children[0]:center:on + Polar 90 deg 316;
        }
    }
}
@namespace(glyph#dvDHA) {
    @dictionary {
        point > *{
            bowConnection: glyph[S"#bowConnection"];
            lowerBow: glyph[S"#lowerBow"];
            upperBow: glyph[S"#upperBow"];
            stem: glyph[S"#stem"];
            leftBar: glyph[S"#leftBar"];
            rightBar: glyph[S"#rightBar"];
        }
    }
    @namespace(penstroke#upperBow){
        /* fix -1 right y to leftBar 0 left y */
        @dictionary{
            point:i(-1) > center {
                target: leftBar:children[0]:left:on:y;
                reference: penstroke:children[-1];
                rightIntrinsic: (Polar reference:right:onLength reference:right:onDir):y;
                pinTo: Vector 0 (target - reference:center:_on:y - rightIntrinsic);
            }
            /* this moves the vertical extreme half the way that the
             * curve end was moved. FIXME: should I do this kind of compensation
             * more often? In this case the effect is small but there.
             */
            point:i(-2) > center {
                yTranslate: (penstroke:children[-1]:center:pinTo:y) / 2
            }
        }
    }
    @namespace(penstroke#stem) {
        /* fix all xses to lowerBow 0 right x */
        @dictionary{
            point > center {
                target: lowerBow:children[0]:right:on:x;
                reference: penstroke:children[0];
                leftIntrinsic: (Polar reference:left:onLength reference:left:onDir):x;
                pinTo: Vector (target - reference:center:_on:x - leftIntrinsic) 0;
            }
        }
    }
}
@namespace(glyph#dvSSA) {
    @dictionary {
        point > *{
            bow: glyph[S"#bow"];
            crossBar: glyph[S"#crossBar"];
            stem: glyph[S"#stem"];
            bar: glyph[S"#bar"];
        }
    }
    @namespace(penstroke#stem) {
        /* fix all xses to bow 0 right x */
        @dictionary {
            point > center {
                target: bow:children[0]:right:on:x;
                reference: penstroke:children[0];
                leftIntrinsic: (Polar reference:left:onLength reference:left:onDir):x;
                pinTo: Vector (target - reference:center:_on:x - leftIntrinsic) 0;
            }
        }
    }
    @namespace(penstroke#crossBar) {
        /* fix all crossBar 0 x and y to the stem
         * crossBar is a simple straight line, so we find the
         * ratio between x and y and apply the change of x to that function
         * to get the change of y
         */
        @dictionary{
            point:i(0) > center {
                pinX: stem:children[0]:center:on:x - this:_on:x;
                ratio: penstroke:children[1]:center:on - this:_on;
                pinY: pinX * ratio:y/ratio:x;
                pinTo: Vector pinX pinY;
            }

        }
    }
}

@namespace(glyph#a) {
    @dictionary {
        point > * {
            bowl: glyph[S"#bowl"];
            stem: glyph[S"#stem"];
        }
    }
    @namespace("penstroke#bowl") {
        /* fix the bowl 0 and -1 to the stem, where -1 center touches it */
        @dictionary {
            point:i(0) > center,
            point:i(-1) > center {
                target: stem:children[2]:left:on:x;
                origin: penstroke:children[-1]:center:_on:x;
                pinX: target - origin;
                pinTo: Vector pinX 0;
            }
        }
    }
    @namespace("penstroke#stem") {
        @dictionary {
            /* fix the custom scaled bowl to the stem*/
            point:i(-2) > center,
            point:i(-1) > center {
                /* this is where the point is without the here calculated movement
                 * and without the xTranslate and yTranslate variables
                 */
                fixture: stem:children[-2]:skeleton:on;
                origin: scale * fixture;
                /* target is where the point would be without uniformScaling,
                 * using the standard scaling of the current setup
                 *
                 * I don't use _translate here delibarately, so we can still
                 * use it in following rules, without having this rule
                 * compensating.
                 */
                target: _scale * fixture;
                pinTo: target-origin;
            }
        }
    }
}
@namespace(glyph#d) {
    @dictionary {
        point > * {
            bowl: glyph[S"#bowl"];
            stem: glyph[S"#stem"];
            topSerif: glyph[S"#topSerif"];
            bottomSerif: glyph[S"#bottomSerif"];
            stemWidth: 2 * stem:children[0]:right:onLength;
        }
    }
    @namespace(penstroke#bowl) {
        /* fix the bowl 0 and -1 to the stem, where 0 right touches it */
        @dictionary {
            point:i(0) > center,
            point:i(-1) > center {
                target: stem:children[0]:left:on:x;
                origin: penstroke:children[0]:center;
                rightOffset: (Polar origin:parent:right:onLength origin:parent:right:onDir):x;
                pinX: target - origin:_on:x - rightOffset;
                pinTo: Vector pinX 0;
            }
            point:i(1) > center,
            point:i(-2)>center {
                pinTo: Vector (penstroke:children[0]:center:pinX / 2) 0;
            }
        }

    }
    @namespace(penstroke#topSerif) {
        @dictionary {
            point:i(0)>center {
                origin: this:_on:x;
                target: stem:children[-1]:right:on:x;
                pinTo: Vector (target-origin) 0;
            }
            point:i(-1)>center {
                origin: this:_on:x;
                target: stem:children[-1]:left:on:x;
                pinTo: Vector (target-origin-serifLength) 0;
            }
        }
    }
    @namespace(penstroke#bottomSerif) {
        @dictionary{
            point:i(0)>center {
                origin: this:_on:x;
                target: stem:children[0]:right:on:x;
                pinTo: Vector (target-origin+serifLength) 0;
            }
            point:i(-1)>center {
                origin: this:_on:x;
                target: stem:children[0]:left:on:x;
                pinTo: Vector (target-origin) 0;
            }
        }
    }
}

@namespace("glyph#h, glyph#n") {
    @dictionary {
        point > * {
            arch: glyph[S"#arch"];
            stem: glyph[S"#stem"];
            topSerif: glyph[S"#topSerif"];
            bottomLeftSerif: glyph[S"#bottomLeftSerif"];
            bottomRightSerif: glyph[S"#bottomRightSerif"];
            stemWidth: 2 * stem:children[0]:right:onLength;
        }
    }
    @namespace("penstroke#topSerif, penstroke#bottomLeftSerif") {
        @dictionary {
            point > center {
                referenceStroke: stem;
            }
        }
    }
    @namespace("penstroke#bottomRightSerif") {
        @dictionary {
            point > center {
                referenceStroke: arch;
            }
        }
    }
    @namespace("penstroke#arch") {
        @dictionary {
            point:i(-1) > center {
                origin: penstroke:children[-1]:center:_on:x;
                target: stem:children[0]:right:on:x;
                pinTo: Vector (target - origin) 0;
            }
        }
    }
}

@namespace("glyph#m") {
    @dictionary {
        point > * {
            archLeft: glyph[S"#archLeft"];
            archRight: glyph[S"#archRight"];
            stem: glyph[S"#stem"];
            topSerif: glyph[S"#topSerif"];
            bottomLeftSerif: glyph[S"#bottomLeftSerif"];
            bottomCenterSerif: glyph[S"#bottomLeftSerif"];
            bottomRightSerif: glyph[S"#bottomRightSerif"];
            stemWidth: 2 * stem:children[0]:right:onLength;
        }

        penstroke#topSerif point > center,
        penstroke#bottomLeftSerif point > center {
            referenceStroke: stem;
        }
        penstroke#bottomRightSerif point > center {
            referenceStroke: archRight;
        }
        penstroke#bottomCenterSerif point > center {
            referenceStroke: archLeft;
        }
        penstroke#archLeft point.connection > center,
        penstroke#archRight point.connection > center {
            origin: _on:x;
            pinTo: Vector (target - origin) 0;
        }
        penstroke#archLeft point.connection > center {
            target: stem[S".top right"]:on:x;
        }
        penstroke#archRight point.connection > center {
            targetType: "right";
            _target: archLeft[S".vertical"][targetType]:on:x - (Polar parent:left:onLength parent:left:onDir):x;
            target: _target;
        }
    }
}



@namespace("glyph#k") {
    @dictionary {
        point > * {
            diagonal: glyph[S"#diagonal"];
            stem: glyph[S"#stem"];
            tail: glyph[S"#tail"];
            topSerif: glyph[S"#topSerif"];
            bottomSerif: glyph[S"#bottomSerif"];
            topRightSerif: glyph[S"#topRightSerif"];
            stemWidth: 2 * stem:children[0]:right:onLength;
        }
    }
    @namespace("penstroke#topSerif, penstroke#bottomSerif") {
        @dictionary {
            point > center {
                referenceStroke: stem;
            }
        }
    }
    @namespace("penstroke#topRightSerif") {
        @dictionary {
            point > center {
                referenceStroke: diagonal;
            }
        }
    }
    @namespace(penstroke#diagonal) {
        /* fix diagonal .to-stem to the stem
         * diagonal is a simple straight line, so we find the
         * ratio between x and y and apply the change of x to that function
         * to get the change of y
         */
        @dictionary {
            point.to-base > center {
                targetX: stem[S"point.top"]:center:on:x - _on:x;
                _origin: penstroke[S"point.top"]:center:on;
                _dir: _origin - _on;
                slope: _dir:y/_dir:x;
                yIntersept: slope * (0 - _origin:x) + _origin:y;
                pinY: targetX * slope;
                pinTo: Vector targetX pinY;
            }

        }
    }

    @namespace(penstroke#tail) {
        @namespace("point.to-diagonal") {
            @import 'lib/linear-intersection.cps';
            @dictionary {
                left, right, center {
                    _origin: penstroke[S"point.south-east"][this:type]:on;
                    _other: diagonal[S"point.to-base > center"];
                    __args: List _origin _on _other:_origin _other:on;
                }
                left, right {
                    _on: (Polar length base:onDir ) + parent:center:on;
                    _movement:   __intersection - parent:center:on;
                }
                center {
                    _on: transform * skeleton:on;
                }
            }
            left, right {
                onDir: _movement:angle;
                onLength: _movement:length;
            }
            right {
                inDir: (on - parent:center:on):angle
            }
            left {
                inDir: (parent:center:on - on):angle
            }
            center {
                on: __intersection
            }
        }
    }
}

@namespace("glyph#l") {
    @dictionary {
        point > * {
            stem: glyph[S"#stem"];
            topSerif: glyph[S"#topSerif"];
            bottomSerif: glyph[S"#bottomSerif"];
            stemWidth: 2 * stem:children[0]:right:onLength;
        }
    }
    @namespace("penstroke#topSerif, penstroke#bottomSerif") {
        @dictionary {
            point > center {
                referenceStroke: stem;
            }
        }
    }
}

@namespace(glyph#e) {
    @dictionary {
        point > * {
            stroke: glyph[S"#stroke"];
            bar: glyph[S"#bar"];
        }
    }
    @namespace(penstroke#bar) {
        @dictionary,  {
            point > center {
                origin: penstroke:children[0]:center:_on;
                target: stroke:children[0]:center:on;
                pinTo: target - origin
                    - (Polar parent:left:onLength parent:left:onDir);
            }
        }
    }
    @namespace(penstroke#stroke) {
        @dictionary,  {
            point:i(-1) > center {
                origin: this:_on:x
                    + (Polar parent:right:onLength parent:right:onDir):x;
                target: penstroke:children[0]:right:on:x;
                pinTo: Vector (target - origin) 0;
            }
            point:i(-2) > center {
                pinTo: Vector (penstroke:children[-1]:center:pinTo:x/2) 0;
            }
        }
    }
}

@namespace(glyph#s) {
    @dictionary {
        point > * {
            sShape: glyph[S"#sShape"];
        }
    }
    @namespace("penstroke#sShape") {
        @dictionary {
            /* fix the custom scaled bowl to the sShape*/

            point.drop.top > center {
                dropFixation: sShape[S"point.drop.top.fixation"]:skeleton:on
            }
            point.drop.bottom > center {
                dropFixation: sShape[S"point.drop.bottom.fixation"]:skeleton:on
            }

            point.drop > center {
                /* this is where the point is without the here calculated movement
                 * and without the xTranslate and yTranslate variables
                 */
                origin: scale * dropFixation;
                /* target is where the point would be without uniformScaling,
                 * using the standard scaling of the current setup
                 *
                 * I don't use _translate here delibarately, so we can still
                 * use it in following rules, without having this rule
                 * compensating.
                 */
                target: _scale * dropFixation;
                pinTo: target-origin;
            }
        }
    }
}

@namespace(glyph#i) {
    @dictionary {
        point > * {
            stem: glyph[S"#stem"];
            topSerif: glyph[S"#topSerif"];
            bottomSerif: glyph[S"#bottomSerif"];
            stemWidth: 2 * stem:children[0]:right:onLength;
        }
    }
    @namespace("penstroke#dot") {
        @dictionary{
            point > center {
                dotFixation: penstroke:children[1]:skeleton:on;
                /* this is where the point is without the here calculated movement
                 * and without the xTranslate and yTranslate variables
                 */
                origin: scale * dotFixation;
                /* target is where the point would be without uniformScaling,
                 * using the standard scaling of the current setup
                 *
                 * I don't use _translate here delibarately, so we can still
                 * use it in following rules, without having this rule
                 * compensating.
                 */
                target: _scale * dotFixation;
                pinTo: target-origin;
            }
        }
    }
    @namespace("penstroke#topSerif, penstroke#bottomSerif") {
        @dictionary {
            point > center {
                referenceStroke: stem;
            }
        }
    }
}

@namespace(glyph#j) {
    @dictionary {
        point > * {
            stem: glyph[S"#stem"];
            topSerif: glyph[S"#topSerif"];
            stemWidth: 2 * stem[S"point.top"]:right:onLength;
        }
    }
    @namespace("penstroke#dot") {
        @dictionary{
            point > center {
                dotFixation: penstroke:children[1]:skeleton:on;
                /* this is where the point is without the here calculated movement
                 * and without the xTranslate and yTranslate variables
                 */
                origin: scale * dotFixation;
                /* target is where the point would be without uniformScaling,
                 * using the standard scaling of the current setup
                 *
                 * I don't use _translate here delibarately, so we can still
                 * use it in following rules, without having this rule
                 * compensating.
                 */
                target: _scale * dotFixation;
                pinTo: target-origin;
            }
        }
    }
    @namespace("penstroke#stem") {
        @dictionary {
            /* fix the drop to the stem*/
            point > center {
                drop: penstroke[S"point.drop.fixation"];
                dropFixation: drop:skeleton:on;
            }
            point.drop > center {
                /* this is where the point is without the here calculated movement
                 * and without the xTranslate and yTranslate variables
                 */
                origin: scale * dropFixation;
                /* target is where the point would be without uniformScaling,
                 * using the standard scaling of the current setup
                 *
                 * I don't use _translate here delibarately, so we can still
                 * use it in following rules, without having this rule
                 * compensating.
                 */
                target: _scale * dropFixation;
                pinTo: target-origin;
            }
        }
    }
    @namespace("penstroke#topSerif") {
        @dictionary {
            point > center {
                referenceStroke: stem;
            }
        }
    }
}


@namespace(glyph#b) {
    @dictionary {
        point > *,
        p {
            stem: glyph[S"#stem"];
            bowl: glyph[S"#bowl"];
            topSerif: glyph[S"#topSerif"];
            stemWidth: 2 * stem[S".top"]:right:onLength;
        }
    }
    @namespace("penstroke#topSerif") {
        @dictionary {
            point > center {
                referenceStroke: stem;
            }
        }
    }
    @namespace("contour#terminal") {
        @dictionary {
            p.top.left {
                target: stem[S".bottom"]:left:on
            }
            p.top.right {
                target: stem[S".bottom"]:right:on
            }
            p.upper.connection {
                target: bowl[S".connection"]:left:on
            }
            p.lower.connection {
                target: bowl[S".connection"]:right:on
            }

            p.bottom, p.bridge {
                _on: skeleton:on;
            }
            p.bottom.inner {
                _xRef: parent[S".bottom.outer"];
                _x: (_on:x - _xRef:_on:x) * weightFactor + _xRef:on:x;
            }
            p.bridge {
                _xRef: stem[S".bottom"]:center:on;
                _yRef: _xRef;
            }


        }
        p.top, p.connection {
            on: target;
        }
        p.bottom.outer {
            on: Vector parent[S".top.left"]:on:x _on:y;
        }
        p.bottom.inner {
            on: Vector _x _on:y;
        }
        p.bridge {
            on: Vector _x _y;
        }
    }
    @namespace(penstroke#bowl) {
        /* fix the bowl .to-stem to the stem, where .to-stem center touches it */
        @dictionary {
            point.to-stem > center {
                target: stem[S"point.top"]:right:on:x;
                origin: this;
                rightOffset: (Polar origin:parent:right:onLength origin:parent:right:onDir):x;
                pinX: target - origin:_on:x - rightOffset;
                pinTo: Vector pinX 0;
            }
            point.top.horizontal>center {
                pinTo: Vector (penstroke[S"point.to-stem"]:center:pinX / 2) 0;
            }
        }
    }
}
@namespace(glyph#c){
    @namespace("penstroke#cShape") {
        @dictionary {
            /* fix the drop to the cShape*/
            point > center {
                drop: penstroke[S"point.drop.top.fixation"];
                dropFixation: drop:skeleton:on;
                outstroke: penstroke[S"point.outstroke"];
            }
            point.drop > center {
                /* this is where the point is without the here calculated movement
                 * and without the xTranslate and yTranslate variables
                 */
                origin: scale * dropFixation;
                /* target is where the point would be without uniformScaling,
                 * using the standard scaling of the current setup
                 *
                 * I don't use _translate here delibarately, so we can still
                 * use it in following rules, without having this rule
                 * compensating.
                 */
                target: _scale * dropFixation;
                pinTo: target-origin;
            }
            /**
             * this is almost copy pasted from the setup of glyph#e
             */
            point.outstroke > center {
                origin: this:_on:x
                    + (Polar parent:left:onLength parent:left:onDir):x;
                target: drop:left:on:x;
                pinTo: Vector (target - origin) 0;
            }
            point.horizontal.bottom > center {
                pinTo: Vector (outstroke:center:pinTo:x/2) 0;
            }
        }
    }
}
@namespace(glyph#f) {
    @dictionary {
        point > * {
            stem: glyph[S"#stem"];
            bottomSerif: glyph[S"#bottomSerif"];
            stemWidth: 2 * stem[S".bottom"]:right:onLength;
        }
    }
    @namespace("penstroke#stem") {
        @dictionary {
            /* fix the drop to the stem*/
            point > center {
                drop: penstroke[S"point.drop.top.fixation"];
                dropFixation: drop:skeleton:on;
            }
            point.drop > center {
                /* this is where the point is without the here calculated movement
                 * and without the xTranslate and yTranslate variables
                 */
                origin: scale * dropFixation;
                /* target is where the point would be without uniformScaling,
                 * using the standard scaling of the current setup
                 *
                 * I don't use _translate here delibarately, so we can still
                 * use it in following rules, without having this rule
                 * compensating.
                 */
                target: _scale * dropFixation;
                pinTo: target-origin;
            }
        }
    }
    @namespace("penstroke#horizontalStroke") {
        @dictionary {
            point.left > center{
                target: bottomSerif[S"point.left > center"]:on;
                pinTo: Vector (target:x - _on:x) 0;
            }
        }
    }
    @namespace("penstroke#bottomSerif") {
        @dictionary {
            point > center {
                referenceStroke: stem;
            }
        }
    }
}

@namespace(glyph#g) {
    @dictionary {
        point > * {
            leftBowl: glyph[S"#leftBowl"];
            rightBowl: glyph[S"#rightBowl"];
            ear: glyph[S"#ear"];
            loop: glyph[S"loop"];
        }
    }
    @namespace("penstroke#ear") {
        @dictionary {
            /* fix the drop to the stem*/
            point > center {
                drop: penstroke[S"point.drop.top.fixation"];
                dropFixation: drop:skeleton:on;
            }
            point.drop > center {
                /* this is where the point is without the here calculated movement
                 * and without the xTranslate and yTranslate variables
                 */
                origin: scale * dropFixation;
                /* target is where the point would be without uniformScaling,
                 * using the standard scaling of the current setup
                 *
                 * I don't use _translate here delibarately, so we can still
                 * use it in following rules, without having this rule
                 * compensating.
                 */
                target: _scale * dropFixation;
                pinTo: target-origin;
            }
        }
    }
}

@namespace("glyph#p") {
    @dictionary {
        point > * {
            stem: glyph[S"#stem"];
            topSerif: glyph[S"#topSerif"];
            bottomSerif: glyph[S"#bottomSerif"];
            bowl: glyph[S"#bowl"];
            stemWidth: 2 * stem:children[0]:right:onLength;
        }
    }
    @namespace(penstroke#bowl) {
        /* fix the bowl .connection and .end to the stem, where .connection right touches it */
        @dictionary {
            point.connection > center,
            point.end > center {
                target: stem[S".bottom right"]:on:x;
                origin: penstroke[S".connection center"];
                rightOffset: (Polar origin:parent:right:onLength origin:parent:right:onDir):x;
                pinX: target - origin:_on:x - rightOffset;
                pinTo: Vector pinX 0;
            }
            point:i(1) > center,
            point:i(-2)>center {
                pinTo: Vector (penstroke:children[0]:center:pinX / 2) 0;
            }
        }

    }
    @namespace("penstroke#bottomSerif, penstroke#topSerif") {
        @dictionary {
            point > center {
                referenceStroke: stem;
            }
        }
    }
}

@namespace("glyph#q") {
    @dictionary {
        point > * {
            stem: glyph[S"#stem"];
            topSerif: glyph[S"#topSerif"];
            bottomSerif: glyph[S"#bottomSerif"];
            bowl: glyph[S"#bowl"];
            stemWidth: 2 * stem:children[0]:right:onLength;
        }
    }
    @namespace(penstroke#bowl) {
        /* fix the bowl .connection and .end to the stem, where .connection right touches it */
        @dictionary {
            point.connection > center,
            point.end > center {
                target: stem[S".bottom left"]:on:x;
                origin: penstroke[S".connection center"];
                leftOffset: (Polar origin:parent:left:onLength origin:parent:left:onDir):x;
                pinX: target - origin:_on:x - leftOffset;
                pinTo: Vector pinX 0;
            }
            point:i(1) > center,
            point:i(-2)>center {
                pinTo: Vector (penstroke:children[0]:center:pinX / 2) 0;
            }
        }

    }
    @namespace("penstroke#bottomSerif, penstroke#topSerif") {
        @dictionary {
            point > center {
                referenceStroke: stem;
            }
        }
    }
}

@namespace(glyph#r) {
    @dictionary {
        point > * {
            stem: glyph[S"#stem"];
            topSerif: glyph[S"#topSerif"];
            bottomSerif: glyph[S"#bottomSerif"];
            drop: glyph[S"#drop"];
            stemWidth: 2 * stem:children[0]:right:onLength;
        }
    }
    @namespace("penstroke#bottomSerif, penstroke#topSerif") {
        @dictionary {
            point > center {
                referenceStroke: stem;
            }
        }
    }
    @namespace("penstroke#drop") {
        @dictionary {
            point.connection > center {
                target: stem[S".top right"]:on:x;
                origin: penstroke[S".connection center"];
                rightOffset: (Polar origin:parent:right:onLength origin:parent:right:onDir):x;
                pinX: target - origin:_on:x - rightOffset;
                pinTo: Vector pinX 0;
            }

            /* fix the drop to the stroke*/
            point > center {
                drop: penstroke[S"point.drop.fixation"];
                dropFixation: drop:skeleton:on;
            }
            point.drop > center {
                /* this is where the point is without the here calculated movement
                 * and without the xTranslate and yTranslate variables
                 */
                origin: scale * dropFixation;
                /* target is where the point would be without uniformScaling,
                 * using the standard scaling of the current setup
                 *
                 * I don't use _translate here delibarately, so we can still
                 * use it in following rules, without having this rule
                 * compensating.
                 */
                target: _scale * dropFixation;
                pinTo: target-origin;
            }
        }
    }
}

@namespace(glyph#t) {
    @dictionary {
        point > * , p{
            stem: glyph[S"#stem"];
            horizontalStroke: glyph[S"#horizontalStroke"];
            inStroke: glyph[S"#inStroke"];
            stemWidth: 2 * stem[S"point.top > right"]:onLength;
        }
    }
    @namespace("penstroke#horizontalStroke") {
        @dictionary {
            point > center {
                referenceStroke: stem;
            }
        }
    }

    @namespace("contour#inStroke") {
        @dictionary {
            p {
                _bottomXReference: stem[S"point.top"];
                _bottomY: horizontalStroke[S"point.crossbar right"]:on:y;
                _on:
            }
        }
        p {
            on: skeleton:on;
        }
        p.bottom.left {
            on: Vector _bottomXReference:left:on:x _bottomY;
        }
        p.bottom.right {
            on: Vector _bottomXReference:right:on:x _bottomY;
        }
        p.top.right {
            on: Vector parent[S"p.bottom.right"]:on:x skeleton:on:y;
        }
        p.top.left {
            on: ((skeleton:on - parent[S"p.top.right"]:skeleton:on) * weightFactor) + parent[S"p.top.right"]:on;
        }
    }
}

@namespace(glyph#u) {
    @dictionary {
        point > * , p{
            stem: glyph[S"#stem"];
            arch: glyph[S"#arch"];
            stemWidth: 2 * stem[S"point.top > right"]:onLength;
        }
    }
    @namespace("penstroke#topLeftSerif") {
        @dictionary {
            point > center {
                referenceStroke: arch;
            }
        }
    }
    @namespace("penstroke#topRightSerif, penstroke#bottomSerif") {
        @dictionary {
            point > center {
                referenceStroke: stem;
            }
        }
    }
    @namespace("penstroke#arch") {
        @dictionary {
            point.to-stem > center {
                targetX: stem[S".bottom left"]:on:x;
                originX: _on:x;
                pinTo: Vector (targetX - originX) 0;
                yTranslate: 15;
            }
            point.horizontal > center {
                _pinTo: Vector (penstroke[S".to-stem center"]:pinTo:x / 2) 0
            }
        }
    }
}
/* shared between v, w and y */
@namespace(glyph#v, glyph#w, glyph#y) {
    @dictionary {
        left, right {
            _on: (Polar length base:onDir ) + parent:center:_on;
        }
        * {
            _zeroY: 0;
            _unitY:  glyph[S"penstroke#topLeftSerif center"]:_on:y;
        }
        penstroke, point > * , p{
            downDiagonalOne: glyph[S"#downDiagonalOne"];
            downDiagonalTwo: glyph[S"#downDiagonalTwo"];
            upDiagonalOne: glyph[S"#upDiagonalOne"];
            upDiagonalTwo: glyph[S"#upDiagonalTwo"];
            /* share this with glyph#v*/
            stemWidth: 1.3 * downDiagonalOne[S"point.bottom > right"]:onLength;
        }
        penstroke#topLeftSerif center {
            referenceStroke: downDiagonalOne;
        }
        penstroke#topCenterSerif center {
            referenceStroke: downDiagonalTwo;
        }
    }

    /* upDiagonalOne .left edge shall hit downDiagonalOne .bottom right:on */
    /* downDiagonalTwo .left edge shall hit upDiagonalOne .top right:on */
    /* upDiagonalTwo .left edge shall hit downDiagonalTwo .bottom right:on */
    @import 'lib/linear-intersection.cps';
    @dictionary {
        penstroke {
            _travelX: 0;
        }
        penstroke#upDiagonalOne {
            _target: downDiagonalOne[S".bottom right"]:on;
        }
        penstroke#downDiagonalTwo {
            _target: upDiagonalOne[S".top left"]:on;
        }
        penstroke#upDiagonalTwo {
            _target: downDiagonalTwo[S".bottom right"]:on;
        }
        penstroke#upDiagonalOne, penstroke#downDiagonalTwo, penstroke#upDiagonalTwo {
            _edge1: this[S".top left"]:_on;
            _edge2: this[S".bottom left"]:_on;
            __args: List _edge1 _edge2 (Vector 0 _target:y) (Vector 1 _target:y);
            _travelX: (_target - __intersection):x;
        }
    }
    @namespace("penstroke#upDiagonalOne
              , penstroke#downDiagonalTwo
              , penstroke#upDiagonalTwo") {
        @dictionary {
            .top center, .bottom center,  .diagonal-connection center{
                pinTo: Vector penstroke:_travelX 0;
            }
        }
    }

    /* the length of both downDiagonal* strokes is most defining for
     * the final shape of the w. It would be nice to define it in a manner
     * like "the length is so that .bottom left touches 0" However, that
     * would not reflect the intend of the original design, which has a
     * more spiky appearance.
     * The next simplest thing is a custom length adding variable for each
     * master (in units) which let's us control the spikyness very well.
     * We could try to add min/max restrictions:
     * max: left y bottom hits _zeroY
     * min: where the intersection on the y axis between down .bottom
     * left and up.bottom right is >= 0
     */
    @namespace("penstroke#downDiagonalOne
              , penstroke#downDiagonalTwo") {
        @dictionary {
            .bottom center {
                _edge1: penstroke[S".top left"]:_on;
                _edge2: parent:left:_on;
                __args: List _edge1 _edge2 (Vector 0 _zeroY) (Vector 1 _zeroY);
                _downDiagonalLengthFactor: 1;
                pinTo: ((__intersection - _edge2) * _downDiagonalLengthFactor) + Vector penstroke:_travelX 0;
            }
            /* this shall hit _unitY --the centerline of the serifs--
             * with its right top edge point*/
            .top center {
                _edge1: penstroke[S".bottom right"]:_on;
                _edge2: parent:right:_on;
                __args: List _edge1 _edge2 (Vector 0 _unitY) (Vector 1 _unitY);
                pinTo: (__intersection - _edge2) + Vector penstroke:_travelX 0;
            }
            /* close the gap to the serif by repositioning .top left */
            .top left {
                _edge1: penstroke[S".bottom left"]:on;
                _edge2: (Polar length base:onDir ) + parent:center:on;
                __args: List _edge1 _edge2 (Vector 0 _unitY) (Vector 1 _unitY);
                _movement: __intersection - parent:center:on;
            }
        }
        .top left {
            onDir: _movement:angle;
            onLength: _movement:length;
        }
    }
    @namespace("penstroke#upDiagonalOne, penstroke#upDiagonalTwo") {
        @dictionary {
            .bottom center {
                /* move this point so that the slope stays the same, but
                 * the right bottom point hits _zeroY
                 */
                _edge1: penstroke[S".top right"]:_on;
                _edge2: parent:right:_on;
                __args: List _edge1 _edge2 (Vector 0 _zeroY) (Vector 1 _zeroY);
                pinTo: (__intersection - _edge2) + Vector penstroke:_travelX 0;
            }
        }
    }
    @dictionary {
        contour#bottomFillOne p {
            _down: downDiagonalOne;
            _up: upDiagonalOne;
        }
        contour#bottomFillTwo p {
            _down: downDiagonalTwo;
            _up: upDiagonalTwo;
        }
    }
}
@namespace("glyph#v, glyph#w") {
    right, left, p {
        inTension: Infinity;
        outTension: Infinity;
    }
    @namespace("contour#bottomFillOne, contour#bottomFillTwo") {
        p.top.right {
            on: _down[S".bottom right"]:on;
        }
        p.top.left {
            on: _down[S".bottom left"]:on;
        }
        p.bottom.right {
            on: _up[S".bottom right"]:on;
        }
        /* the intersection of _zeroY and the left edge of _down */
        @dictionary {
            p.bottom.left {
                _edge1: _down[S".top left"]:on;
                _edge2: _down[S".bottom left"]:on;
                __args: List _edge1 _edge2 (Vector 0 _zeroY) (Vector 1 _zeroY);
            }
        }
        p.bottom.left {
            on: __intersection;
        }
    }
}

@namespace(glyph#y) {
    penstroke#downDiagonalOne *, p,
    penstroke#upDiagonalOne .top *{
        inTension: Infinity;
        outTension: Infinity;
    }
    penstroke#upDiagonalOne .diagonal-connection *{
        outTension: Infinity;
    }
    @dictionary{
        /* move horizontally to hit the right bottom corner of the down stroke
         * with this left edge
         */
        penstroke#upDiagonalOne {
            _edge1: this[S".top left"]:_on;
            _edge2: this[S".diagonal-connection left"]:_on;
            __args: List _edge1 _edge2 (Vector 0 _target:y) (Vector 1 _target:y);
            _travelX: (_target - __intersection):x;
        }
    }
    @namespace("contour#bottomFillOne") {
        @dictionary {
            /* the intersection of _zeroY and the right edge of _up */
            p.bottom.right {
                _edge1: _up[S".top right"]:on;
                _edge2: _up[S".diagonal-connection right"]:on;
            }
            /* the intersection of _zeroY and the left edge of _down */
            p.bottom.left {
                _edge1: _down[S".top left"]:on;
                _edge2: _down[S".bottom left"]:on;
            }
            p.bottom {
                __args: List _edge1 _edge2 (Vector 0 _zeroY) (Vector 1 _zeroY);
            }
        }
        p.top.right {
            on: _down[S".bottom right"]:on;
        }
        p.top.left {
            on: _down[S".bottom left"]:on;
        }
        p.bottom {
            on: __intersection;
        }
    }
    @namespace("penstroke#upDiagonalOne") {
        @dictionary {
            /* this shall hit _unitY --the centerline of the serifs--
             * with its left top edge point
             */
            .top center {
                _edge1: penstroke[S".diagonal-connection left"]:_on;
                _edge2: parent:left:_on;
                __args: List _edge1 _edge2 (Vector 0 _unitY) (Vector 1 _unitY);
                pinTo: (__intersection - _edge2) + Vector penstroke:_travelX 0;
            }

            /* need a way to adjust this nodes position along its slope direction */
            .diagonal-connection center {
                _edge1: penstroke[S".top center"]:_on;
                _edge2: this:_on;
                __args: List _edge1 _edge2 (Vector 0 _zeroY) (Vector 1 _zeroY);
                /* 1 moves this (up) to the baseline, 0 is no movement */
                _baselineMovement: 0;
                _movement: (__intersection - _edge2) * _baselineMovement;
                pinTo: _movement + Vector penstroke:_travelX 0;
            }
            point.drop > center {
                dropFixation: penstroke[S".drop.fixation"]:skeleton:on
            }
            point.drop > center {
                origin: scale * dropFixation;
                target: _scale * dropFixation;
                pinTo: target - origin;
            }
        }
    }
}

@namespace("glyph#v penstroke#upDiagonalOne, glyph#w penstroke#upDiagonalTwo") {
    @dictionary {
        /* this shall hit _unitY --the centerline of the serifs--
        * with its left top edge point
        */
        .top center {
            _edge1: penstroke[S".bottom left"]:_on;
            _edge2: parent:left:_on;
            __args: List _edge1 _edge2 (Vector 0 _unitY) (Vector 1 _unitY);
            pinTo: (__intersection - _edge2) + Vector penstroke:_travelX 0;
        }
    }
}
@namespace(glyph#v, glyph#y) {
    @dictionary{
        penstroke#topRightSerif center {
            referenceStroke: upDiagonalOne;
        }
    }
}
@namespace(glyph#w) {
    @dictionary{
        penstroke#topRightSerif center {
            referenceStroke: upDiagonalTwo;
        }
    }
    /* Use this with the w not with the v.
     * This is to have control over the length of the penstroke
     * it affects the width of the glyph and the size of the triangle
     * between the two v shapes.
     */
    @namespace(penstroke#upDiagonalOne) {
        @dictionary {
            .top center {
                _centerConnectionLengthFactor: 1;
                _shortening: (_on - penstroke[S".bottom center"]:_on) * -1 * (1 - _centerConnectionLengthFactor);
                pinTo: _shortening + Vector penstroke:_travelX 0;
            }
        }
    }
}
@namespace(glyph#x) {
    @import 'lib/linear-intersection.cps';
    @dictionary {
        left, right {
            _on: (Polar length base:onDir ) + parent:center:_on;
        }
        * {
            downStroke: glyph[S"#downStroke"];
            upStrokeLeft: glyph[S"#upStrokeLeft"];
            upStrokeRight: glyph[S"#upStrokeRight"];
            stemWidth: 2 * downStroke[S"point.top > right"]:onLength;
        }
        penstroke#topRightSerif center {
            referenceStroke: upStrokeRight;
        }
        penstroke#topLeftSerif center {
            referenceStroke: downStroke;
        }
        penstroke#bottomRightSerif center {
            referenceStroke: downStroke;
        }
        penstroke#bottomLeftSerif center {
            referenceStroke: upStrokeLeft;
        }

        penstroke#upStrokeLeft {
            _edge1: this[S".bottom left"]:_on;
            _edge2: this[S".connection left"]:_on;
            _target1: downStroke[S".top left"]:_on;
            _target2: downStroke[S".bottom left"]:_on;
        }
        penstroke#upStrokeRight {
            _edge1: this[S".top right"]:_on;
            _edge2: this[S".connection right"]:_on;
            _target1: downStroke[S".top right"]:_on;
            _target2: downStroke[S".bottom right"]:_on;
        }

        penstroke#upStrokeLeft, penstroke#upStrokeRight {
            _xCorrection: 0;
            _correction: Vector _xCorrection 0;
            __args: List (_edge1 + _correction) (_edge2 + _correction) _target1 _target2;
            _movement: __intersection - _edge2;
        }
        penstroke#upStrokeLeft .bottom center,
        penstroke#upStrokeRight .top center {
            pinTo: penstroke: _correction;
        }
        penstroke#upStrokeLeft .connection center,
        penstroke#upStrokeRight .connection center {
            pinTo: penstroke:_movement;
        }
    }
}

@namespace(glyph#z) {
    @dictionary {
        left, right {
            _on: (Polar length base:onDir ) + parent:center:_on;
        }
        * {
            diagonal: glyph[S"#diagonal"];
            armTop: glyph[S"#armTop"];
            terminalTop: glyph[S"#terminalTop"];
            armBottom: glyph[S"#armBottom"];
            terminalBottom: glyph[S"#terminalBottom"];
            _leftAdjust: 0;
            _rightAdjust: 0;
            _left: _leftAdjust + (min armTop[S".end center"]:_on:x terminalTop[S".to-arm left"]:_on:x);
            _right: _rightAdjust + (max armBottom[S".end center"]:_on:x terminalBottom[S".to-arm right"]:_on:x);
        }
        penstroke#diagonal .top center {
            pinTo: Vector 0 (armTop[S".to-diagonal right"]:_on:y - _on:y);
        }
        penstroke#diagonal .bottom center {
            pinTo: Vector 0 (armBottom[S".to-diagonal left"]:_on:y - _on:y);
        }
        penstroke#armTop .to-diagonal center {
            pinTo: Vector (diagonal[S".top center"]:on:x - _on:x) 0;
        }
        penstroke#armTop .end center {
            pinTo: Vector (_left - _on:x) 0;
        }
        penstroke#terminalTop center {
            pinTo: Vector (_left - parent:left:_on:x) 0;
        }
        penstroke#armBottom .to-diagonal center {
            pinTo: Vector (diagonal[S".bottom center"]:on:x - _on:x) 0;
        }
        penstroke#armBottom .end center {
            pinTo: Vector (_right - _on:x) 0;
        }
        penstroke#terminalBottom center {
            pinTo: Vector (_right - parent:right:_on:x) 0;
        }

    }
    contour#InterWebbingBottom .end{
        on: terminalBottom[S".end left"]:on;
    }
    contour#interWebbingTop .end{
        on: terminalTop[S".end right"]:on;
    }

    contour#InterWebbingBottom .corner{
        on: Vector terminalBottom[S".end left"]:on:x armBottom[S".end right"]:on:y;
    }
    contour#interWebbingTop .corner{
        on: Vector terminalTop[S".end right"]:on:x armTop[S".end left"]:on:y;
    }
    contour#InterWebbingBottom .arm {
        on: Vector
            (max armBottom[S".to-diagonal center"]:on:x
                 (transform * skeleton:on):x + _rightAdjust
            )
            armBottom[S".end right"]:on:y;
    }

    contour#interWebbingTop .arm {
        on: Vector
            (min armTop[S".to-diagonal center"]:on:x
                 (transform * skeleton:on):x + _leftAdjust
            )
            armTop[S".end left"]:on:y;
    }


}
