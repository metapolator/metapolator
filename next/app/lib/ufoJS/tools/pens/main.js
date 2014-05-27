/**
 * Copyright (c) 2011, Lasse Fister lasse@graphicore.de, http://graphicore.de
 * 
 * You should have received a copy of the MIT License along with this program.
 * If not, see http://www.opensource.org/licenses/mit-license.php
 * 
 * The functions decomposeSuperBezierSegment and decomposeQuadraticSegment 
 * are a translation of the equally named functions defined in
 * fontTools/pens/basePen.py The svn revision of the source file in
 * trunk/Lib/ was 498 from 2005-04-10 15:18:42 +0200
 * 
 * I even copied the docstrings and comments! (These may still refer to the Python code)
 * 
 * //////////////////////////////////////////////
 * 
 * straight from fontTools/pens/basePen.py
 * fontTools.pens.basePen.py -- Tools and base classes to build pen objects.
 * 
 * The Pen Protocol
 * 
 * A Pen is a kind of object that standardizes the way how to "draw" outlines:
 * it is a middle man between an outline and a drawing. In other words:
 * it is an abstraction for drawing outlines, making sure that outline objects
 * don't need to know the details about how and where they're being drawn, and
 * that drawings don't need to know the details of how outlines are stored.
 * 
 * The most basic pattern is this:
 * 
 *     outline.draw(pen)  # 'outline' draws itself onto 'pen'
 * 
 * Pens can be used to render outlines to the screen, but also to construct
 * new outlines. Eg. an outline object can be both a drawable object (it has a
 * draw() method) as well as a pen itself: you *build* an outline using pen
 * methods.
 * 
 * The AbstractPen class defines the Pen protocol. It implements almost
 * nothing (only no-op closePath() and endPath() methods), but is useful
 * for documentation purposes. Subclassing it basically tells the reader:
 * "this class implements the Pen protocol.". An examples of an AbstractPen
 * subclass is fontTools.pens.transformPen.TransformPen.
 * 
 * The BasePen class is a base implementation useful for pens that actually
 * draw (for example a pen renders outlines using a native graphics engine).
 * BasePen contains a lot of base functionality, making it very easy to build
 * a pen that fully conforms to the pen protocol. Note that if you subclass
 * BasePen, you _don't_ override moveTo(), lineTo(), etc., but _moveTo(),
 * _lineTo(), etc. See the BasePen doc string for details. Examples of
 * BasePen subclasses are fontTools.pens.boundsPen.BoundsPen and
 * fontTools.pens.cocoaPen.CocoaPen.
 * 
 * Coordinates are usually expressed as (x, y) tuples, but generally any
 * sequence of length 2 will do.
 */
define(['ufojs', 'ufojs/errors'], function(main, errors){
    "use strict";
    var assert = errors.assert,
        range = main.range;
    
    /**
     * Split the SuperBezier described by 'points' into a list of regular
     * bezier segments. The 'points' argument must be a list with length
     * 3 or greater, containing [x, y] coordinates. The last point is the
     * destination on-curve point, the rest of the points are off-curve points.
     * The start point should not be supplied.
     * 
     * This function returns a list of [pt1, pt2, pt3] lists, which each
     * specify a regular curveto-style bezier segment.
     */
    function decomposeSuperBezierSegment(points) {
        var n = points.length - 1,
            bezierSegments = [],
            pt1 = points[0],
            pt2 = null,
            pt3 = null,
            i, j, nDivisions, factor, temp1, temp2, temp;
        
        assert(n > 1, 'Expecting at least 3 Points here');
        
        for (i in range(2, n+1))
        {
            i -= 0;//cast this to int
            // calculate points in between control points.
            nDivisions = Math.min(i, 3, n - i + 2);
            // used to be d = float(nDivisions) in the python source but
            // in js all numbers are float and there is no integer division
            // thing like in the older versions of python:
            //    e.g. 2 / 3 = 0 but 2 / 3.0 = 0.6666666666666666
            // so I'll use nDivision throughout
            for (j in range(1, nDivisions))
            {
                j -= 0;//cast this to int
                factor = j / nDivisions;
                temp1 = points[i-1];
                temp2 = points[i-2];
                temp = [
                    temp2[0] + factor * (temp1[0] - temp2[0]),
                    temp2[1] + factor * (temp1[1] - temp2[1])
                ];
                if (pt2 === null) {
                    pt2 = temp;
                } else {
                    pt3 = [
                        0.5 * (pt2[0] + temp[0]),
                        0.5 * (pt2[1] + temp[1])
                    ];
                    bezierSegments.push([pt1, pt2, pt3]);
                    pt1 = temp;
                    pt2 = null;
                    pt3 = null;
                }
            }
        }
        bezierSegments.push([pt1, points[points.length-2], points[points.length-1]]);
        return bezierSegments;
    };
    
   /**
    * Split the quadratic curve segment described by 'points' into a list
    * of "atomic" quadratic segments. The 'points' argument must be a list
    * with length 2 or greater, containing [x, y] coordinates. The last point
    * is the destination on-curve point, the rest of the points are off-curve
    * points. The start point should not be supplied.
    * 
    * This function returns a list of [pt1, pt2] lists, which each specify a
    * plain quadratic bezier segment.
    */
    function decomposeQuadraticSegment(points) {
        var n = points.length - 1,
            quadSegments = [],
            i, x, y, nx, ny, impliedPt;
        assert(n > 0, 'Expecting at least 2 Points here');
        for (i in range(n - 1))
        {
            //the keys of the list are strings, what makes i+1 == '01'
            i -= 0;//cast this to int
            x = points[i][0];
            y = points[i][1];
            nx = points[i+1][0];
            ny = points[i+1][1];
            impliedPt = [0.5 * (x + nx), 0.5 * (y + ny)];
            quadSegments.push([points[i], impliedPt]);
        }
        quadSegments.push( [points[points.length-2], points[points.length-1]] );
        return quadSegments;
    };
    return {
        decomposeSuperBezierSegment: decomposeSuperBezierSegment,
        decomposeQuadraticSegment: decomposeQuadraticSegment
    };
})
