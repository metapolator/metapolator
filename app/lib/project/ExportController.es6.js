/**
 * This can be distilled down to the non es6 file by running the following
 * from the root of the git repository
 * 
 * pushd .; cd ./dev-scripts && ./es6to5 ../app/lib/project/ExportController.es6.js; popd
 *
 */
define([
    'metapolator/errors'
  , 'metapolator/math/hobby'
  , 'metapolator/math/Vector'
  , 'metapolator/models/MOM/Glyph'
], function(
    errors
  , hobby
  , Vector
  , MOMGlyph
) {
    "use strict";
    var KeyError = errors.Key
      , CPSKeyError = errors.CPSKey
    ;

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
          , updatedUFOData
          , v, ki, k, keys
          , style
          ;
        console.warn('exporting ...');
        for(var i = 0;i<glyphs.length;i++) {
            glyph = glyphs[i];
            style = this._model.getComputedStyle(glyph);
            console.warn('exporting', glyph.id);
            drawFunc = this.drawGlyphToPointPen.bind(
                this
              , {
                      penstroke: ExportController.renderPenstrokeOutline
                    , contour: ExportController.renderContour
                }
              , this._model, glyph);

            // Allow the glyph ufo data to be updated by the CPS.
            updatedUFOData = glyph.getUFOData();
            keys = Object.keys(updatedUFOData);
            for(ki=0;ki<keys.length;ki++) {
                try {
                    k = keys[ki];
                    v = style.get(MOMGlyph.convertUFOtoCPSKey(k));
                    updatedUFOData[k] = v;
                }
                catch( error ) {
                    if(!(error instanceof KeyError)) {
                        throw error;
                    }
                }
            }
            this._glyphSet.writeGlyph(false, glyph.id, updatedUFOData, drawFunc,
                                      undefined, {precision: this._precision})
        }
        this._glyphSet.writeContents(false);
    };

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
        return [
              p0.get(terminal === 'start' ? 'in': 'out')
            , p1.get(terminal === 'end' ? 'out' :'in')
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
    function* renderPenstrokeOutline( pen, model, penstroke ) {
        var points = penstroke.children
          , point
          , prePoint
          , segmentType, terminal, ctrls, vector
          ;

        pen.beginPath();
        // first draw the right side
        for(var i=0;i<points.length;i++) {
            point = model.getComputedStyle(points[i].right);
            // Actually, all points have controls. We don't have to draw
            // lines. We should make a CPS value if we want to draw a
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
                for (vector of ctrls) {
                    yield pen.addPoint(vector.valueOf(), undefined, undefined, undefined);
                }
            }
            else {
                segmentType =  'line';
                console.warn('implicit line segment, right side, this should be explicit in CPS');
            }
            yield pen.addPoint(point.get('on').valueOf(), segmentType, undefined, undefined);
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
                for (vector of ctrls) {
                    yield pen.addPoint(vector.valueOf(), undefined, undefined, undefined);
                }
            }
            else {
                segmentType = 'line';
                console.warn('implicit line segment, left side, this should be explicit in CPS');
            }
            yield pen.addPoint(point.get('on').valueOf(), segmentType, undefined, undefined);
        }
        pen.endPath();
    }
    ExportController.renderPenstrokeOutline = renderPenstrokeOutline;

    function* renderContour( pen, model, contour ) {
        var points = contour.children
          , point
          , segmentType
          ;
        pen.beginPath();
        for(var i=0;i<points.length;i++) {
            point = model.getComputedStyle(points[i]);
            // Actually, all points have controls. We don't have to draw
            // lines. We should make a CPS value if we want to draw a
            // point as a line segment point
            if(true /* always curve */) {
                segmentType = 'curve';
            }
            else {
                segmentType =  'line';
            }
            yield pen.addPoint(point.get('in').valueOf(), undefined, undefined, undefined);
            yield pen.addPoint(point.get('on').valueOf(), segmentType, undefined, undefined);
            yield pen.addPoint(point.get('out').valueOf(), undefined, undefined, undefined);
        }
        pen.endPath();
    }
    ExportController.renderContour = renderContour;

    function* renderPenstrokeCenterline( pen, model, penstroke ) {
        var points = penstroke.children
          , point
          , prePoint
          , segmentType, ctrls, vector
          ;
        // center line
        pen.beginPath()
        for(var i=0;i<points.length;i++) {
            point = model.getComputedStyle(points[i].center);
            if(i !== 0) {
                segmentType = 'curve';
                prePoint = model.getComputedStyle(points[i-1].center);
                ctrls = getControlsFromStyle(prePoint, point);
                for (vector of ctrls) {
                    yield pen.addPoint(vector.valueOf(), undefined, undefined, undefined);
                }
            }
            else
                // this contour is not closed, the first point is a move
                segmentType = 'move';
            yield pen.addPoint(point.get('on').valueOf(), segmentType, undefined, undefined);
        }
        pen.endPath();
    }
    ExportController.renderPenstrokeCenterline = renderPenstrokeCenterline;

    function drawGlyphToPointPenGenerator ( renderer, model, glyph, pen) {
        function* generator() {
            var item, glyphName, transformation;
            for (item of glyph.children) {
                if( item.type === 'component' ) {
                    glyphName = item.baseGlyphName;
                    transformation = model.getComputedStyle(item).get( 'transformation' );
                    pen.addComponent( glyphName, transformation );
                }
                else if(renderer.contour && item.type === 'contour' )
                    yield* renderer.contour( pen, model, item );
                else if(renderer.penstroke && item.type === 'penstroke')
                    yield* renderer.penstroke( pen, model, item );
            }
        };
        return generator();
    }
    ExportController.drawGlyphToPointPenGenerator = drawGlyphToPointPenGenerator;

    _p.drawGlyphToPointPen = function(renderer, model, glyph, pen ) {
        for (var v of drawGlyphToPointPenGenerator(renderer, model, glyph, pen));
    }

    return ExportController;
});
