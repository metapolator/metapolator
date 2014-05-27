/**
 * Copyright (c) 2011, Lasse Fister lasse@graphicore.de, http://graphicore.de
 * 
 * You should have received a copy of the MIT License along with this program.
 * If not, see http://www.opensource.org/licenses/mit-license.php
 * 
 * This is a translation of the contents of fontTools/misc/transform.py
 * The svn revision of the source file in trunk/Lib/  was 588 from 2011-03-28 12:18:27 +0200 
 * 
 * Some cool python features do not work on this thing but I put in some
 * efforts to mimic the python implementation. The future will show whether
 * the direction is good
 *
 * I even copied the docstrings and comments! (These may still refer to
 * the Python code)
 * 
 * Affine 2D transformation matrix class.
 * 
 * The Transform class implements various transformation matrix operations,
 * both on the matrix itself, as well as on 2D coordinates.
 * 
 * This module exports the following symbols:
 * 
 *     Transform -- this is the main class
 *     Identity  -- Transform instance set to the identity transformation
 *     Offset    -- Convenience function that returns a translating transformation
 *     Scale     -- Convenience function that returns a scaling transformation
 * 
 * Examples: //still in python
 * 
 *     >>> t = Transform(2, 0, 0, 3, 0, 0)
 *     >>> t.transformPoint((100, 100))
 *     (200, 300)
 *     >>> t = Scale(2, 3)
 *     >>> t.transformPoint((100, 100))
 *     (200, 300)
 *     >>> t.transformPoint((0, 0))
 *     (0, 0)
 *     >>> t = Offset(2, 3)
 *     >>> t.transformPoint((100, 100))
 *     (102, 103)
 *     >>> t.transformPoint((0, 0))
 *     (2, 3)
 *     >>> t2 = t.scale(0.5)
 *     >>> t2.transformPoint((100, 100))
 *     (52.0, 53.0)
 *     >>> import math
 *     >>> t3 = t2.rotate(math.pi / 2)
 *     >>> t3.transformPoint((0, 0))
 *     (2.0, 3.0)
 *     >>> t3.transformPoint((100, 100))
 *     (-48.0, 53.0)
 *     >>> t = Identity.scale(0.5).translate(100, 200).skew(0.1, 0.2)
 *     >>> t.transformPoints([(0, 0), (1, 1), (100, 100)])
 *     [(50.0, 100.0), (50.550167336042726, 100.60135501775433), (105.01673360427253, 160.13550177543362)]
 *     >>>
 */

