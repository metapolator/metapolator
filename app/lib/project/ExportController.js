define([
    'metapolator/errors'
  , 'metapolator/math/hobby'
], function(
    errors
  , hobby
) {
    "use strict";

    function ExportController(master, model, glyphSet, precision) {
        this._master = master;
        this._model = model;
        this._glyphSet = glyphSet;
        this._precision = precision;
    }
    var _p = ExportController.prototype;

    // FIXME: "export" is a future reserved keyword
    _p.export = function() {
        var glyphs = this._master.children
          , glyph
          , drawFunc
          , ufoData
          , ufoData_tmp
          ;
        console.log('exporting ...');
        for(var i = 0;i<glyphs.length;i++) {
            glyph = glyphs[i];
            console.log('exporting', glyph.id);
            drawFunc = this.drawGlyphToPointPen.bind(this, this._model, glyph)

            // filter the 'lib' key because fontforge didn't like it (FontForge issue #1635)
            ufoData_tmp = glyph.getUFOData();
            ufoData = {}
            for(var k in ufoData_tmp)
                if(k === 'lib')
                    continue;
                else
                    ufoData[k] = ufoData_tmp[k];

            this._glyphSet.writeGlyph(false, glyph.id, ufoData, drawFunc,
                                      {precision: this._precision})
        }
        this._glyphSet.writeContents(false);
    }

    /**
     * Get control point vectors from (MOM Point) StyleDicts.
     * try to use hobby splines but fall back to the control point values
     * of the points if hobbys would fail when there are no good tensions
     * or directions.
     *
     * The terminal parameter is a switch used to draw the penstroke terminals
     * for the start terminal of the stroke all controls are from the incoming
     * control points. p0 in in p1
     * for the end terminal of the stroke all controls are from the outgoing
     * control points. p0 out out p1
     * Without terminal beeing set or having a value of "start" or "end"
     * the default behavior is: p0 out in p1
     *
     * See the comment of drawPenstrokeToPointPen for more detail.
     */

    function getControlsFromStyle(p0, p1, terminal) {
        var on0 = p0.get('on').value
          , outDir = p0.get(terminal === 'start' ? 'inDir' : 'outDir').value
          , outTension = p0.get(terminal === 'start' ? 'inTension' :'outTension')
          , inTension = p1.get(terminal === 'end' ? 'outTension' : 'inTension')
          , inDir = p1.get(terminal === 'end' ? 'outDir' :'inDir').value
          , on1 = p1.get('on').value
          ;

        if(outTension && inTension
                            && outDir.magnitude()
                            && inDir.magnitude())
            return hobby.hobby2cubic(on0, outDir, outTension,
                                            inTension, inDir, on1);
        // fallback to control points is always possible. Although,
        // depending on the cps setup the value may not be useful
        // does this affect outline quality?
        return [
              p0.get(terminal === 'start' ? 'in': 'out').value
            , p1.get(terminal === 'end' ? 'out' :'in').value
        ];
    }

    /**
     * The translation from Metapolator Penstrokes to Outlines:
     *
     * The example uses a penstroke with 7 points indexed from 0 to 6
     *
     *  Penstroke       Outline
     *
     *  ending
     *  terminal
     *    ___              7___
     *   | 6 |           8 |   | 6
     *   | 5 |           9 |   | 5
     *   | 4 |          10 |   | 4
     *   | 3 |          11 |   | 3
     *   | 2 |          12 |   | 2
     *   |_1_|          13 |___| 1
     *     0                 14/0
     *  starting
     *  terminal
     *
     *
     *
     * We draw first the right side from 0 to 6,
     * then the left side from 6 to 0.
     *
     * In each iteration only one on-curve point is drawn; in the
     * following example, that is always the last point of the four-
     * point tuples. Also, the out and in controls are drawn.
     * The first point of the tuples is needed to calculate the control
     * point position when we use hobby splines.
     *
     * for i=0;i<n;i++;
     *      i===0:
     *          //starting terminal segment:
     *          on0.left in in on0.right
     *              => out in 0
     *      i!==0:
     *          // segments right side:
     *          // here i=1
     *          on0.right out in on1.right
     *              => out in 1
     * for i=n-1;i>0;i--;
     *      i===n-1
     *          // ending terminal segmnet
     *          // here i=6
     *          on6.right out out on6.left
     *              => out in 7
     *      i!===n-1
     *          // segments left side
     *          // here i=5
     *          on6.left in out on5.left
     *              => out in 8
     */
    _p.drawPenstrokeOutline = function(model, pen, penstroke) {
        var points = penstroke.children
          , point
          , prePoint
          , segmentType, terminal, ctrls
          ;
        pen.beginPath();
        // first draw the right side
        for(var i=0;i<points.length;i++) {
            point = model.getComputedStyle(points[i].right);
            // Actually, all points have controls. We don't have to draw
            // lines. We should make a CPS value if we wan't to draw a
            // point as a line segment point
            if(true /* always curve */) {
                segmentType = 'curve';
                if(i === 0) {
                    // this reproduces the starting terminal
                    prePoint = model.getComputedStyle(points[i].left);
                    terminal = 'start'
                }
                else {
                    terminal = false;
                    prePoint = model.getComputedStyle(points[i-1].right);
                }
                ctrls = getControlsFromStyle(prePoint, point, terminal);
                ctrls.forEach(function(vector) {
                    pen.addPoint(vector.valueOf(), undefined, undefined, undefined);
                })

            }
            else {
                segmentType =  'line';
                console.log('implicit line segment, right side, this should be explicit in CPS');
            }
            pen.addPoint(point.get('on').value.valueOf(), segmentType, undefined, undefined);
        }
        // draw the left side
        for(i=points.length-1;i>=0 ;i--) {
            point = model.getComputedStyle(points[i].left);
            if(true/*always curve*/) {
                segmentType = 'curve';
                if(i === points.length-1) {
                    // this reproduces the ending terminal
                    terminal = 'end';
                    prePoint = model.getComputedStyle(points[i].right);
                }
                else {
                    terminal = false;
                    // the left side is of the outline is drawn from the
                    // end to the beginning. This reverses the point order
                    // for getComputedStyle
                    prePoint = point;
                    point = model.getComputedStyle(points[i+1].left);
                }
                ctrls = getControlsFromStyle(prePoint, point, terminal);
                if(!terminal) {
                    // reverse on curve and of curve points, prePoint
                    // is no longer needed.
                    ctrls.reverse();
                    point = prePoint;
                }
                ctrls.forEach(function(vector) {
                    pen.addPoint(vector.valueOf(), undefined, undefined, undefined);
                })
            }
            else {
                segmentType = 'line';
                console.log('implicit line segment, left side, this should be explicit in CPS');
            }
            pen.addPoint(point.get('on').value.valueOf(), segmentType, undefined, undefined);
        }
        pen.endPath();
    }

    _p.drawPenstrokeCenterline = function(model, pen, penstroke) {
        var points = penstroke.children
          , point
          , prePoint
          , segmentType, ctrls
          ;
        // center line
        pen.beginPath()
        for(var i=0;i<points.length;i++) {
            point = model.getComputedStyle(points[i].center);
            if(i !== 0) {
                segmentType = 'curve';
                prePoint = model.getComputedStyle(points[i-1].center);
                ctrls = getControlsFromStyle(prePoint, point);
                ctrls.forEach(function(vector) {
                    pen.addPoint(vector.valueOf(), undefined, undefined, undefined);
                })
            }
            else
                // this contour is not closed, the first point is a move
                segmentType = 'move';
            pen.addPoint(point.get('on').value.valueOf(), segmentType, undefined, undefined);
        }
        pen.endPath();
    }



    _p.drawGlyphToPointPen = function(model, glyph, /*method,*/ pen) {
        // method may be tensions/control-points/metafont/native-js
        // the possibilities are a lot.
        // I'm starting with tensions/native-js
        // then I add a tensions/metafont implementation
        // eventually we should be able to control this via CPS!
        // The parameter could be set for all levels from univers to
        // penstroke, this would be a good test of inhertance;
        // also, it should be possible to render just one penstroke
        // of a glyph using metafont, for example.
        // Maybe we can combine all metafont strokes into one job, to
        // reduce the overhead. The needed parameters would of course
        // be in every job for metafont.
        glyph.children.map(this.drawPenstrokeOutline.bind(this, model, pen));
        //glyph.children.map(this.drawPenstrokeCenterline.bind(this, model, pen));
    }

    return ExportController;
});
