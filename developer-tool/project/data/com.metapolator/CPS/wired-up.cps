@import 'lib/MOM/primary.cps';
@import 'local/single-inheritance.cps';
@import 'local/weight.cps';
@import 'local/scale.cps';

/* standard names */
center > * {
    penstroke: parent:parent;
}
center {
    penstroke: parent;
}
p {
    contour: parent;
}

/***********
 * reusable patterns *
            **********/

/** pin-to pattern **/
  glyph#dvA penstroke#lowerBow center
, glyph#dvA penstroke#horizontalConnection center
, glyph#dvA penstroke#stem  center
, glyph#dvI penstroke#bubble center
, glyph#dvI penstroke#appendix center:i(1)
, glyph#dvI penstroke#verticalConnection center
, glyph#dvKHA penstroke#stem center
, glyph#dvKHA penstroke#upperBow center:i(-1)
, glyph#dvKHA penstroke#bowConnection center:i(1)
, glyph#dvBHA penstroke#bow center:i(0)
, glyph#dvBHA penstroke#horizontalConnection center
, glyph#dvBHA penstroke#stem center:i(-1)
, glyph#dvDA penstroke#verticalConnection center
, glyph#dvDA penstroke#bubble center
, glyph#dvDA penstroke#appendix center:i(0)
, glyph#dvDHA penstroke#upperBow center:i(-1)
, glyph#dvDHA penstroke#stem center
, glyph#dvDHA penstroke#leftBar center:i(0) /* used in the bold versions */
, glyph#dvSSA penstroke#stem center
, glyph#dvSSA penstroke#crossBar center:i(0)
, glyph#a penstroke#bowl center
, glyph#a penstroke#stem center:i(-1)
, glyph#a penstroke#stem center:i(-2)
, glyph#d penstroke#topSerif center:i(0)
, glyph#d penstroke#topSerif center:i(-1)
, glyph#d penstroke#bottomSerif center:i(0)
, glyph#d penstroke#bottomSerif center:i(-1)
, glyph#d penstroke#bowl center
, center.serif
, center.no-serif
, glyph#h penstroke#arch center
, glyph#n penstroke#arch center
, glyph#e penstroke#bar center
, glyph#e penstroke#stroke center:i(-1)
, glyph#e penstroke#stroke center:i(-2)
, center.drop
, glyph#i penstroke#dot center
, glyph#j penstroke#dot center
, glyph#b penstroke#bowl center.to-stem
, glyph#b penstroke#bowl center.top.horizontal
, glyph#b penstroke#bowl center.connection
, glyph#b penstroke#stem center.bottom
, glyph#c penstroke#cShape center.outstroke
, glyph#c penstroke#cShape center.horizontal.bottom
, glyph#f penstroke#horizontalStroke center.left
, glyph#g penstroke#ear center.to-base
, glyph#k penstroke#diagonal center
, glyph#m penstroke#archLeft center
, glyph#m penstroke#archRight center
, glyph#p penstroke#bowl center.connection
, glyph#p penstroke#bowl center.end
, glyph#q penstroke#bowl center.connection
, glyph#q penstroke#bowl center.end
, glyph#r penstroke#drop center
, glyph#t penstroke#horizontalStroke center.crossbar
, glyph#u penstroke#arch center.to-stem
, glyph#u penstroke#arch center.horizontal
, glyph#v penstroke#downDiagonalOne center
, glyph#v penstroke#upDiagonalOne center
, glyph#w penstroke#downDiagonalOne center
, glyph#w penstroke#upDiagonalOne center
, glyph#w penstroke#downDiagonalTwo center
, glyph#w penstroke#upDiagonalTwo center
, glyph#y penstroke#downDiagonalOne center
, glyph#y penstroke#upDiagonalOne center
, glyph#x penstroke#upStrokeLeft center
, glyph#x penstroke#upStrokeRight center
, glyph#x penstroke#downStroke center
, glyph#z penstroke center
{
    pinTo: Vector 0 0;
    _on: transform * baseNode:on;
    _in: transform * baseNode:in;
    _out: transform * baseNode:out;
}

  glyph#dvA penstroke#lowerBow center
, glyph#dvI penstroke#bubble center
, glyph#dvI penstroke#appendix center:i(1)
, glyph#dvKHA penstroke#stem center
, glyph#dvKHA penstroke#upperBow center:i(-1)
, glyph#dvKHA penstroke#bowConnection center:i(1)
, glyph#dvBHA penstroke#bow center:i(0)
, glyph#dvBHA penstroke#horizontalConnection center
, glyph#dvBHA penstroke#stem center:i(-1)
, glyph#dvDA penstroke#bubble center
, glyph#dvDA penstroke#appendix center:i(0)
, glyph#dvDHA penstroke#upperBow center:i(-1)
, glyph#dvDHA penstroke#stem center
, glyph#dvDHA penstroke#leftBar center:i(0) /* used in condensed extra bold */
, glyph#dvSSA penstroke#stem center
, glyph#dvSSA penstroke#crossBar center:i(0)
, glyph#a penstroke#bowl center
, glyph#a penstroke#stem center:i(-1)
, glyph#a penstroke#stem center:i(-2)
, glyph#d penstroke#topSerif center:i(0)
, glyph#d penstroke#topSerif center:i(-1)
, glyph#d penstroke#bottomSerif center:i(0)
, glyph#d penstroke#bottomSerif center:i(-1)
, glyph#d penstroke#bowl center
, center.serif
, center.no-serif
, glyph#h penstroke#arch center
, glyph#n penstroke#arch center
, glyph#e penstroke#bar center
, glyph#e penstroke#stroke center:i(-1)
, glyph#e penstroke#stroke center:i(-2)
, center.drop
, glyph#i penstroke#dot center
, glyph#j penstroke#dot center
, glyph#b penstroke#bowl center.to-stem
, glyph#b penstroke#bowl center.top.horizontal
, glyph#b penstroke#bowl center.connection
, glyph#b penstroke#stem center.bottom
, glyph#c penstroke#cShape center.outstroke
, glyph#c penstroke#cShape center.horizontal.bottom
, glyph#f penstroke#horizontalStroke center.left
, glyph#g penstroke#ear center.to-base
, glyph#k penstroke#diagonal center
, glyph#m penstroke#archLeft center
, glyph#m penstroke#archRight center
, glyph#p penstroke#bowl center.connection
, glyph#p penstroke#bowl center.end
, glyph#q penstroke#bowl center.connection
, glyph#q penstroke#bowl center.end
, glyph#r penstroke#drop center
, glyph#t penstroke#horizontalStroke center.crossbar
, glyph#u penstroke#arch center.to-stem
, glyph#u penstroke#arch center.horizontal
, glyph#v penstroke#downDiagonalOne center
, glyph#v penstroke#upDiagonalOne center
, glyph#w penstroke#downDiagonalOne center
, glyph#w penstroke#upDiagonalOne center
, glyph#w penstroke#downDiagonalTwo center
, glyph#w penstroke#upDiagonalTwo center
, glyph#y penstroke#downDiagonalOne center
, glyph#y penstroke#upDiagonalOne center
, glyph#x penstroke#upStrokeLeft center
, glyph#x penstroke#upStrokeRight center
, glyph#x penstroke#downStroke center
, glyph#z penstroke center
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
 *    - the glyph#{name} penstroke#verticalConnection center element
 *      must be present in the pin-to pattern dictionary, but not in the
 *      second rule of that.
 */

