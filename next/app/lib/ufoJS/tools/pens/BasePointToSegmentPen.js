/**
 * Copyright (c) 2011, Lasse Fister lasse@graphicore.de, http://graphicore.de
 * 
 * You should have received a copy of the MIT License along with this program.
 * If not, see http://www.opensource.org/licenses/mit-license.php
 * 
 * This is a translation of BasePointToSegmentPen defined in robofab/pens/pointPen.py
 * The svn revision of the source file in trunk/Lib/ was 67 from 2008-03-11 10:18:32 +0100
 * 
 * I even copied the docstrings and comments! (These may still refer to the Python code)
 */
define(
    [
        'ufojs',
        'ufojs/errors',
        './AbstractPointPen'
    ],
    function(
        main,
        errors,
        AbstractPointPen
) {
    "use strict";
    //shortcuts
    var enhance = main.enhance,
        NotImplementedError = errors.NotImplemented,
        assert = errors.assert;
    
    /*constructor*/
    
    /**
     * Base class for retrieving the outline in a segment-oriented
     * way. The PointPen protocol is simple yet also a little tricky,
     * so when you need an outline presented as segments but you have
     * as points, do use this base implementation as it properly takes
     * care of all the edge cases.
     */
    function BasePointToSegmentPen()
    {
        this.currentPath = null;
    };

    /*inheritance*/
    BasePointToSegmentPen.prototype = Object.create(AbstractPointPen.prototype)

    /*definition*/
    enhance(BasePointToSegmentPen, {
        beginPath: function(identifier)
        {
            assert(this.currentPath === null,
                'currentPath is not null, call endPath');
            this.currentPath = [];
        },
        /**
         * Override this method.
         * 
         * It will be called for each non-empty sub path with a list
         * of segments: the 'segments' argument.
         * 
         * The segments list contains tuples of length 2:
         * (segmentType, points)
         * 
         * segmentType is one of "move", "line", "curve" or "qcurve".
         * "move" may only occur as the first segment, and it signifies
         * an OPEN path. A CLOSED path does NOT start with a "move", in
         * fact it will not contain a "move" at ALL.
         * 
         * The 'points' field in the 2-tuple is a list of point info
         * tuples. The list has 1 or more items, a point tuple has
         * four items:
         * (point, smooth, name, kwargs)
         * 'point' is an (x, y) coordinate pair.
         * 
         * For a closed path, the initial moveTo point is defined as
         * the last point of the last segment.
         * 
         * The 'points' list of "move" and "line" segments always contains
         * exactly one point tuple.
         */
        _flushContour: function(segments)
        {
            throw new NotImplementedError(
                'BasePointToSegmentPen has not _flushContour'
                +' endPath');
        },
        endPath: function()
        {
            assert(this.currentPath !== null,
                'currentPath is null, call beginPath');
            var points = this.currentPath;
            this.currentPath = null;
            if(!points.length)
                return;
            if(points.length === 1) {
                // Not much more we can do than output a single move segment.
                var pt = points[0][0],
                    //segmentType = points[0][1], not using this
                    smooth = points[0][2],
                    name = points[0][3],
                    kwargs = points[0][4],
                    segments = [ ['move', [ [pt, smooth, name, kwargs] ] ] ];
                this._flushContour(segments);
                return;
            }
            segments = [];
            if(points[0][1] == 'move') {
                // It's an open contour, insert a "move" segment for the
                // first point and remove that first point from the point list.
                var pt = points[0][0],
                    //segmentType = points[0][1],// it's 'move', we just checked
                    smooth = points[0][2],
                    name = points[0][3],
                    kwargs = points[0][4];
                segments.push(['move', [ [pt, smooth, name, kwargs] ] ]);
                points.splice(0,1);
            } else {
                // It's a closed contour. Locate the first on-curve point, and
                // rotate the point list so that it _ends_ with an on-curve
                // point.
                var firstOnCurve = null;
                for (var i = 0; i < points.length; i++) {
                    var segmentType = points[i][1];
                    if(segmentType !== null) {
                        firstOnCurve = i;
                        break;
                    }
                }
                if(firstOnCurve === null) {
                    // Special case for quadratics: a contour with no on-curve
                    // points. Add a "None" point. (See also the Pen protocol's
                    // qCurveTo() method and fontTools.pens.basePen.py.)
                    points.push([null, 'qcurve', null, null, null]);
                } else {
                    //points = [].concat(points.slice(firstOnCurve+1), points.slice(0, firstOnCurve+1))
                    points = points.concat(points.splice(0, firstOnCurve+1));
                }
            }
            var currentSegment = [];
            for (var i = 0; i < points.length; i++) {
                var pt = points[i][0],
                    segmentType = points[i][1],
                    smooth = points[i][2],
                    name = points[i][3],
                    kwargs = points[i][4];
                currentSegment.push([pt, smooth, name, kwargs]);
                if(segmentType === null)
                    continue;
                segments.push([segmentType, currentSegment]);
                currentSegment = [];
            }
            this._flushContour(segments);
        },
        addPoint: function(
            pt,
            segmentType /* default null */,
            smooth /* default false */,
            name /* default null */,
            kwargs /* default an object, javascript has no **kwargs syntax */
        ) {
            segmentType = (segmentType === undefined) ? null : segmentType;
            smooth = (smooth || false);
            name = (name === undefined) ? null : name;
            kwargs = (kwargs || {});//an "options" object
            this.currentPath.push([pt, segmentType, smooth, name, kwargs]);
        }
    });
    return BasePointToSegmentPen;
});
