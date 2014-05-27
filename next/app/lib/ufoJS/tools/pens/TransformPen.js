/**
 * Copyright (c) 2011, Lasse Fister lasse@graphicore.de, http://graphicore.de
 * 
 * You should have received a copy of the MIT License along with this program.
 * If not, see http://www.opensource.org/licenses/mit-license.php
 * 
 * This is a translation of TransformPen defined in fontTools/pens/transformPen.py
 * The svn revision of the source file in trunk/Lib/ was 453 from 2003-09-16 12:14:48 +0200
 * 
 * I even copied the docstrings and comments! (These may still refer to the Python code)
 */

define(
    [
        'ufojs',
        './AbstractPen',
        '../misc/transform'
    ],
    function(
        main,
        AbstractPen,
        transform
    )
{
    "use strict";
    var enhance = main.enhance,
        Transform = transform.Transform;
    /**
     * Pen that transforms all coordinates using a Affine transformation,
     * and passes them to another pen.
     */
     
    /*constructor*/
    /**
     * The 'outPen' argument is another pen object. It will receive the
     * transformed coordinates. The 'transformation' argument can either
     * be a six-element Array, or a tools.misc.transform.Transform object.
     */
    function TransformPen(outPen, transformation) {
        if( transformation instanceof Array)
            transformation = new Transform(transformation);
        this._transformation = transformation;
        this._transformPoint = function(pt) {
            return transformation.transformPoint(pt);
        }
        this._outPen = outPen;
        this._stack = [];
    };

    /*inheritance*/
    TransformPen.prototype = new AbstractPen;

    /*definition*/
    enhance(TransformPen, {
        moveTo: function(pt)
        {
            this._outPen.moveTo(this._transformPoint(pt));
        },
        lineTo: function(pt)
        {
            this._outPen.lineTo(this._transformPoint(pt));
        },
        curveTo: function(/* *points */)
        {
            var points = [].slice.call(arguments);//transform arguments to an array
            this._outPen.curveTo.apply(this._outPen, this._transformPoints(points));
        },
        qCurveTo: function (/* *points */)
        {
            var points = [].slice.call(arguments);//transform arguments to an array
            if (points[points.length -1] === null) {
                points = this._transformPoints(points.slice(0, -1));
                points.push(null);
            } else {
                points = this._transformPoints(points);
            }
            this._outPen.qCurveTo.apply(this._outPen, points);
        },
        _transformPoints: function(points)
        {
            return points.map(this._transformPoint);
        },
        closePath: function()
        {
            this._outPen.closePath();
        },
        addComponent: function(glyphName, transformation)
        {
            transformation = this._transformation.transform(transformation);
            this._outPen.addComponent(glyphName, transformation);
        }
    });

    return TransformPen;
});