@namespace("
  glyph#dvI penstroke#verticalConnection
, glyph#dvDA penstroke#verticalConnection
") {
    center {
        target: verticalTargetStroke:children[0]:on;
        rightIntrinsic: Polar right:onLength right:onDir;
        top: bar:children[0]:on;
    }
    center:i(0) left {
        offset: Vector 0 0;
        _on: (Polar length baseNode:onDir) + offset;
    }
    center:i(1)  {
        on: Vector (target:x - rightIntrinsic:x)  top:y;
    }
    center:i(0)  {
        on: Vector (target:x - rightIntrinsic:x) (target:y - rightIntrinsic:y);
    }
    center {
        on: Vector (target:x - rightIntrinsic:x)  _on:y;
        in: Vector (target:x - rightIntrinsic:x) _in:y;
        out: Vector (target:x - rightIntrinsic:x) _out:y;
    }

    /* end inside of the verticalTargetStroke
     * these values will probably need change in the masters
     */
    center:i(0) > left {
        onDir: _on:angle;
        onLength: _on:length;
    }
    center:i(0) > right {
        inTension: Infinity;
    }
}

/** uniform scale **
 * this makes the penstroke independed from the rest of
 * the width/weigth setup by scaling it uniformly
 * use 1 for the original size
 */
@namespace("
  glyph#dvA penstroke#lowerBow center:i(0)
, glyph#dvA penstroke#lowerBow center:i(1)

, glyph#dvI penstroke#bubble center
, glyph#dvDA penstroke#bubble center

") {
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

  glyph#dvA penstroke#lowerBow center:i(0)
, glyph#dvA penstroke#lowerBow center:i(1)
, glyph#dvI penstroke#bubble center
, glyph#dvDA penstroke#bubble center
{
    uniformScale: 1;
    heightFactor: uniformScale;
    widthFactor: uniformScale;

}

, glyph#a penstroke#stem center:i(-1)
, glyph#a penstroke#stem center:i(-2)
, center.drop
, glyph#i penstroke#dot center
, glyph#j penstroke#dot center
{
    uniformScale: 1;
    scale: Scaling uniformScale uniformScale;
}

@namespace("
  glyph#dvA penstroke#lowerBow center:i(0)
, glyph#dvA penstroke#lowerBow center:i(1)
, glyph#dvI penstroke#bubble center
, glyph#dvDA penstroke#bubble center
, glyph#a penstroke#stem center:i(-1)
, glyph#a penstroke#stem center:i(-2)
, center.drop
, glyph#i penstroke#dot center
, glyph#j penstroke#dot center
") {
    left, right {
        weightFactor: parent:uniformScale;
    }
}


/**
 * Point class bases setup of the simple serifs of this font
 */
center.serif,
center.no-serif {
    origin: this:_on:x;
    moveX: 0;
    pinTo: Vector moveX 0;
}
center {
/* should be defined within the masters*/
    serifLength: 0;
}

center > *{
/* I think this is not used */
    serifLength: parent:serifLength;
}

center.serif {
    _serifLength: serifLength;
}
center.no-serif {
    _serifLength: 0;
}

/* We'll need to set `referenceStroke` to the actual penstroke that
    * is the reference stroke of the serif.
    *
    */
center.serif.top, center.no-serif.top {
    target: referenceStroke[S"center.top"];
}

center.serif.bottom, center.no-serif.bottom {
    target: referenceStroke[S"center.bottom"];
}

center.serif.left, center.no-serif.left {
    moveX: target:left:on:x - origin - _serifLength;
}
center.serif.right, center.no-serif.right {
    moveX: target:right:on:x - origin + _serifLength;
}


/*********************
 * general setup that pins point to positions etc. *
                             ***********************/
@namespace("glyph#dvA") {
    center, center > * {
        bowConnection: glyph[S"#bowConnection"];
        lowerBow: glyph[S"#lowerBow"];
        upperBow: glyph[S"#upperBow"];
        stem: glyph[S"#stem"];
        bar: glyph[S"#bar"];
    }
    @namespace(penstroke#bowConnection) {
        center > left, center > right {
            onLength: (upperBow:children[0]:left:on:y - lowerBow:children[-1]:left:on:y) / 2;
        }
    }
    @namespace(penstroke#horizontalConnection) {
        center:i(0) {
            on: Vector stem:children[0]:on:x _on:y;
        }
        center:i(1) {
            on: Vector lowerBow:children[-3]:on:x _on:y;
        }
    }
    @namespace(penstroke#stem) {
        center:i(-1) {
            on: Vector _on:x bar:children[0]:on:y;
        }
    }
}

@namespace("glyph#dvI") {
    center, center>* {
        sShape: glyph[S"#sShape"];
        bar: glyph[S"#bar"];
        verticalTargetStroke: sShape;
    }
    @namespace(penstroke#bubble) {
        center {
            /* calculate the unpinned location, so we can calculate
                * the offset to move
                */
            target: sShape:children[-1]:left:on;
            pinTo: target - penstroke:children[-1]:_on;
        }
    }
    @namespace("penstroke#appendix") {
        center:i(1) {
            target: sShape:children[-1]:left:on;
            reference: penstroke:children[1];
            rightIntrinsic: Polar reference:right:onLength reference:right:onDir;
            pinTo: target - reference:_on - rightIntrinsic;
        }

        center:i(1) {
            /* center:i(0) is positioned relative from here */
            in: on + Polar 25 deg 250;
        }

        center:i(0){
            on: penstroke:children[1]:on + Polar 128 deg 235;
            out: penstroke:children[1]:on + Polar 90 deg 242;
        }
    }
}
@namespace("glyph#dvKHA") {
    center, center > *{
        bowConnection: glyph[S"#bowConnection"];
        spiralBow: glyph[S"#spiralBow"];
        upperBow: glyph[S"#upperBow"];
        stem: glyph[S"#stem"];
        bar: glyph[S"#bar"];
    }

    @namespace("penstroke#upperBow") {
        center:i(-1) {
            target: bar:children[-1]:left:on:y;
            yOff: (Polar left:onLength left:onDir):y;
            pinTo: Vector 0 (target - _on:y - yOff);
        }
    }
    @namespace("penstroke#stem") {
        @namespace("center:i(1), center:i(2)") /*";*/ {
            right {
                inTension: Infinity;
                outTension: Infinity;
            }
        }
        center {
            target: spiralBow:children[-5]:right:on:x;
            reference: penstroke:children[0]:_on:x;
            pinTo: Vector (target - reference + stemFitComepensation) 0;
            /* There is no correct rule for this. I'm picking just
                * something that is roughly right.
                */
            stemFitComepensation: right:onLength/3
        }
    }
}
@namespace("glyph#dvBHA") {
    center, center > *{
        bowConnection: glyph[S"#bowConnection"];
        bow: glyph[S"#bow"];
        stem: glyph[S"#stem"];
        bar: glyph[S"#bar"];
    }
    @namespace("penstroke#bow") {
        center:i(0) {
            target: penstroke:children[-3]:left:on:x;
            pinTo: Vector (target - _on:x) 0;
        }
    }
    @namespace("penstroke#horizontalConnection") {
        center:i(-1) {
            target: bow:children[-3]:on:x;
            pinTo: Vector (target - _on:x) 0;
        }
        center:i(0) {
            target: stem:children[0]:on:x;
            pinTo: Vector (target - _on:x) 0;
        }
    }
    @namespace("penstroke#stem") {
        center:i(-1) {
            target: bar:children[0]:on:y;
            pinTo: Vector 0 (target - _on:y);
        }
    }
}
@namespace("glyph#dvDA") {
    center, center > * {
        verticalConnection: glyph[S"#verticalConnection"];
        bow: glyph[S"#bow"];
        stem: glyph[S"#stem"];
        bar: glyph[S"#bar"];
        verticalTargetStroke: bow;
    }
    @namespace(penstroke#bubble) {
        center {
            /* calculate the unpinned location, so we can calculate
            * the offset to move
            */
            target: bow:children[-1]:right:on;
            pinTo: target - penstroke:children[-1]:_on;
        }
    }
    @namespace(penstroke#appendix) {
        center:i(0) {
            target: bow:children[-1]:right:on;
            reference: penstroke:children[0];
            rightIntrinsic: Polar reference:right:onLength reference:right:onDir;
            pinTo: target - reference:_on - rightIntrinsic;
        }
        center:i(0) {
            /* point:i(1) is positioned relative from here */
            out: on + Polar 25 deg 300;
        }

        center:i(1) {
            on: penstroke:children[0]:on + Polar 128 deg 325;
            in: penstroke:children[0]:on + Polar 90 deg 316;
        }
    }
}
@namespace(glyph#dvDHA) {
    center, center > * {
        bowConnection: glyph[S"#bowConnection"];
        lowerBow: glyph[S"#lowerBow"];
        upperBow: glyph[S"#upperBow"];
        stem: glyph[S"#stem"];
        leftBar: glyph[S"#leftBar"];
        rightBar: glyph[S"#rightBar"];
    }
    @namespace(penstroke#upperBow) {
        /* fix -1 right y to leftBar 0 left y */
            center:i(-1) {
                target: leftBar:children[0]:left:on:y;
                reference: penstroke:children[-1];
                rightIntrinsic: (Polar reference:right:onLength reference:right:onDir):y;
                pinTo: Vector 0 (target - reference:_on:y - rightIntrinsic);
            }
            /* this moves the vertical extreme half the way that the
             * curve end was moved. FIXME: should I do this kind of compensation
             * more often? In this case the effect is small but there.
             */
            center:i(-2) {
                yTranslate: (penstroke:children[-1]:pinTo:y) / 2
            }
    }
    @namespace(penstroke#stem) {
        /* fix all xses to lowerBow 0 right x */
        center {
            target: lowerBow:children[0]:right:on:x;
            reference: penstroke:children[0];
            leftIntrinsic: (Polar reference:left:onLength reference:left:onDir):x;
            pinTo: Vector (target - reference:_on:x - leftIntrinsic) 0;
        }
    }
}
@namespace(glyph#dvSSA) {
    center, center > *{
        bow: glyph[S"#bow"];
        crossBar: glyph[S"#crossBar"];
        stem: glyph[S"#stem"];
        bar: glyph[S"#bar"];
    }
    @namespace(penstroke#stem) {
        /* fix all xses to bow 0 right x */
        center {
            target: bow:children[0]:right:on:x;
            reference: penstroke:children[0];
            leftIntrinsic: (Polar reference:left:onLength reference:left:onDir):x;
            pinTo: Vector (target - reference:_on:x - leftIntrinsic) 0;
        }
    }
    @namespace(penstroke#crossBar) {
        /* fix all crossBar 0 x and y to the stem
         * crossBar is a simple straight line, so we find the
         * ratio between x and y and apply the change of x to that function
         * to get the change of y
         */
        center:i(0)  {
            pinX: stem:children[0]:on:x - this:_on:x;
            ratio: penstroke:children[1]:on - this:_on;
            pinY: pinX * ratio:y/ratio:x;
            pinTo: Vector pinX pinY;
        }
    }
}

@namespace(glyph#a) {
    center, center > * {
        bowl: glyph[S"#bowl"];
        stem: glyph[S"#stem"];
    }
    @namespace("penstroke#bowl") {
        /* fix the bowl 0 and -1 to the stem, where -1 center touches it */
        center:i(0),
        center:i(-1) {
            target: stem:children[2]:left:on:x;
            origin: penstroke:children[-1]:_on:x;
            pinX: target - origin;
            pinTo: Vector pinX 0;
        }
    }
    @namespace("penstroke#stem") {
        /* fix the custom scaled bowl to the stem*/
        center:i(-2),
        center:i(-1) {
            /* this is where the center is without the here calculated movement
             * and without the xTranslate and yTranslate variables
             */
            fixture: stem:children[-2]:baseNode:on;
            origin: scale * fixture;
            /* target is where the center would be without uniformScaling,
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
@namespace(glyph#d) {
    center, center > * {
        bowl: glyph[S"#bowl"];
        stem: glyph[S"#stem"];
        topSerif: glyph[S"#topSerif"];
        bottomSerif: glyph[S"#bottomSerif"];
        stemWidth: 2 * stem:children[0]:right:onLength;
    }
    @namespace(penstroke#bowl) {
        /* fix the bowl 0 and -1 to the stem, where 0 right touches it */
        center:i(0),
        center:i(-1) {
            target: stem:children[0]:left:on:x;
            origin: penstroke:children[0];
            rightOffset: (Polar origin:right:onLength origin:right:onDir):x;
            pinX: target - origin:_on:x - rightOffset;
            pinTo: Vector pinX 0;
        }
        center:i(1),
        center:i(-2) {
            pinTo: Vector (penstroke:children[0]:pinX / 2) 0;
        }
    }
    @namespace(penstroke#topSerif) {
        center:i(0) {
            origin: this:_on:x;
            target: stem:children[-1]:right:on:x;
            pinTo: Vector (target-origin) 0;
        }
        center:i(-1) {
            origin: this:_on:x;
            target: stem:children[-1]:left:on:x;
            pinTo: Vector (target-origin-serifLength) 0;
        }
    }
    @namespace(penstroke#bottomSerif) {
        center:i(0) {
            origin: this:_on:x;
            target: stem:children[0]:right:on:x;
            pinTo: Vector (target-origin+serifLength) 0;
        }
        center:i(-1) {
            origin: this:_on:x;
            target: stem:children[0]:left:on:x;
            pinTo: Vector (target-origin) 0;
        }
    }
}

@namespace("glyph#h, glyph#n") {
    center, center > * {
        arch: glyph[S"#arch"];
        stem: glyph[S"#stem"];
        topSerif: glyph[S"#topSerif"];
        bottomLeftSerif: glyph[S"#bottomLeftSerif"];
        bottomRightSerif: glyph[S"#bottomRightSerif"];
        stemWidth: 2 * stem:children[0]:right:onLength;
    }
    @namespace("penstroke#topSerif, penstroke#bottomLeftSerif") {
        center {
            referenceStroke: stem;
        }
    }
    @namespace("penstroke#bottomRightSerif") {
        center {
            referenceStroke: arch;
        }
    }
    @namespace("penstroke#arch") {
        center:i(-1) {
            origin: penstroke:children[-1]:_on:x;
            target: stem:children[0]:right:on:x;
            pinTo: Vector (target - origin) 0;
        }
    }
}

@namespace("glyph#m") {
    center, center > * {
        archLeft: glyph[S"#archLeft"];
        archRight: glyph[S"#archRight"];
        stem: glyph[S"#stem"];
        topSerif: glyph[S"#topSerif"];
        bottomLeftSerif: glyph[S"#bottomLeftSerif"];
        bottomCenterSerif: glyph[S"#bottomLeftSerif"];
        bottomRightSerif: glyph[S"#bottomRightSerif"];
        stemWidth: 2 * stem:children[0]:right:onLength;
    }

    penstroke#topSerif center,
    penstroke#bottomLeftSerif center {
        referenceStroke: stem;
    }
    penstroke#bottomRightSerif center {
        referenceStroke: archRight;
    }
    penstroke#bottomCenterSerif center {
        referenceStroke: archLeft;
    }
    penstroke#archLeft center.connection,
    penstroke#archRight center.connection {
        origin: _on:x;
        pinTo: Vector (target - origin) 0;
    }
    penstroke#archLeft center.connection {
        target: stem[S".top right"]:on:x;
    }
    penstroke#archRight center.connection {
        targetNode: archLeft[S".vertical"];
        targetPoint: targetNode:right;
        _target: targetPoint:on:x - (Polar left:onLength left:onDir):x;
        target: _target;
    }
}



