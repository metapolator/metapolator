/**
 * This can be distilled down to the non es6 file by running the following
 * from the root of the git repository
 *
 * pushd .; cd ./dev-scripts && ./es6to5 ../app/lib/rendering/glyphBasics.es6.js; popd
 *
 */
define([

],
function()
{
   "use strict";
    /*jshint esnext:true*/

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
     * Without terminal being set or having a value of "start" or "end"
     * the default behavior is: p0 out in p1
     *
     * See the comment of drawPenstrokeToPointPen for more detail.
     */
    function getControlsFromStyle (p0, p1, terminal) {
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
    function renderPenstrokeOutline ( pen, penstroke ) {
        var points = penstroke.children
          , point
          , prePoint
          , segmentType, terminal, ctrls
          , i,l
          ;

        // Actually, all points have controls. We don't have to draw
        // lines. We should make a CPS value if we want to draw a
        // point as a line segment point
        segmentType = 'curve';

        pen.beginPath();
        // first draw the right side
        for(i=0,l=points.length; i<l; i++) {
            point = points[i].right.getComputedStyle();
            if(i === 0) {
                // this reproduces the starting terminal
                prePoint = points[0].left.getComputedStyle();
                terminal = 'start';
            } else {
                prePoint = points[i-1].right.getComputedStyle();
                terminal = false;
            }
            ctrls = getControlsFromStyle(prePoint, point, terminal);
            /* yield */ pen.addPoint(ctrls[0].valueOf(), undefined, undefined, undefined);
            /* yield */ pen.addPoint(ctrls[1].valueOf(), undefined, undefined, undefined);
            /* yield */ pen.addPoint(point.get('on').valueOf(), segmentType, undefined, undefined);
        }
        // draw the left side
        for(i=l-1; i>=0; i--) {
            point = points[i].left.getComputedStyle();
            if(i === l-1) {
                // this reproduces the ending terminal
                terminal = 'end';
                prePoint = points[i].right.getComputedStyle();
            }
            else {
                terminal = false;
                // the left side is of the outline is drawn from the
                // end to the beginning. This reverses the point order
                // for getComputedStyle
                prePoint = point;
                point = points[i+1].left.getComputedStyle();
            }
            ctrls = getControlsFromStyle(prePoint, point, terminal);
            if(!terminal) {
                // reverse on curve and of curve points, prePoint
                // is no longer needed.
                ctrls.reverse();
                point = prePoint;
            }
            /* yield */ pen.addPoint(ctrls[0].valueOf(), undefined, undefined, undefined);
            /* yield */ pen.addPoint(ctrls[1].valueOf(), undefined, undefined, undefined);
            /* yield */ pen.addPoint(point.get('on').valueOf(), segmentType, undefined, undefined);
        }
        pen.endPath();
    }

    function renderContour ( pen, contour ) {
        var points = contour.children
          , point
          , segmentType
          , i, l
          ;

        // Actually, all points have controls. We don't have to draw
        // lines. We should make a CPS value if we want to draw a
        // point as a line segment point
        segmentType = 'curve';

        pen.beginPath();
        for(i=0, l=points.length;i<l;i++) {
            point = points[i].getComputedStyle();
            /* yield*/ pen.addPoint(point.get('in').valueOf(), undefined, undefined, undefined);
            /* yield*/ pen.addPoint(point.get('on').valueOf(), segmentType, undefined, undefined);
            /* yield*/ pen.addPoint(point.get('out').valueOf(), undefined, undefined, undefined);
        }
        pen.endPath();
    }

    function renderComponent ( pen, component ) {
        var glyphName = component.baseGlyphName
          , transformation = component.getComputedStyle().get( 'transformation' )
          ;
        pen.addComponent( glyphName, transformation );
    }

    function renderPenstrokeCenterline( pen, penstroke ) {
        var points = penstroke.children
          , point
          , prePoint
          , segmentType, ctrls
          , i, l
          ;
        // center line
        pen.beginPath();
        for(i=0,l=points.length;i<l;i++) {
            point = points[i].center.getComputedStyle();
            if(i !== 0) {
                segmentType = 'curve';
                prePoint = points[i-1].center.getComputedStyle();
                ctrls = getControlsFromStyle(prePoint, point);
                /* yield */ pen.addPoint(ctrls[0].valueOf(), undefined, undefined, undefined);
                /* yield */ pen.addPoint(ctrls[1].valueOf(), undefined, undefined, undefined);
            } else {
                // this contour is not closed, the first point is a move
                segmentType = 'move';
            }
            /* yield */ pen.addPoint(point.get('on').valueOf(), segmentType, undefined, undefined);
        }
        pen.endPath();
    }

    function applyGlyphGenerator ( renderer, glyph, consumer ) {
        function* generator() {
            var item, glyphName, transformation, i,l,type, children = glyph.children;
            for (i=0,l=children.length;i<l;i++) {
                item = children[i];
                type = item.type;
                if(type in renderer)
                    yield renderer[type](consumer, item);
            }
        }
        return generator();
    }

    function applyGlyph ( renderer, glyph, consumer ) {
        var gen = drawGlyphToPointPenGenerator( renderer, glyph, consumer );
        while(!(gen.next().done));
    }

    /**
     * Legacy exports, don't use these names in new code and rewrite
     * old uses of these names.
     *
     * Just learned that we dont always need to pass pens to applyGlyphGenerator
     * it depends much more on the renderer object that was passed.
     */
    var drawGlyphToPointPenGenerator = applyGlyphGenerator
      , drawGlyphToPointPen = applyGlyph
      ;

    /**
     * This renders the glyph as normal outlines to a PointPen
     * it's a convenience API, don't be afraid to make your own renderer
     */
    var outlinesRenderer =  {
        penstroke: renderPenstrokeOutline
      , contour: renderContour
      , component: renderComponent
    };

    /**
     * A convenience API, use like this: drawPoints(glyph, pointPen);
     */
    var drawPoints = applyGlyph.bind(null, outlinesRenderer);

    return {
        renderPenstrokeOutline: renderPenstrokeOutline
      , renderContour: renderContour
      , renderComponent: renderComponent
      , renderPenstrokeCenterline: renderPenstrokeCenterline
      , applyGlyphGenerator: applyGlyphGenerator
      , applyGlyph: applyGlyph
      , outlinesRenderer: outlinesRenderer
      , drawPoints: drawPoints
        // legacy use applyGlyph instead
      , drawGlyphToPointPen: drawGlyphToPointPen
        // legacy use applyGlyphGenerator instead
      , drawGlyphToPointPenGenerator: drawGlyphToPointPenGenerator
    };
});
