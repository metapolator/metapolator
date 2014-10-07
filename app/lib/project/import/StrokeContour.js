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
    var Parent = Array
      , line2curve = tools.line2curve
      , getStrokeTerminals = tools.getStrokeTerminals
      , getCenterPoint = tools.getCenterPoint
      , getCenter = tools.getCenter
      , getCenterSegment = tools.getCenterSegment
      ;
    
    
    
    /**
     * From a semantic point of view we have only on-curve points, which:
     *     may have an incoming control( point || tension + direction)
     *     may have an outgoing control( point || tension + direction)
     * 
     * This is also the representation font-editors commonly use
     * they are not concerned with a segment based presentation. So
     * this is the way most people think about vector graphics.
     */
    function getSemanticPoint(segmentA, segmentB) {
        var point = {
            on: segmentA[segmentA.length-1]
            // whether this was the on curve point of a lineTo Segment
          , wasLine: !!segmentA.wasLine
          , in: undefined
          , ou: undefined
        };
        
        if(segmentA[0] === 'curveTo')
            // this shouldnt happen with the first item.
            // That one should be moveTo
            point.in = segmentA[2];
        
        if(segmentB && segmentB[0] === 'curveTo')
            // if this is the last item segmentB is undefined
            point.ou = segmentB[1];
        return point;
    }
    
    /**
     * augment a PenStroke point with direction and tensions parameters
     */
    function addHobby(p0, p1) {
        var tensions;
        // add directions
        if(p0.ou)
            p0.ouDir = p0.ou.vector['-'](p0.on.vector);
        if(p1.in)
            p1.inDir = p1.on.vector['-'](p1.in.vector);
        
        // addTensions
        
        // FIXME: there should be a when the directions
        // are 0 but the distance from p0.on to p1.on is != 0
        // because then we can use the directions of the straight line
        // but to make some progress I skip the corner cases
        // for now!
        if(!p0.ou || !p1.in || p0.ouDir.magnitude() === 0
                            || p1.inDir.magnitude() === 0)
            return;
        // else
        tensions = hobby.tensions(
              p0.on.vector
            , p0.ou.vector
            , p1.in.vector
            , p1.on.vector
        )
        p0.ouTension = tensions[0];
        p1.inTension = tensions[1];
    }
    
    /**
     * The terminals are a very special case! because of the structure
     * of the Penstroke two in points at the beginning of the stroke
     * describe the curve there. At the end of the stroke, two out
     * points "ou" describe the curve.
     * 
     * "ctrl" is the control to affect, must be either 'in' or 'ou'
     * 
     * see getAbsolutePenStroke for the calls to this function.
     * 
     * beginning terminal of the segment
     *              addTerminalHobby(point.l, point.r, 'in');
     * ending terminal of the segment
     *              addTerminalHobby(point.r, point.l, 'ou');
     * 
     */
    function addTerminalHobby(a, b, ctrl) {
        var dir = ({in: 'inDir', ou: 'ouDir'})[ctrl]
          , tension = ({in: 'inTension', ou: 'ouTension'})[ctrl]
          , tensions
          ;
        // add directions
        if(a[ctrl])
            a[dir] = a[ctrl].vector['-'](a.on.vector);
        if(b[ctrl])
            b[dir] = b.on.vector['-'](b[ctrl].vector);
        
        // add tensions
        if(!a[ctrl] || !b[ctrl] || a[dir].magnitude() === 0
                                || b[dir].magnitude() === 0)
            return;
        tensions = hobby.tensions(
            a.on.vector
          , a[ctrl].vector
          , b[ctrl].vector
          , b.on.vector
        );
        a[tension] = tensions[0];
        b[tension] = tensions[1];
    }
    
    /**
     * This methods expects a input-contour like a SegementPen produces it.
     * 
     * The 'implied' closing line must be included
     * which is *not* the default when using a ufoJS like PointToSegmentPen!
     * see the outputImpliedClosingLine of the PointToSegmentPen constructor.
     * 
     * The input-contour must be a closed contour.
     * 
     * The minimal length of the input-contour is 3 which yields in a one item
     * result.
     * 
     * The input-contour is expected to have an uneven number of segments:
     * An initial 'moveTo' segment and an even number of either 'lineTo'
     * or 'curveTo' segments.
     * 
     * The result of this method is an array of arrays of left and right segment
     * pairs:
     * 
     * var result = [
     *      [left, right],
     *      [left, right],
     *      [left, right],
     *      [left, right],
     * ]
     * 
     * The result length is (input.length -1) /2
     * 
     * 
     * This method treats the first on curve point as first point on
     * the right side and the on curve point before the last on curve
     * point as the first point on the left side. Each segement has one
     * on curve point and 0 or 3 off curve points.
     * 
     * The last segment is skipped as well as the segment with the index
     * (contour.length-1)/2. Both segments are the 'width' of the stroke
     * and not part of the outline.
     * ## Note: it would be cool to preserve these segments as line
     *    endings of the stroke
     * 
     * The results left segments are a direction reversed representation
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
     *        [moveTo, moveTo]
     *        [8, 0]
     *        [7, 1]
     *        [6, 2]
     *        [5, 3]
     *     ]
     */
    function StrokeContour(contour) {
        Parent.call(this);
            // skip the first moveto
        var right = 1
            // -1 for length to index translation,
            // -1 because the very last segment is the vector of the 
            // pen, not part of the stroke
          , left = contour.length-2
          , zLength = (contour.length-1)*0.5
          , leftSegment, points
          ;
        
        this.terminals = getStrokeTerminals(contour);
        
        // add the initial moveTo to this
        this.push([
            ['moveTo', contour[left].slice(-1).pop()]
            , contour[0]
        ])
        for(;right<zLength; right++, left--) {
            // the problem is, that the left contour is in the wrong
            // direction. so we have to reverse its direction:
            leftSegment = []
            
            // start with the command
            leftSegment.push(contour[left][0])
            // add the control points (if any) in reverse order
            leftSegment.push.apply(leftSegment,
                                contour[left].slice(1,-1).reverse())
            // oncurve point of the previous segment
            leftSegment.push(contour[left-1].slice(-1).pop())
            
            this.push([leftSegment, contour[right]]);
        }
    }
    
    var _p = StrokeContour.prototype = Object.create(Array.prototype);
    _p.constructor = StrokeContour;
    
    _p.push = function(/* ... */) {
        var args = Array.prototype.slice.apply(arguments)
          , i=0
          , segments
          , left = 0
          , right = 1
          ;
        
        for(;i<args.length;i++) {
            args[i]; // === [leftSegment, rightSegment]
            segments = [];
            
            // we convert ALL lineTo to curveTo
            // but the Segment is marked with .wasLine = true;
            if(args[i][left][0] === 'lineTo') {
                segments[left] = line2curve(
                    this[this.length-1][left].slice(-1).pop()
                    , args[i][left][1]
                );
                segments[left].wasLine = true;
            }
            else
                segments[left] = args[i][left].slice();//??? need as copy?
                
            
            if(args[i][right][0] === 'lineTo') {
                segments[right] = line2curve(
                    this[this.length-1][right].slice(-1).pop()
                    , args[i][right][1]
                );
                segments[right].wasLine = true;
            }
            else
                segments[right] = args[i][right].slice();// ??? need as copy?
            
            Parent.prototype.push.call(this, segments);
        }
    };
    
    _p.separate = function(left, right) {
        var separated = [left || [], right || []]
          , i=0
          ;
        for(;i<this.length;i++) {
            separated[0].push(this[i][0]);
            separated[1].push(this[i][1]);
        }
        return separated;
    }
    
    
    /**
     * Returns a list of points like following:
     * 
     * the coordinates are absolute.
     * 
     * // one "point"
     *  {
     *      l: {
     *          in: SegmentPoint
     *        , out: SegmentPoint
     *        , on: SegmentPoint
     *        , // only when withHobby is true
     *        , ouDir: Vector
     *        , inDir: Vector
     *        , ouTension: Number
     *        , inTension: Number
     *      }
     *    , r: {
     *          in: SegmentPoint
     *        , out: SegmentPoint
     *        , on: SegmentPoint
     *        , // only when withHobby is true
     *        , ouDir: Vector
     *        , inDir: Vector
     *        , ouTension: Number
     *        , inTension: Number
     *      }
     *    , z: {
     *          in: SegmentPoint
     *        , out: SegmentPoint
     *        , on: SegmentPoint
     *        , // only when withHobby is true
     *        , ouDir: Vector
     *        , inDir: Vector
     *        , ouTension: Number
     *        , inTension: Number
     *      }
     * }
     * 
     * The withHobby flag could be removed when there would be a plugin
     * infrastructure that would allow processing and augmenting the
     * returned pen stroke.
     * 
     */
    _p.getPenStroke = function(withHobby) {
        var point
          , left = []
          , right = []
          , result = []
          , i = 0
          ;
        
        // writes to left and right
        this.separate(left, right);
        
        for(;i<this.length; i++) {
            point = {
                l: getSemanticPoint(left[i], left[i+1])
              , r: getSemanticPoint(right[i], right[i+1])
              , z: getSemanticPoint(getCenterSegment(left[i], right[i]), 
                        // if not both are undefined or both are defined
                        // the structure of the points would be broken!
                        (left[i+1] === undefined
                            ? undefined
                            : getCenterSegment(left[i+1], right[i+1])
                        )
                    )
            }
            result.push(point);
            
            // NOTE: adding hobby spline info (tension and dir) could
            // already be a Plugin. This can happen independently from
            // the rest here.
            // Track the withHobby Parameter to get an idea of what
            // the hobby plugin would do (it is used for the terminals, too)
            //
            // A plugin approach would make it easier to extract more data
            // from a PenStroke without making this method bigger and bigger,
            // and it would make it easier to come up with new things to
            // extract.
            
            if(!withHobby || i===0)
                // because we'll look behind
                continue;
            // left hobby
            addHobby(result[i-1].l, point.l);
            // right hobby
            addHobby(result[i-1].r, point.r)
            // center hobby
            addHobby(result[i-1].z, point.z)
            
            // This happens with my test glif BodonMP.ufo
            // if(point.l.inTension > 5) {
            //     console.log('>>BIG>> StroleContour getPenStroke point.l.inTension', point.l.inTension)
            //     console.log('check if this is the same when done with mpost')
            // }
        }
        
        // add the terminal control points
        
        // the terminals are a very special case! because of the structure
        // of the Penstroke two "in" points at the beginning of the stroke
        // describe the curve there. At the end of the stroke, two out
        // points "ou" describe the curve.
        
        // terminal of the beginning of the stroke
        if(this.terminals[0][0] === 'curveTo') {
            console.warn('Adding terminal to point 0')
            point = result[0];
            point.l.in = this.terminals[0][1]
            point.r.in = this.terminals[0][2]
            if(withHobby)
                addTerminalHobby(point.l, point.r, 'in');
        }
        //terminal of the ending of the stroke
        if(this.terminals[1][0] === 'curveTo') {
            point = result[result.length-1];
            point.r.ou = this.terminals[1][1]
            point.l.ou = this.terminals[1][2]
            if(withHobby)
                addTerminalHobby(point.r, point.l, 'ou');
        }
        return result;
    }
    
    
    return StrokeContour;
})