@namespace("glyph#k") {
    center, center > * {
        diagonal: glyph[S"#diagonal"];
        stem: glyph[S"#stem"];
        tail: glyph[S"#tail"];
        topSerif: glyph[S"#topSerif"];
        bottomSerif: glyph[S"#bottomSerif"];
        topRightSerif: glyph[S"#topRightSerif"];
        stemWidth: 2 * stem:children[0]:right:onLength;
    }
    @namespace("penstroke#topSerif, penstroke#bottomSerif") {
        center {
            referenceStroke: stem;
        }
    }
    @namespace("penstroke#topRightSerif") {
        center {
            referenceStroke: diagonal;
        }
    }
    @namespace(penstroke#diagonal) {
        /* fix diagonal .to-stem to the stem
         * diagonal is a simple straight line, so we find the
         * ratio between x and y and apply the change of x to that function
         * to get the change of y
         */
        center.to-base {
            targetX: stem[S"center.top"]:on:x - _on:x;
            _origin: penstroke[S"center.top"]:on;
            _dir: _origin - _on;
            slope: _dir:y/_dir:x;
            yIntersept: slope * (0 - _origin:x) + _origin:y;
            pinY: targetX * slope;
            pinTo: Vector targetX pinY;
        }
    }

    @namespace(penstroke#tail) {
        @import 'local/linear-intersection.cps';
        * {
            southEast: penstroke[S"center.south-east"];
            toBase: diagonal[S"center.to-base"];
        }
        center.to-diagonal {
            _origin: southEast:on;
            __args: List _origin _on toBase:_origin toBase:on;
            _on: transform * baseNode:on;
            on: __intersection
        }
        @namespace("center.to-diagonal") {
            left, right {
                _origin: southEast[this:type]:on;
                __args: List _origin _on toBase:_origin toBase:on;
                _on: (Polar length baseNode:onDir ) + parent:on;
                _movement:   __intersection - parent:on;
                onDir: _movement:angle;
                onLength: _movement:length;
            }
            right {
                inDir: (on - parent:on):angle;
            }
            left {
                inDir: (on - parent:on):angle;
            }
        }
    }
}

