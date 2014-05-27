/**
 * Copyright (c) 2011, Lasse Fister lasse@graphicore.de, http://graphicore.de
 * 
 * You should have received a copy of the MIT License along with this program.
 * If not, see http://www.opensource.org/licenses/mit-license.php
 * 
 * This is a translation of PointToSegmentPen defined in robofab/pens/adapterPens.py
 * The svn revision of the source file in trunk/Lib/ was 67 from 2008-03-11 10:18:32 +0100
 * 
 * I even copied the docstrings and comments! (These may still refer to the Python code)
 */
 
define(
    [
        'ufojs',
        'ufojs/errors',
        './BasePointToSegmentPen'
    ],
    function(
        main,
        errors,
        BasePointToSegmentPen
) {
    "use strict";
    var enhance = main.enhance,
        assert = errors.assert;
    /*constructor*/
    /**
     * Adapter class that converts the PointPen protocol to the
     * (Segment)Pen protocol.
     */
    function PointToSegmentPen(
        segmentPen,
        outputImpliedClosingLine /* default: false*/
    ) {
        BasePointToSegmentPen.apply(this);
        this.pen = segmentPen;
        this.outputImpliedClosingLine = (outputImpliedClosingLine || false);
    }
        
    /*inheritance*/
    PointToSegmentPen.prototype = Object.create(BasePointToSegmentPen.prototype)
    
    /*definition*/
    enhance(PointToSegmentPen, {
        _flushContour: function(segments)
        {
            assert(segments.length >= 1, 'Less than one segment');
            var pen = this.pen;
            if( segments[0][0] == "move" ) {
                // It's an open path.
                var closed = false,
                    points = segments[0][1];
                assert(points.length === 1, 'Points length is not 1');
                var movePt = points[0][0],
                    smooth = points[0][1],
                    name = points[0][2],
                    kwargs = points[0][3];
                segments.splice(0, 1);
            } else {
                // It's a closed path, do a moveTo to the last
                // point of the last segment.
                var closed = true,
                    segment = segments[segments.length - 1],
                    segmentType = segment[0],
                    points = segment[1],
                    point = points[points.length - 1],
                    movePt = point[0],
                    smooth = point[1],
                    name = point[2],
                    kwargs = point[3];
            }
            if(movePt === null) {
                // quad special case: a contour with no on-curve points
                // contains one "qcurve" segment that ends with a point
                // that's null. We must not output a moveTo() in that case.
                // pass
            } else {
                pen.moveTo(movePt);
            }
            var outputImpliedClosingLine = this.outputImpliedClosingLine,
                nSegments = segments.length;
            for(var i = 0; i < nSegments; i++) {
                var segmentType = segments[i][0],
                    points = [];
                for(var n = 0; n < segments[i][1].length; n++)
                    points.push(segments[i][1][n][0]);
                if(segmentType == 'line') {
                    assert(points.length === 1, 'Points length is not 1');
                    var pt = points[0];
                    if(i + 1 != nSegments
                    || outputImpliedClosingLine
                    || !closed)
                        pen.lineTo(pt);
                } else if(segmentType == 'curve') {
                    pen.curveTo.apply(pen, points);
                } else if(segmentType == 'qcurve') {
                    pen.qCurveTo.apply(pen, points);
                } else {
                    throw new errors.Type('illegal segmentType: '
                        + segmentType);
                }
            }
            if(closed)
                pen.closePath();
            else
                pen.endPath();
        },
        addComponent: function(glyphName, transform)
        {
            this.pen.addComponent(glyphName, transform);
        }
    });
    return PointToSegmentPen;
});
