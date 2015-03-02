define(
    [
        'ufojs/main'
      , 'ufojs/errors'
      , 'ufojs/tools/pens/BasePointToSegmentPen'
      , './SegmentPoint'
    ],
    function(
        ufoJSUtils
      , errors
      , Parent
      , Point
) {
    "use strict";
    var enhance = ufoJSUtils.enhance,
        assert = errors.assert;

    /*constructor*/
    /**
     * Based of a copy of PointToSegmentPen:
     * Adapter class that converts the PointPen protocol to the
     * (Segment)Pen protocol.
     */
    function ImportOutlinePen(
        segmentPen,
        outputImpliedClosingLine /* default: false*/
    ) {
        Parent.call(this);
        this.pen = segmentPen;
        this.outputImpliedClosingLine = (outputImpliedClosingLine || false);
    }

    /*inheritance*/
    ImportOutlinePen.prototype = Object.create(Parent.prototype);
    ImportOutlinePen.prototype.constructor = ImportOutlinePen;

    /*definition*/
    enhance(ImportOutlinePen, {
        _flushContour: function(segments, contour_kwargs)
        {
            assert(segments.length >= 1, 'Less than one segment');
            var pen = this.pen
              , closed, points, point, movePt, smooth, name, kwargs, segmentType
              ;
            if( segments[0][0] == "move" ) {
                // It's an open path.
                closed = false;
                points = segments[0][1];
                assert(points.length === 1, 'Points length is not 1');
                point = points[0];
                movePt = [0];
                smooth = points[0][1];
                name = points[0][2];
                kwargs = points[0][3];
                segments.splice(0, 1);
            } else {
                // It's a closed path, do a moveTo to the last
                // point of the last segment.
                closed = true;
                var segment = segments[segments.length - 1];
                segmentType = segment[0];
                points = segment[1];
                point = points[points.length - 1];
                movePt = point[0];
                smooth = point[1];
                name = point[2];
                kwargs = point[3];
            }
            if(movePt === null) {
                // quad special case: a contour with no on-curve points
                // contains one "qcurve" segment that ends with a point
                // that's null. We must not output a moveTo() in that case.
                // pass
            } else {
                pen.moveTo(new Point(movePt, smooth, name, kwargs), contour_kwargs);
            }
            var outputImpliedClosingLine = this.outputImpliedClosingLine,
                nSegments = segments.length;
            for(var i = 0; i < nSegments; i++) {
                segmentType = segments[i][0];
                points = [];
                for(var n = 0; n < segments[i][1].length; n++)
                    points.push(Point.factory.apply(null, segments[i][1][n]));

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
    return ImportOutlinePen;
});
