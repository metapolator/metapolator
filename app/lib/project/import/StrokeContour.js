define([
    'metapolator/errors'
  , './tools'
  , 'metapolator/math/hobby'
], function(
    errors
  , tools
  , hobby
) {
    "use strict";
    var AssertionError = errors.Assertion
      , ImportPenstroke = errors.ImportPenstroke
      , line2curve = tools.line2curve
      , getCenterPoint = tools.getCenterPoint
      , getDirection = tools.getDirection
      ;

    /**
     * This methods expects an input-contour like a SegementPen produces it.
     *
     * The 'implied' closing line argument of SegementPen must be included
     * which is *not* the default when using a ufoJS like PointToSegmentPen!
     * See the outputImpliedClosingLine of the PointToSegmentPen constructor.
     *
     * The input-contour must be a closed contour.
     *
     * The minimal length of the input-contour is 3 which yields in a one
     * item result.
     *
     * The input-contour is expected to have an uneven number of segments:
     * An initial 'moveTo' segment and an even number of either 'lineTo'
     * or 'curveTo' segments.
     *
     * This method treats the first on curve point as first point on
     * the right side and the on curve point before the last on curve
     * point as the first point on the left side. Each segement has one
     * on curve point and 0 or 3 off curve points.
     *
     * The last segment and segment with the index (contour.length-1)/2.
     * are used to reconstruct the imported shape using opening and closing
     * terminals.
     *
     * The result of this method is an array of arrays of left and right segment
     * pairs.
     *
     * The resulting left segments are a direction reversed representation
     * of the input-contours left-side segments. So the results left
     * and right side contours share the same direction.
     *
     * EXMAPLE:
     * A contour of length 11: 1 moveto  + 10 segments:
     *  [moveto, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
     *
     * left    4    right
     *         _
     *      5 | | 3
     *      6 | | 2
     *      7 | | 1
     *      8 |_| 0
     *           *
     *         9
     *
     * (*) moveTo is the point in the lower right corner.
     *
     *     result = [
     *        [openingTerminalSegment, openingTerminalSegment]
     *        [8, 0]
     *        [7, 1]
     *        [6, 2]
     *        [5, 3]
     *        [closingTerminalSegment, closingTerminalSegment]
     *     ]
     */
    function StrokeContour(contour) {
        this.length = 0;
            // skip the first moveto
        var right = 1
            // -1 for length to index translation,
            // -1 because the very last segment is the vector of the
            // pen, not part of the stroke
          , left = contour.length-2
          , zLength = (contour.length-1)*0.5
          , leftSegment, points
          , terminals = this._getTerminals(contour)
          ;

        // add the information needed for the opening terminal
        this._push([
            [undefined, terminals[0][1], contour[left].slice(-1).pop()]
          , [undefined, terminals[0][2], terminals[0][3]]
        ]);

        for(;right<zLength; right++, left--) {
            // the problem is, that the left contour is in the wrong
            // direction. so we have to reverse its direction:
            leftSegment = contour[left].slice(1,-1).reverse();
            // oncurve point of the previous segment
            leftSegment.push(contour[left-1].slice(-1).pop());

            this._push([leftSegment, contour[right].slice(1)]);
        }

        // add the information needed for the closing terminal
        this._push([
            [terminals[1][2], undefined, undefined]
          , [terminals[1][1], undefined, undefined]
        ]);
    }

    var _p = StrokeContour.prototype;
    _p.constructor = StrokeContour;

    /**
     * Return the control points for both terminal lines.
     * the direction for the stroke beginning terminal line left to right
     * the direction for the stroke ending terminal line is right to left.
     *
     * returns: [ beginning_segment, ending_segment ]
     */
    _p._getTerminals = function (contour) {
        var beginningIndex = contour.length-1
          , endingIndex = (contour.length-1) * 0.5
          , beginning = contour[beginningIndex]
          , ending = contour[endingIndex];

        if(beginning[0] !== 'curveTo') {
            beginning = line2curve(
                contour[beginningIndex-1].slice(-1).pop()
              , beginning[1]
            );
        }
        if(ending[0] !== 'curveTo') {
            ending = line2curve(
                contour[endingIndex-1].slice(-1).pop()
              , ending[1]
            );
        }

        return [beginning, ending];
    };

    _p._push = function(/* ... */) {
        var args = Array.prototype.slice.apply(arguments)
          , i=0, j
          , segments
          , segment
          ;
        for(;i<args.length;i++) {
            // args[i] === [leftSegment, rightSegment]
            segments = [];
            for(j=0;j<2;j++) {
                // Convert ALL lineTo to curveTo;
                // line2curve marks the new segment is marked with
                // segment.wasLine = true;
                if(args[i][j].length === 1) {
                    segment = line2curve(
                        this[this.length-1][j].slice(-1).pop()
                      , args[i][j][0]
                    );
                    // remove the segmentType
                    segment.shift();
                }
                else if(args[i][j].length === 3)
                    segment = args[i][j];
                else
                    // This means that probably  the code that created
                    // the contour argument for StrokeContour is faulty
                    // and must be repaired.
                    throw new AssertionError('A segment is expected to '
                        + ' have 3 items at this stage, but this has '
                        + args[i][j].length + ' items. '
                        + 'Segment: ' + args[i][j].join(', '));
                segments.push(segment);
            }
            Array.prototype.push.call(this, segments);
        }
    };

    /**
     * Returns a list of points like following:
     *
     * the coordinates are absolute.
     *
     * // one "point"
     *  {
     *      l: {
     *          in: Vector
     *        , out: Vector
     *        , on: Vector
     *        , wasLine: true|false
     *      }
     *    , r: {
     *          in: Vector
     *        , out: Vector
     *        , on: Vector
     *        , wasLine: true|false
     *      }
     *    , z: {
     *          in: Vector
     *        , out: Vector
     *        , on: Vector
     *        , wasLine: true|false
     *      }
     * }
     */

    _p._getMetapolatorPoint = function(i) {
        var point, left=0, right =1;

        // i   [[ , leftIn, leftOn], [ , rightIn, rightOn]]
        // i+1 [[leftOut , , ], [rightOut, , ]]

        point = {
            l: {
                'in': this[i][left][1]
               , on: this[i][left][2]
               , out: this[i+1][left][0]
               , wasLine: !!this[i][left].wasLine
            }
          , r: {
                'in': this[i][right][1]
              , on: this[i][right][2]
              , out: this[i+1][right][0]
              , wasLine: !!this[i][right].wasLine
            }
          , z: {}
        };

        point.z.on = getCenterPoint(point.l.on, point.r.on);
        point.z['in'] = getCenterPoint(point.l['in'], point.r['in']);
        point.z.out = getCenterPoint(point.l.out, point.r.out);
        point.z.wasLine = point.l.wasLine && point.r.wasLine;

        return point;
    };

    _p._getPenStroke = function() {
        var i
            // end is the element before the last element, because the last
            // element is just for the ending terminal of interest
          , end = this.length-1
          , result = []
          ;

        for(i=0; i<end; i++)
            result.push(this._getMetapolatorPoint(i));
        return result;
    };

    function _extractKey(key, value) {
        return value[key];
    }

    function _setKey(stroke, key, value, index) {
        stroke[index][key] = value;
    }

    /**
     * Find directions for any control point even when the naive approach
     * has no direction, because the distance of the offset to the on
     * curve point is 0.
     *
     * The algorithm finds the next point in control direction
     * (in|on|out OR out|on|in) that has a different position than
     * point.on and returns that direction in radians.
     *
     * In the normal case, just the direction of the control point is
     * returned.
     *
     * If the control shares the position with the on curve point,
     * i.e. point.on - point[control] === Vector 0, 0
     * the search t traverses the whole path until a direction can be
     * returned.
     * For the left and right path it traces the whole outline, for
     * the centerline it looks only at that. Not too many steps should be
     * needed to find a direction, but in the worst case -- when all
     * points are on the same position -- this will return false.
     *
     * Arguments:
     *
     * `stroke` is a stroke array as returned by StrokeContour._getPenStroke
     *
     * `pointIndex` is the numeric index of the stroke point in `stroke`
     *
     * `key` is 'l' (left), 'z' (center) or 'r' (right)
     *
     * `point` equals stroke[pointIndex][key]
     *
     * `control` is 'out' or 'in' to indicate in which direction we
     *      are searching. This means that we are searching an angle
     *      from `point.on` to 'point[control]' and if there is no
     *      natural angle for that point we go on and look at the next
     *      coordinate the path.
     */
    function _findNextDirection(stroke, pointIndex, key, point, control) {
        var normalIncrement = control === 'out' ? 1 : -1
          , increment = normalIncrement
          , i = pointIndex
          , countourKey = key
          , firstRound = true
          , lastRound
          , result
          ;

        while(true) {
            lastRound = i === pointIndex && !firstRound;
            result = getDirection(point, firstRound, lastRound,
                            increment, stroke[i][countourKey], control);
            firstRound = false;
            if(result !== false || lastRound)
                return result;

            // iterate
            if(key === 'z') {
                // we only change i
                if(increment === 1 && i === stroke.length-1)
                    i = 0;
                else if (increment === -1 && i === 0)
                    i = stroke.length-1;
                else
                    i += increment;
            }
            else { // key is 'l' or 'r'
                increment = (countourKey === key)
                    ? normalIncrement
                    : normalIncrement * -1
                    ;

                if((increment === 1 && i === stroke.length-1)
                                    || (increment === -1 && i === 0)) {
                    // switch to the other side of the stroke;
                    // i stays the same
                    countourKey = key === 'l' ? 'r':'l';
                    increment = increment * -1;
                }
                else
                    i += increment;
            }
        }
    }

    // TODO: Take care of contours marked as smooth, when the obvious
    // direction of a control point was not available. Then we could
    // improve the result of _findNextDirection by returning a smooth
    // connection.
    // If only one direction is a normal direction, the other
    // should be the inverse of that direction.
    // If both directions are 'artificial' the result should be averaged
    // to create a smooth direction.
    function _setPolarControls(stroke, key, point, index, contour) {
        var outVector, inVector, dir;
        outVector = point.out['-'](point.on);
        point.outLength = outVector.magnitude();
        dir = _findNextDirection(stroke, index, key, point, 'out');
        if(dir === false)
            throw new ImportPenstroke('can\'t find a outgoing direction '
                                        +'for point['+index+'].'+key);
        point.outDir = dir;
        inVector = point.on['-'](point['in']);
        point.inLength = inVector.magnitude();
        dir = _findNextDirection(stroke, index, key, point, 'in');
        if(dir === false)
            throw new ImportPenstroke('can\'t find a incoming direction '
                                        +'for point['+index+'].'+key);
        point.inDir = dir;
        return point;
    }

    function _setTensions(stroke, key, metapoint, index, contour) {
        var next
          , uv
          , point = metapoint[key]
          ;
        if(index !== contour.length-1) {
            next = contour[index+1][key];
            uv = hobby.magnitude2tension(
                                    point.on, point.outDir, point.outLength,
                                    next.inLength, next.inDir, next.on);
            point.outTension = uv[0];
            next.inTension = uv[1];
        }

        if(index === 0 && key === 'l') {
            // beginning terminal
            // only handled on the left side for both: 'l' and 'r'
            next =  metapoint.r;
            uv = hobby.magnitude2tension(
                                    point.on, point.inDir  + Math.PI, point.inLength,
                                    next.inLength, next.inDir, next.on);
            point.inTension = uv[0];
            next.inTension = uv[1];
        }
        else if(index === contour.length-1 && key === 'r') {
            // ending terminal
            // only handled on the right side for both: 'l' and 'r'
            next =  metapoint.l;
            uv = hobby.magnitude2tension(
                                    point.on, point.outDir, point.outLength,
                                    next.outLength, next.outDir + Math.PI, next.on);
            point.outTension = uv[0];
            next.outTension = uv[1];
        }
    }

    /**
     * Returns a list of points like following:
     *
     * the coordinates are absolute.
     *
     * // one "point"
     *  {
     *      l: {
     *          in: Vector
     *        , out: Vector
     *        , on: Vector
     *        , wasLine: true|false
     *        , outLength: real number
     *        , outDir: , angle in radians
     *        , inLength: real number
     *        , inDir: real number, angle in radians
     *        , outTension: real number or Infinity if outLength === 0
     *        , inTension: real number or Infinity if inLength === 0
     *      }
     *    , r: {
     *          in: Vector
     *        , out: Vector
     *        , on: Vector
     *        , wasLine: true|false
     *        , outLength: real number
     *        , outDir: , angle in radians
     *        , inLength: real number
     *        , inDir: real number, angle in radians
     *        , outTension: real number or Infinity if outLength === 0
     *        , inTension: real number or Infinity if inLength === 0
     *      }
     *    , z: {
     *          in: Vector
     *        , out: Vector
     *        , on: Vector
     *        , wasLine: true|false
     *        , outLength: real number
     *        , outDir: , angle in radians
     *        , inLength: real number
     *        , inDir: real number, angle in radians
     *      }
     * }
     */
    _p.getPenStroke = function() {
        var stroke = this._getPenStroke();
        stroke.map(_extractKey.bind(null,'l'))
              .map(_setPolarControls.bind(null, stroke,'l'))
              .forEach(_setKey.bind(null, stroke,'l'))
              ;
        stroke.map(_extractKey.bind(null,'r'))
              .map(_setPolarControls.bind(null, stroke,'r'))
              .forEach(_setKey.bind(null, stroke,'r'))
              ;

        stroke.map(_extractKey.bind(null,'z'))
              .map(_setPolarControls.bind(null, stroke,'z'))
              .forEach(_setKey.bind(null, stroke,'z'))
              ;

        stroke.forEach(_setTensions.bind(null, stroke,'l'));
        stroke.forEach(_setTensions.bind(null, stroke,'r'));
        return stroke;
    };

    return StrokeContour;
});
