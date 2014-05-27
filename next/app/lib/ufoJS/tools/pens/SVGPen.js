/**
 * Copyright (c) 2011, Lasse Fister lasse@graphicore.de, http://graphicore.de
 * 
 * You should have received a copy of the MIT License along with this program.
 * If not, see http://www.opensource.org/licenses/mit-license.php
 *
 * This pen draws path data to a SVG path element. It inherts from BasePen.
 * 
 * Noteable documents:
 *    http://www.w3.org/TR/SVG/paths.html#InterfaceSVGPathSegList
 *    http://www.w3.org/TR/SVG/paths.html#InterfaceSVGPathElement
 */

define(
    [
        'ufojs',
        'ufojs/errors',
        './BasePen'
    ],
    function(
        main,
        errors,
        BasePen
    )
{
    "use strict";
    var enhance = main.enhance;
    
    /*constructor*/
    function SVGPen(path, glyphSet) {
        BasePen.call(this, glyphSet);
        this.path = path;
        this.segments = path.pathSegList;
    };
    
    /*inheritance*/
    SVGPen.prototype = new BasePen;

    /*definition*/
    enhance(SVGPen, {
        _commands:
        {
            'moveTo': 'createSVGPathSegMovetoAbs',
            'lineTo': 'createSVGPathSegLinetoAbs',
            'curveTo': 'createSVGPathSegCurvetoCubicAbs',
            'closePath': 'createSVGPathSegClosePath'
        },
        _addSegment: function(name, args)
        {
                //make a real array out of this
            var args = args ? [].slice.call(args) : [],
                // make a flat list out of the points, because the
                // SVG Path Commands work that way
                points = args.concat.apply([], args),
                cmd = this._commands[name],
                path = this.path,
                segment = path[cmd].apply(path, points);
            this.segments.appendItem(segment);
        },
        _moveTo: function(pt)
        {
            this._addSegment('moveTo', arguments);
        },
        _lineTo: function(pt)
        {
            this._addSegment('lineTo', arguments);
        },
        _curveToOne: function(pt1, pt2, pt3)
        {
            //notice that we change the order of the points
            this._addSegment('curveTo', [pt3, pt1, pt2]);
        },
        _closePath: function()
        {
            this._addSegment('closePath');
        },
        /**
         * Delete all segments from path
         */
        clear: function()
        {
            this.segments.clear();
        }
    });
    
    return SVGPen;
});