@namespace("glyph#l") {
    center, center > * {
        stem: glyph[S"#stem"];
        topSerif: glyph[S"#topSerif"];
        bottomSerif: glyph[S"#bottomSerif"];
        stemWidth: 2 * stem:children[0]:right:onLength;
    }
    @namespace("penstroke#topSerif, penstroke#bottomSerif") {
        center {
            referenceStroke: stem;
        }
    }
}

@namespace(glyph#e) {
    center, center > * {
        stroke: glyph[S"#stroke"];
        bar: glyph[S"#bar"];
    }
    @namespace(penstroke#bar) {
        center {
            origin: penstroke:children[0]:_on;
            target: stroke:children[0]:on;
            pinTo: target - origin
                - (Polar left:onLength left:onDir);
        }
    }
    @namespace(penstroke#stroke) {
        center:i(-1) {
            origin: this:_on:x
                + (Polar right:onLength right:onDir):x;
            target: penstroke:children[0]:right:on:x;
            pinTo: Vector (target - origin) 0;
        }
        center:i(-2) {
            pinTo: Vector (penstroke:children[-1]:pinTo:x/2) 0;
        }
    }
}

@namespace(glyph#s) {
    center, center > * {
        sShape: glyph[S"#sShape"];
    }
    @namespace("penstroke#sShape") {
        /* fix the custom scaled bowl to the sShape*/

        center.drop.top {
            dropFixation: sShape[S"center.drop.top.fixation"]:baseNode:on;
        }
        center.drop.bottom {
            dropFixation: sShape[S"center.drop.bottom.fixation"]:baseNode:on;
        }

        center.drop {
            /* this is where the center is without the here calculated movement
             * and without the xTranslate and yTranslate variables
             */
            origin: scale * dropFixation;
            /* target is where the center would be without uniformScaling,
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

@namespace(glyph#i) {
    center, center > * {
        stem: glyph[S"#stem"];
        topSerif: glyph[S"#topSerif"];
        bottomSerif: glyph[S"#bottomSerif"];
        stemWidth: 2 * stem:children[0]:right:onLength;
    }
    @namespace("penstroke#dot") {
        center {
            dotFixation: penstroke:children[1]:baseNode:on;
            /* this is where the center is without the here calculated movement
                * and without the xTranslate and yTranslate variables
                */
            origin: scale * dotFixation;
            /* target is where the center would be without uniformScaling,
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
    @namespace("penstroke#topSerif, penstroke#bottomSerif") {
        center {
            referenceStroke: stem;
        }
    }
}

@namespace(glyph#j) {
    center, center > * {
        stem: glyph[S"#stem"];
        topSerif: glyph[S"#topSerif"];
        stemWidth: 2 * stem[S"center.top"]:right:onLength;
    }
    @namespace("penstroke#dot") {
        center {
            dotFixation: penstroke:children[1]:baseNode:on;
            /* this is where the center is without the here calculated movement
                * and without the xTranslate and yTranslate variables
                */
            origin: scale * dotFixation;
            /* target is where the center would be without uniformScaling,
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
    @namespace("penstroke#stem") {
        /* fix the drop to the stem*/
        center {
            drop: penstroke[S"center.drop.fixation"];
            dropFixation: drop:baseNode:on;
        }
        center.drop {
            /* this is where the center is without the here calculated movement
             * and without the xTranslate and yTranslate variables
             */
            origin: scale * dropFixation;
            /* target is where the center would be without uniformScaling,
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
    @namespace("penstroke#topSerif") {
        center {
            referenceStroke: stem;
        }
    }
}


@namespace(glyph#b) {
    center, center > *,
    p {
        stem: glyph[S"#stem"];
        bowl: glyph[S"#bowl"];
        topSerif: glyph[S"#topSerif"];
        stemWidth: 2 * stem[S".top"]:right:onLength;
    }
    @namespace("penstroke#topSerif") {
        center {
            referenceStroke: stem;
        }
    }
    @namespace("contour#C\:terminal") {
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
            _on: baseNode:on;
        }
        p.bottom.inner {
            _xRef: parent[S".bottom.outer"];
            _x: (_on:x - _xRef:_on:x) * weightFactor + _xRef:on:x;
        }
        p.bridge {
            _xRef: stem[S"center.bottom"]:on;
            _yRef: _xRef;
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
        center.to-stem {
            target: stem[S"center.top"]:right:on:x;
            origin: this;
            rightOffset: (Polar origin:right:onLength origin:right:onDir):x;
            pinX: target - origin:_on:x - rightOffset;
            pinTo: Vector pinX 0;
        }
        center.top.horizontal {
            pinTo: Vector (penstroke[S"center.to-stem"]:pinX / 2) 0;
        }
    }
}
@namespace(glyph#c){
    @namespace("penstroke#cShape") {
        /* fix the drop to the cShape*/
        center {
            drop: penstroke[S"center.drop.top.fixation"];
            dropFixation: drop:baseNode:on;
            outstroke: penstroke[S"center.outstroke"];
        }
        center.drop {
            /* this is where the center is without the here calculated movement
             * and without the xTranslate and yTranslate variables
             */
            origin: scale * dropFixation;
            /* target is where the center would be without uniformScaling,
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
        center.outstroke {
            origin: this:_on:x
                + (Polar left:onLength left:onDir):x;
            target: drop:left:on:x;
            pinTo: Vector (target - origin) 0;
        }
        center.horizontal.bottom {
            pinTo: Vector (outstroke:pinTo:x/2) 0;
        }
    }
}
@namespace(glyph#f) {
    center, center > * {
        stem: glyph[S"#stem"];
        bottomSerif: glyph[S"#bottomSerif"];
        stemWidth: 2 * stem[S".bottom"]:right:onLength;
    }
    @namespace("penstroke#stem") {
        /* fix the drop to the stem*/
        center {
            drop: penstroke[S"center.drop.top.fixation"];
            dropFixation: drop:baseNode:on;
        }
        center.drop {
            /* this is where the center is without the here calculated movement
             * and without the xTranslate and yTranslate variables
             */
            origin: scale * dropFixation;
            /* target is where the center would be without uniformScaling,
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
    @namespace("penstroke#horizontalStroke") {
        center.left {
            target: bottomSerif[S"center.left"]:on;
            pinTo: Vector (target:x - _on:x) 0;
        }
    }
    @namespace("penstroke#bottomSerif") {
        center {
            referenceStroke: stem;
        }
    }
}

@namespace(glyph#g) {
    center, center > * {
        leftBowl: glyph[S"#leftBowl"];
        rightBowl: glyph[S"#rightBowl"];
        ear: glyph[S"#ear"];
        loop: glyph[S"loop"];
    }
    @namespace("penstroke#ear") {
        /* fix the drop to the stem*/
         center {
            drop: penstroke[S"center.drop.top.fixation"];
            dropFixation: drop:baseNode:on;
        }
        center.drop {
            /* this is where the center is without the here calculated movement
             * and without the xTranslate and yTranslate variables
             */
            origin: scale * dropFixation;
            /* target is where the center would be without uniformScaling,
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

@namespace("glyph#p") {
    center, center > * {
        stem: glyph[S"#stem"];
        topSerif: glyph[S"#topSerif"];
        bottomSerif: glyph[S"#bottomSerif"];
        bowl: glyph[S"#bowl"];
        stemWidth: 2 * stem:children[0]:right:onLength;
    }
    @namespace(penstroke#bowl) {
        /* fix the bowl .connection and .end to the stem, where .connection right touches it */
        center.connection,
        center.end {
            target: stem[S".bottom right"]:on:x;
            origin: penstroke[S"center.connection"];
            rightOffset: (Polar origin:right:onLength origin:right:onDir):x;
            pinX: target - origin:_on:x - rightOffset;
            pinTo: Vector pinX 0;
        }
        center:i(1),
        center:i(-2) {
            pinTo: Vector (penstroke:children[0]:pinX / 2) 0;
        }
    }
    @namespace("penstroke#bottomSerif, penstroke#topSerif") {
        center {
            referenceStroke: stem;
        }
    }
}

@namespace("glyph#q") {
    center, center > * {
        stem: glyph[S"#stem"];
        topSerif: glyph[S"#topSerif"];
        bottomSerif: glyph[S"#bottomSerif"];
        bowl: glyph[S"#bowl"];
        stemWidth: 2 * stem:children[0]:right:onLength;
    }
    @namespace(penstroke#bowl) {
        /* fix the bowl .connection and .end to the stem, where .connection right touches it */
        center.connection,
        center.end {
            target: stem[S".bottom left"]:on:x;
            origin: penstroke[S"center.connection"];
            leftOffset: (Polar origin:left:onLength origin:left:onDir):x;
            pinX: target - origin:_on:x - leftOffset;
            pinTo: Vector pinX 0;
        }
        center:i(1),
        center:i(-2) {
            pinTo: Vector (penstroke:children[0]:pinX / 2) 0;
        }
    }
    @namespace("penstroke#bottomSerif, penstroke#topSerif") {
        center {
            referenceStroke: stem;
        }
    }
}

@namespace(glyph#r) {
    center, center > * {
        stem: glyph[S"#stem"];
        topSerif: glyph[S"#topSerif"];
        bottomSerif: glyph[S"#bottomSerif"];
        drop: glyph[S"#drop"];
        stemWidth: 2 * stem:children[0]:right:onLength;
    }
    @namespace("penstroke#bottomSerif, penstroke#topSerif") {
         center {
            referenceStroke: stem;
        }
    }
    @namespace("penstroke#drop") {
        center.connection {
            target: stem[S".top right"]:on:x;
            origin: penstroke[S"center.connection"];
            rightOffset: (Polar origin:right:onLength origin:right:onDir):x;
            pinX: target - origin:_on:x - rightOffset;
            pinTo: Vector pinX 0;
        }

        /* fix the drop to the stroke*/
        center {
            drop: penstroke[S"center.drop.fixation"];
            dropFixation: drop:baseNode:on;
        }
        center.drop {
            /* this is where the center is without the here calculated movement
             * and without the xTranslate and yTranslate variables
             */
            origin: scale * dropFixation;
            /* target is where the center would be without uniformScaling,
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

@namespace(glyph#t) {
    center, center > * , p{
        stem: glyph[S"#stem"];
        horizontalStroke: glyph[S"#horizontalStroke"];
        inStroke: glyph[S"#C\:inStroke"];
        stemWidth: 2 * stem[S"center.top > right"]:onLength;
    }
    @namespace("penstroke#horizontalStroke") {
        center {
            referenceStroke: stem;
        }
    }

    @namespace("contour#C\:inStroke") {
        p {
            _bottomXReference: stem[S"center.top"];
            _bottomY: horizontalStroke[S"center.crossbar right"]:on:y;
            on: baseNode:on;
        }
        p.bottom.left {
            on: Vector _bottomXReference:left:on:x _bottomY;
        }
        p.bottom.right {
            on: Vector _bottomXReference:right:on:x _bottomY;
        }
        p.top.right {
            on: Vector parent[S"p.bottom.right"]:on:x baseNode:on:y;
        }
        p.top.left {
            on: ((baseNode:on - parent[S"p.top.right"]:baseNode:on) * weightFactor) + parent[S"p.top.right"]:on;
        }
    }
}

@namespace(glyph#u) {
    center, center > * , p {
        stem: glyph[S"#stem"];
        arch: glyph[S"#arch"];
        stemWidth: 2 * stem[S"center.top > right"]:onLength;
    }
    @namespace("penstroke#topLeftSerif") {
        center {
            referenceStroke: arch;
        }
    }
    @namespace("penstroke#topRightSerif, penstroke#bottomSerif") {
        center {
            referenceStroke: stem;
        }
    }
    @namespace("penstroke#arch") {
        center.to-stem {
            targetX: stem[S".bottom left"]:on:x;
            originX: _on:x;
            pinTo: Vector (targetX - originX) 0;
            yTranslate: 15;
        }
        center.horizontal {
            _pinTo: Vector (penstroke[S"center.to-stem"]:pinTo:x / 2) 0
        }
    }
}
/* shared between v, w and y */
@namespace(glyph#v, glyph#w, glyph#y) {
    left, right {
        _on: (Polar length baseNode:onDir ) + parent:_on;
    }
    * {
        _zeroY: 0;
        _unitY:  glyph[S"penstroke#topLeftSerif center"]:_on:y;
    }
    penstroke, center,center > * , p {
        downDiagonalOne: glyph[S"#downDiagonalOne"];
        downDiagonalTwo: glyph[S"#downDiagonalTwo"];
        upDiagonalOne: glyph[S"#upDiagonalOne"];
        upDiagonalTwo: glyph[S"#upDiagonalTwo"];
        /* share this with glyph#v*/
        stemWidth: 1.3 * downDiagonalOne[S"center.bottom > right"]:onLength;
    }
    penstroke#topLeftSerif center {
        referenceStroke: downDiagonalOne;
    }
    penstroke#topCenterSerif center {
        referenceStroke: downDiagonalTwo;
    }

    /* upDiagonalOne .left edge shall hit downDiagonalOne .bottom right:on */
    /* downDiagonalTwo .left edge shall hit upDiagonalOne .top right:on */
    /* upDiagonalTwo .left edge shall hit downDiagonalTwo .bottom right:on */
    @import 'local/linear-intersection.cps';
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
    @namespace("penstroke#upDiagonalOne
              , penstroke#downDiagonalTwo
              , penstroke#upDiagonalTwo") {
        center.top , center.bottom,  center.diagonal-connection {
            pinTo: Vector penstroke:_travelX 0;
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
        center.bottom {
            _edge1: penstroke[S".top left"]:_on;
            _edge2: left:_on;
            __args: List _edge1 _edge2 (Vector 0 _zeroY) (Vector 1 _zeroY);
            _downDiagonalLengthFactor: 1;
            pinTo: ((__intersection - _edge2) * _downDiagonalLengthFactor) + Vector penstroke:_travelX 0;
        }
        /* this shall hit _unitY --the centerline of the serifs--
         * with its right top edge point*/
        center.top {
            _edge1: penstroke[S".bottom right"]:_on;
            _edge2: right:_on;
            __args: List _edge1 _edge2 (Vector 0 _unitY) (Vector 1 _unitY);
            pinTo: (__intersection - _edge2) + Vector penstroke:_travelX 0;
        }
        /* close the gap to the serif by repositioning .top left */
        center.top left {
            _edge1: penstroke[S".bottom left"]:on;
            _edge2: (Polar length baseNode:onDir ) + parent:on;
            __args: List _edge1 _edge2 (Vector 0 _unitY) (Vector 1 _unitY);
            _movement: __intersection - parent:on;
            onDir: _movement:angle;
            onLength: _movement:length;
        }
    }
    @namespace("penstroke#upDiagonalOne, penstroke#upDiagonalTwo") {
        center.bottom {
            /* move this center so that the slope stays the same, but
                * the right bottom center hits _zeroY
                */
            _edge1: penstroke[S".top right"]:_on;
            _edge2: right:_on;
            __args: List _edge1 _edge2 (Vector 0 _zeroY) (Vector 1 _zeroY);
            pinTo: (__intersection - _edge2) + Vector penstroke:_travelX 0;
        }
    }
    contour#C\:bottomFillOne p {
        _down: downDiagonalOne;
        _up: upDiagonalOne;
    }
    contour#C\:bottomFillTwo p {
        _down: downDiagonalTwo;
        _up: upDiagonalTwo;
    }
}
@namespace("glyph#v, glyph#w") {
    right, left, p {
        inTension: Infinity;
        outTension: Infinity;
    }
    @namespace("contour#C\:bottomFillOne, contour#C\:bottomFillTwo") {
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
        p.bottom.left {
            _edge1: _down[S".top left"]:on;
            _edge2: _down[S".bottom left"]:on;
            __args: List _edge1 _edge2 (Vector 0 _zeroY) (Vector 1 _zeroY);
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
    /* move horizontally to hit the right bottom corner of the down stroke
    * with this left edge
    */
    penstroke#upDiagonalOne {
        _edge1: this[S".top left"]:_on;
        _edge2: this[S".diagonal-connection left"]:_on;
        __args: List _edge1 _edge2 (Vector 0 _target:y) (Vector 1 _target:y);
        _travelX: (_target - __intersection):x;
    }
    @namespace("contour#C\:bottomFillOne") {
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
        /* this shall hit _unitY --the centerline of the serifs--
         * with its left top edge point
         */
        center.top {
            _edge1: penstroke[S".diagonal-connection left"]:_on;
            _edge2: left:_on;
            __args: List _edge1 _edge2 (Vector 0 _unitY) (Vector 1 _unitY);
            pinTo: (__intersection - _edge2) + Vector penstroke:_travelX 0;
        }

        /* need a way to adjust this nodes position along its slope direction */
        center.diagonal-connection {
            _edge1: penstroke[S"center.top"]:_on;
            _edge2: this:_on;
            __args: List _edge1 _edge2 (Vector 0 _zeroY) (Vector 1 _zeroY);
            /* 1 moves this (up) to the baseline, 0 is no movement */
            _baselineMovement: 0;
            _movement: (__intersection - _edge2) * _baselineMovement;
            pinTo: _movement + Vector penstroke:_travelX 0;
        }
        center.drop {
            dropFixation: penstroke[S".drop.fixation"]:baseNode:on
        }
        center.drop {
            origin: scale * dropFixation;
            target: _scale * dropFixation;
            pinTo: target - origin;
        }
    }
}

@namespace("glyph#v penstroke#upDiagonalOne, glyph#w penstroke#upDiagonalTwo") {
    /* this shall hit _unitY --the centerline of the serifs--
    * with its left top edge point
    */
    center.top {
        _edge1: penstroke[S".bottom left"]:_on;
        _edge2: left:_on;
        __args: List _edge1 _edge2 (Vector 0 _unitY) (Vector 1 _unitY);
        pinTo: (__intersection - _edge2) + Vector penstroke:_travelX 0;
    }
}
@namespace(glyph#v, glyph#y) {
    penstroke#topRightSerif center {
        referenceStroke: upDiagonalOne;
    }
}
@namespace(glyph#w) {
    penstroke#topRightSerif center {
        referenceStroke: upDiagonalTwo;
    }
    /* Use this with the w not with the v.
     * This is to have control over the length of the penstroke
     * it affects the width of the glyph and the size of the triangle
     * between the two v shapes.
     */
    @namespace(penstroke#upDiagonalOne) {
        center.top {
            _centerConnectionLengthFactor: 1;
            _shortening: (_on - penstroke[S"center.bottom"]:_on) * -1 * (1 - _centerConnectionLengthFactor);
            pinTo: _shortening + Vector penstroke:_travelX 0;
        }
    }
}
@namespace(glyph#x) {
    @import 'local/linear-intersection.cps';
    left, right {
        _on: (Polar length baseNode:onDir ) + parent:_on;
    }
    * {
        downStroke: glyph[S"#downStroke"];
        upStrokeLeft: glyph[S"#upStrokeLeft"];
        upStrokeRight: glyph[S"#upStrokeRight"];
        stemWidth: 2 * downStroke[S"center.top > right"]:onLength;
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
    penstroke#upStrokeLeft center.bottom,
    penstroke#upStrokeRight center.top {
        pinTo: penstroke: _correction;
    }
    penstroke#upStrokeLeft center.connection,
    penstroke#upStrokeRight center.connection {
        pinTo: penstroke:_movement;
    }
}

@namespace(glyph#z) {
    left, right {
        _on: (Polar length baseNode:onDir ) + parent:_on;
    }
    * {
        diagonal: glyph[S"#diagonal"];
        armTop: glyph[S"#armTop"];
        terminalTop: glyph[S"#terminalTop"];
        armBottom: glyph[S"#armBottom"];
        terminalBottom: glyph[S"#terminalBottom"];
        _leftAdjust: 0;
        _rightAdjust: 0;
        _left: _leftAdjust + (min armTop[S"center.end"]:_on:x terminalTop[S".to-arm left"]:_on:x);
        _right: _rightAdjust + (max armBottom[S"center.end"]:_on:x terminalBottom[S".to-arm right"]:_on:x);
    }
    penstroke#diagonal center.top {
        pinTo: Vector 0 (armTop[S".to-diagonal right"]:_on:y - _on:y);
    }
    penstroke#diagonal center.bottom {
        pinTo: Vector 0 (armBottom[S".to-diagonal left"]:_on:y - _on:y);
    }
    penstroke#armTop center.to-diagonal {
        pinTo: Vector (diagonal[S"center.top"]:on:x - _on:x) 0;
    }
    penstroke#armTop center.end {
        pinTo: Vector (_left - _on:x) 0;
    }
    penstroke#terminalTop center {
        pinTo: Vector (_left - left:_on:x) 0;
    }
    penstroke#armBottom center.to-diagonal {
        pinTo: Vector (diagonal[S"center.bottom"]:on:x - _on:x) 0;
    }
    penstroke#armBottom center.end {
        pinTo: Vector (_right - _on:x) 0;
    }
    penstroke#terminalBottom center {
        pinTo: Vector (_right - right:_on:x) 0;
    }
    contour#C\:InterWebbingBottom .end {
        on: terminalBottom[S".end left"]:on;
    }
    contour#C\:interWebbingTop .end{
        on: terminalTop[S".end right"]:on;
    }
    contour#C\:InterWebbingBottom .corner{
        on: Vector terminalBottom[S".end left"]:on:x armBottom[S".end right"]:on:y;
    }
    contour#C\:interWebbingTop .corner{
        on: Vector terminalTop[S".end right"]:on:x armTop[S".end left"]:on:y;
    }
    contour#C\:InterWebbingBottom .arm {
        on: Vector
            (max armBottom[S"center.to-diagonal"]:on:x
                 (transform * baseNode:on):x + _rightAdjust
            )
            armBottom[S".end right"]:on:y;
    }

    contour#C\:interWebbingTop .arm {
        on: Vector
            (min armTop[S"center.to-diagonal"]:on:x
                 (transform * baseNode:on):x + _leftAdjust
            )
            armTop[S".end left"]:on:y;
    }
}
