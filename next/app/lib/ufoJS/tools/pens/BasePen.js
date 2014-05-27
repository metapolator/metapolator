/**
 * Copyright (c) 2011, Lasse Fister lasse@graphicore.de, http://graphicore.de
 * 
 * You should have received a copy of the MIT License along with this program.
 * If not, see http://www.opensource.org/licenses/mit-license.php
 * 
 * This is a translation of BasePen defined in fontTools/pens/basePen.py
 * The svn revision of the source file in trunk/Lib/ was 498 from 2005-04-10 15:18:42  +0200
 * 
 * I even copied the docstrings and comments! (These may still refer to the Python code)
 */
define(
    [
        'ufojs',
        'ufojs/errors',
        './main',
        './AbstractPen',
        './TransformPen'
    ],
    function(
        mainmain,
        errors,
        main,
        AbstractPen,
        TransformPen
) {
    "use strict";
    var enhance = mainmain.enhance,
        NotImplementedError = errors.NotImplemented,
        AssertionError = errors.Assertion,
        decomposeSuperBezierSegment = main.decomposeSuperBezierSegment,
        decomposeQuadraticSegment = main.decomposeQuadraticSegment,
        assert = errors.assert;
    /**
     * Base class for drawing pens. You must override _moveTo, _lineTo and
     * _curveToOne. You may additionally override _closePath, _endPath,
     * addComponent and/or _qCurveToOne. You should not override any other
     * methods.
     */
    /*constructor*/
    function BasePen (glyphSet) {
        this.glyphSet = glyphSet;
        this.__currentPoint = null;
    };

    /*inheritance*/
    BasePen.prototype = Object.create(AbstractPen.prototype);

    /*definition*/
    enhance(BasePen, {
        
        // must override
        
        _moveTo: function(pt)
        {
            throw new NotImplementedError('implement _moveTo');
        },
        _lineTo: function(pt)
        {
            throw new NotImplementedError('implement _lineTo');
        },
        _curveToOne: function(pt1, pt2, pt3)
        {
            throw new NotImplementedError('implement _curveToOne');
        },
        
        // may override
        
        _closePath: function()
        {
            //pass
        },
        _endPath: function()
        {
            //pass
        },
        /**
         * This method implements the basic quadratic curve type. The
         * default implementation delegates the work to the cubic curve
         * function. Optionally override with a native implementation.
         */
        _qCurveToOne: function(pt1, pt2)
        {
            var pt0x = this.__currentPoint[0],
                pt0y = this.__currentPoint[1],
                pt1x = pt1[0],
                pt1y = pt1[1],
                pt2x = pt2[0],
                pt2y = pt2[1],
                mid1x = pt0x + 0.66666666666666667 * (pt1x - pt0x),
                mid1y = pt0y + 0.66666666666666667 * (pt1y - pt0y),
                mid2x = pt2x + 0.66666666666666667 * (pt1x - pt2x),
                mid2y = pt2y + 0.66666666666666667 * (pt1y - pt2y);
            this._curveToOne([mid1x, mid1y], [mid2x, mid2y], pt2)
        },
        /**
         * This default implementation simply transforms the points
         * of the base glyph and draws it onto self.
         */
        addComponent: function(glyphName, transformation)
        {
            var glyph = this.glyphSet[glyphName];
            if(glyph !== undefined) {
                var tPen = new TransformPen(this, transformation);
                glyph.draw(tPen);
            }
        },
        
        // don't override
        
        /**
         * Return the current point. This is not part of the public
         * interface, yet is useful for subclasses.
         */
        _getCurrentPoint: function()
        {
            return this.__currentPoint;
        },
        closePath: function()
        {
            this._closePath();
            this.__currentPoint = null;
        },
        endPath: function()
        {
            this._endPath();
            this.__currentPoint = null;
        },
        moveTo: function(pt)
        {
            this._moveTo(pt);
            this.__currentPoint = pt;
        },
        lineTo: function(pt)
        {
            this._lineTo(pt);
            this.__currentPoint = pt;
        },
        curveTo: function(/* *points */)
        {
            var points = [].slice.call(arguments),//transform arguments to an array
                n = points.length - 1;// 'n' is the number of control points
            assert(n >= 0, 'curveTo needs at least one point');
            if (n == 2) {
                // The common case, we have exactly two BCP's, so this is a standard
                // cubic bezier. Even though decomposeSuperBezierSegment() handles
                // this case just fine, we special-case it anyway since it's so
                // common.
                this._curveToOne.apply(this, points);
                this.__currentPoint = points[points.length - 1];
            } else if (n > 2) {
                // n is the number of control points; split curve into n-1 cubic
                // bezier segments. The algorithm used here is inspired by NURB
                // splines and the TrueType "implied point" principle, and ensures
                // the smoothest possible connection between two curve segments,
                // with no disruption in the curvature. It is practical since it
                // allows one to construct multiple bezier segments with a much
                // smaller amount of points.
                var _curveToOne = this._curveToOne,
                    segments = decomposeSuperBezierSegment(points),
                    segment, i;
                for (i in segments) {
                    segment = segments[i];
                    //var pt1 = segment[0];
                    //var pt2 = segment[1];
                    //var pt3 = segment[2];
                    _curveToOne.apply(this ,segment);
                    this.__currentPoint = segment[2];//pt3
                }
            } else if (n == 1) {
                this.qCurveTo.apply(this, points);
            } else if (n == 0) {
                this.lineTo(points[0]);
            } else {
                throw new AssertionError("curveTo() can't get there from here");
            }
        },
        qCurveTo: function(/* *points */)
        {
            var points = [].slice.call(arguments),//transform arguments to an array
                n = points.length - 1; //'n' is the number of control points
            assert(n >= 0, 'qCurveTo needs at least one point');
            if (points[points.length -1] === null) {
                // Special case for TrueType quadratics: it is possible to
                // define a contour with NO on-curve points. BasePen supports
                // this by allowing the final argument (the expected on-curve
                // point) to be null. We simulate the feature by making the implied
                // on-curve point between the last and the first off-curve points
                // explicit.
                var x = points[points.length -2][0], // last off-curve point x
                    y = points[points.length -2][1], // last off-curve point y
                    nx = points[0][0], // first off-curve point x
                    ny = points[0][1], // first off-curve point y
                    impliedStartPoint = [ 0.5 * (x + nx), 0.5 * (y + ny) ];
                this.__currentPoint = impliedStartPoint;
                this._moveTo(impliedStartPoint);
                points.splice(-1, 1, impliedStartPoint);//splice syntax is: index, howMany, *elements to insert
            }
            if (n > 0) {
                // Split the string of points into discrete quadratic curve
                // segments. Between any two consecutive off-curve points
                // there's an implied on-curve point exactly in the middle.
                // This is where the segment splits.
                var _qCurveToOne = this._qCurveToOne,
                    segments = decomposeQuadraticSegment(points),
                    segment, i;
                for (i in segments) {
                    segment = segments[i];
                    //var pt1 = segment[0];
                    //var pt2 = segment[1];
                    _qCurveToOne.apply(this, segment);
                    this.__currentPoint = segment[1]; //pt2
                }
            } else {
                this.lineTo(points[0]);
            }
        }
    });

    return BasePen;
});