define(
    ['ufojs', 'ufojs/errors'],
    function(main, errors)
{
    "use strict";
    /*shortcuts*/
    var enhance = main.enhance;
    
    /*constants*/
    var EPSILON = 1e-15,
        ONE_EPSILON = 1 - EPSILON,
        MINUS_ONE_EPSILON = -1 + EPSILON;
    
    /*helpers*/
    function _normSinCos(v)
    {
        if (Math.abs(v) < EPSILON)
            v = 0;
        else if (v > ONE_EPSILON)
            v = 1;
        else if (v < MINUS_ONE_EPSILON)
            v = -1;
        return v
    }
    
    /*constructor*/
    /**
    * 2x2 transformation matrix plus offset, a.k.a. Affine transform.
    * All transforming methods, eg. rotate(), return a new Transform instance.
    * 
    * Examples: //in python still
    *    >>> t = Transform()
    *    >>> t
    *    <Transform [1 0 0 1 0 0]>
    *    >>> t.scale(2)
    *    <Transform [2 0 0 2 0 0]>
    *    >>> t.scale(2.5, 5.5)
    *    <Transform [2.5 0.0 0.0 5.5 0 0]>
    *    >>>
    *    >>> t.scale(2, 3).transformPoint((100, 100))
    *    (200, 300)
    */
    function Transform(transformation /* [xx=1, xy=0, yx=0, yy=1, dx=0, dy=0] */) {
        //can't change easily after creation
        var affine = [1, 0, 0, 1, 0, 0];
        
        /**
         * the next two methods are just accessors to the local affine value
         **/
        this.__get = function (key)
        {
            if(affine[key] === undefined)
                throw new errors.Key('The key ' + key + 'does not exist in' + this);
            return affine[key];
        }
        this.__affine = function()
        {
            //return a copy
            return affine.slice(0);
        }
        
        
        
        if(transformation === undefined)
            return;
        for(var i = 0; i < 6; i++) {
            if(transformation[i] === undefined || transformation[i] === null)
                continue;
            affine[i] = transformation[i];
        }
    }
    
    /*definition*/
    enhance(Transform, {
        /**
         * Transform a point.
         *
         *  Example:
         *      >>> t = Transform()
         *      >>> t = t.scale(2.5, 5.5)
         *      >>> t.transformPoint((100, 100))
         *      (250.0, 550.0)
         */
        transformPoint: function( pt )
        {
            var xx = this[0],
                xy = this[1],
                yx = this[2],
                yy = this[3],
                dx = this[4],
                dy = this[5],
                x = pt[0],
                y = pt[1];
            return [xx*x + yx*y + dx, xy*x + yy*y + dy];
        },
        /**
         * Transform a list of points.
         * 
         * Example: //in python
         *      >>> t = Scale(2, 3)
         *      >>> t.transformPoints([(0, 0), (0, 100), (100, 100), (100, 0)])
         *      [(0, 0), (0, 300), (200, 300), (200, 0)]
         *      >>>
         */
        transformPoints: function(points)
        {
            return points.map(this.transformPoint, this);
        },
        /**
         * Return a new transformation, translated (offset) by x, y.
         * 
         * Example:
         *      >>> t = Transform()
         *      >>> t.translate(20, 30)
         *      <Transform [1 0 0 1 20 30]>
         *      >>>
         */
        translate: function(x, y)
        {
            x = x || 0;
            y = y || 0;
            return this.transform([1, 0, 0, 1, x, y ]);
        },
        /**
         * Return a new transformation, scaled by x, y. The 'y' argument
         * may be undefined, which implies to use the x value for y as well.
         * 
         * Example:
         *      >>> t = Transform()
         *      >>> t.scale(5)
         *      <Transform [5 0 0 5 0 0]>
         *      >>> t.scale(5, 6)
         *      <Transform [5 0 0 6 0 0]>
         *      >>>
         */
        scale: function(x, y)
        {
            if(x === undefined)
                x = 1;
            if(y === undefined || y === null)
                y = x;
            return this.transform([x, 0, 0, y, 0, 0]);
        },
        /**
         * Return a new transformation, rotated by 'angle' (radians).
         * 
         * Example: //python
         *      >>> import math
         *      >>> t = Transform()
         *      >>> t.rotate(math.pi / 2)
         *      <Transform [0 1 -1 0 0 0]>
         *      >>>
         */
        rotate: function(angle)
        {
            var c = _normSinCos(Math.cos(angle)),
                s = _normSinCos(Math.sin(angle));
            return this.transform([c, s, -s, c, 0, 0]);
        },
        /**
         * Return a new transformation, skewed by x and y.
         * 
         * Example:
         *      >>> import math
         *      >>> t = Transform()
         *      >>> t.skew(math.pi / 4)
         *      <Transform [1.0 0.0 1.0 1.0 0 0]>
         *      >>>
         */
        skew: function(x, y)
        {
            x = x || 0;
            y = y || 0;
            return this.transform([1, Math.tan(y), Math.tan(x), 1, 0, 0]);
        },
        /**
         * Return a new transformation, transformed by another
         * transformation.
         * 
         * Example:
         *      >>> t = Transform(2, 0, 0, 3, 1, 6)
         *      >>> t.transform((4, 3, 2, 1, 5, 6))
         *      <Transform [8 9 4 3 11 24]>
         *      >>>
         */
        transform: function(other)
        {
            var xx1 = other[0],
                xy1 = other[1],
                yx1 = other[2],
                yy1 = other[3],
                dx1 = other[4],
                dy1 = other[5],
                xx2 = this[0],
                xy2 = this[1],
                yx2 = this[2],
                yy2 = this[3],
                dx2 = this[4],
                dy2 = this[5];
            return new Transform([
                xx1*xx2 + xy1*yx2,
                xx1*xy2 + xy1*yy2,
                yx1*xx2 + yy1*yx2,
                yx1*xy2 + yy1*yy2,
                xx2*dx1 + yx2*dy1 + dx2,
                xy2*dx1 + yy2*dy1 + dy2
            ]);
        },
        /**
         * Return a new transformation, which is the other transformation
         * transformed by self. self.reverseTransform(other) is equivalent to
         * other.transform(self).
         * 
         * Example:
         *      >>> t = Transform(2, 0, 0, 3, 1, 6)
         *      >>> t.reverseTransform((4, 3, 2, 1, 5, 6))
         *      <Transform [8 6 6 3 21 15]>
         *      >>> Transform(4, 3, 2, 1, 5, 6).transform((2, 0, 0, 3, 1, 6))
         *      <Transform [8 6 6 3 21 15]>
         *      >>>
         */
        reverseTransform: function(other)
        {
            var xx1 = this[0],
                xy1 = this[1],
                yx1 = this[2],
                yy1 = this[3],
                dx1 = this[4],
                dy1 = this[5],
                xx2 = other[0],
                xy2 = other[1],
                yx2 = other[2],
                yy2 = other[3],
                dx2 = other[4],
                dy2 = other[5];
            return new Transform([
                xx1*xx2 + xy1*yx2,
                xx1*xy2 + xy1*yy2,
                yx1*xx2 + yy1*yx2,
                yx1*xy2 + yy1*yy2,
                xx2*dx1 + yx2*dy1 + dx2,
                xy2*dx1 + yy2*dy1 + dy2
            ]);
        },
        /**
         * Return the inverse transformation.
         * 
         * Example:
         *     >>> t = Identity.translate(2, 3).scale(4, 5)
         *     >>> t.transformPoint((10, 20))
         *     (42, 103)
         *     >>> it = t.inverse()
         *     >>> it.transformPoint((42, 103))
         *     (10.0, 20.0)
         *     >>>
         */
        inverse: function()
        {
            if( this.cmp(Identity) )
                return this;
            var XX = this[0],
                XY = this[1],
                YX = this[2],
                YY = this[3],
                DX = this[4],
                DY = this[5],
                det = XX*YY - YX*XY,
                xx = YY/det,
                xy = -XY/det,
                yx = -YX/det,
                yy = XX/det,
                dx = -xx*DX - yx*DY,
                dy = -xy*DX - yy*DY;
            return new Transform([xx, xy, yx, yy, dx, dy]);
        },
        /**
         * Return a PostScript representation:
         *  >>> t = Identity.scale(2, 3).translate(4, 5)
         *  >>> t.toPS()
         *  '[2 0 0 3 8 15]'
         *  >>>
         */
        toPS: function()
        {
            return ['[', this.__affine().join(' '),']'].join('');
        },
        /*compare*/
        cmp: function(other)
        {
            return (
               other[0] === this[0]
            && other[1] === this[1]
            && other[2] === this[2]
            && other[3] === this[3]
            && other[4] === this[4]
            && other[5] === this[5]
            )
        },
        valueOf: function()
        {
            return ['<Transform ', this.toPS(), '>'].join('');
        },
        toString: function()
        {
            return this.__affine().join(' ');
        },
        /**
         * Transform instances also behave like a list of length 6:
         */
        get length()
        {
            return 6;
        },
        /**
         * Transform instances also behave like sequences and even support
         * slicing...
         */
        slice: function(start, len)
        {
            return this.__affine().slice(start, len);
        },
        /**
         * Transform is usable kind of like an array
         * var t = new Transform();
         * echo t[0]; //1
         */
        get 0()
        {
            return this.__get(0);
        },
        get 1()
        {
            return this.__get(1);
        },
        get 2()
        {
            return this.__get(2);
        },
        get 3()
        {
            return this.__get(3);
        },
        get 4()
        {
            return this.__get(4);
        },
        get 5()
        {
            return this.__get(5);
        }
    });
    /**
    * Return the identity transformation offset by x, y.
    * 
    * Example:
    *      >>> offset(2, 3)
    *      <Transform [2 0 0 3 0 0]>
    *      >>>
    */
    var Offset= function(x, y) {
        x = x || 0;
        y = y || 0;
        return new Transform([1, 0, 0, 1, x, y]);
    }
    
    /**
     * Return the identity transformation scaled by x, y. The 'y' argument
     * may be None, which implies to use the x value for y as well.
     * 
     * Example:
     *  >>> Scale(2, 3)
     *  <Transform [2 0 0 3 0 0]>
     *  >>>
     */
    var Scale = function(x, y) {
        if(y === undefined || y === null)
            y = x;
        return new Transform([x, 0, 0, y, 0, 0]);
    }
    
    var Identity = new Transform();
    
    return {
        Transform: Transform,
        Identity: Identity,
        Offset: Offset,
        Scale: Scale
    }
});
