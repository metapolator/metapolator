/**
 * Copyright (c) 2011, Lasse Fister lasse@graphicore.de, http://graphicore.de
 * 
 * You should have received a copy of the MIT License along with this program.
 * If not, see http://www.opensource.org/licenses/mit-license.php
 * 
 * This is a translation of AbstractPen defined in fontTools/pens/basePen.py
 * The svn revision of the source file in trunk/Lib/ was 498 from 2005-04-10 15:18:42 +0200
 * 
 * I even copied the docstrings and comments! (These may still refer to the Python code)
 */
define(['ufojs', 'ufojs/errors'], function(main, errors) {
    "use strict";
    var enhance = main.enhance;
    //shortcuts
    var NotImplementedError = errors.NotImplemented;
    
    /*constructor*/
    var AbstractPen = function(){};

    /*inheritance*/
    //pass

    /*definition*/
    enhance(AbstractPen, {
        /**
         * Begin a new sub path, set the current point to 'pt'. You must
         * end each sub path with a call to pen.closePath() or pen.endPath().
         */
        moveTo: function(pt)
        {
            throw new NotImplementedError('AbstractPen has not implemented'
            +' moveTo');
        },
        /**
         * Draw a straight line from the current point to 'pt'.
         */
        lineTo: function(pt)
        {
             throw new NotImplementedError('AbstractPen has not implemented'
            +' lineTo');
        },
        /**
         * Draw a cubic bezier with an arbitrary number of control points.
         *
         * The last point specified is on-curve, all others are off-curve
         * (control) points. If the number of control points is > 2, the
         * segment is split into multiple bezier segments. This works
         * like this:
         *
         * Let n be the number of control points (which is the number of
         * arguments to this call minus 1). If n==2, a plain vanilla cubic
         * bezier is drawn. If n==1, we fall back to a quadratic segment and
         * if n==0 we draw a straight line. It gets interesting when n>2:
         * n-1 PostScript-style cubic segments will be drawn as if it were
         * one curve. See decomposeSuperBezierSegment().
         *
         * The conversion algorithm used for n>2 is inspired by NURB
         * splines, and is conceptually equivalent to the TrueType "implied
         * points" principle. See also decomposeQuadraticSegment().
         */
        curveTo: function(/* *points */)
        {
            throw new NotImplementedError('AbstractPen has not implemented'
            +' curveTo');
        },
        /**
         * Draw a whole string of quadratic curve segments.
         * 
         * The last point specified is on-curve, all others are off-curve
         * points.
         * 
         * This method implements TrueType-style curves, breaking up curves
         * using 'implied points': between each two consequtive off-curve points,
         * there is one implied point exactly in the middle between them. See
         * also decomposeQuadraticSegment().
         * 
         * The last argument (normally the on-curve point) may be None.
         * This is to support contours that have NO on-curve points (a rarely
         * seen feature of TrueType outlines).
         */
        qCurveTo: function (/* *points */)
        {
            throw new NotImplementedError('AbstractPen has not implemented'
            +' qCurveTo');
        },
        /**
         * Close the current sub path. You must call either pen.closePath()
         * or pen.endPath() after each sub path.
         */
        closePath: function()
        {
            //pass
        },
        /**
         * End the current sub path, but don't close it. You must call
         * either pen.closePath() or pen.endPath() after each sub path.
         */
        endPath: function()
        {
            //pass
        },
        /**
         * Add a sub glyph. The 'transformation' argument must be a 6-tuple
         * containing an affine transformation, or a Transform object from the
         * fontTools.misc.transform module. More precisely: it should be a
         * sequence containing 6 numbers.
         */
        addComponent: function(glyphName, transformation)
        {
            throw new NotImplementedError('AbstractPen has not implemented'
            +' addComponent');
        }
    });
    return AbstractPen;
});
