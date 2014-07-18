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
define([
    'ufojs/tools/pens/BasePen'
  , 'metapolator/errors'
  , './SegmentPoint'
        
], function(
    Parent
  , errors
  , Point
) {
    "use strict";
    
    /*constructor*/
    function SegmentPen() {
        this._currentContour = null;
        this.contours = [];
        
        Parent.apply(this, [{}].concat(arguments));
    };
    
    /*inheritance*/
    var _p = SegmentPen.prototype = Object.create(Parent.prototype);
    _p.constructor = SegmentPen;
    
    _p._PointConstructor = Point;
    
    _p._pointFactory = function(val) {
        return (val instanceof Array)
            ? new this._PointConstructor(val)
             // expect it is already a Point
            : val;
    }
    
    _p._newContour = function() {
        errors.assert(this._currentContour === null,
                                'this._currentContour should be null')
        this._currentContour = {
            commands: []
          , closed: undefined
        }
    }
    
    _p._closeContour = function() {
        // maybe if the contour is empty, this might happen ???
        // please report if you have trouble with this assertion
        errors.assert(this._currentContour !== null,
                                'this._currentContour should NOT be null')
        this.contours.push(this._currentContour);
        this._currentContour = null;
    }
    
    _p._endPath = function() {
        // assert this._currentContour !== null
        this._currentContour.closed = false;
        this._closeContour();
    }
    
    _p._closePath = function() {
        this._currentContour.closed = true;
        this._closeContour();
    }
    
    _p.flush = function() {
        var contours = this.contours;
        this.contours = [];
        this._currentContour = null;
        return contours;
    }
    
    _p._moveTo = function(pt) {
        this._newContour();
        pt = this._pointFactory(pt);
        this._currentContour.commands.push(['moveTo', pt]);
    }
    
    _p._lineTo = function(pt)
    {
        pt = this._pointFactory(pt);
        this._currentContour.commands.push(['lineTo', pt]);
    }
    
    _p._curveToOne = function(pt1, pt2, pt3)
    {
        pt1 = this._pointFactory(pt1);
        pt2 = this._pointFactory(pt2);
        pt3 = this._pointFactory(pt3);
        this._currentContour.commands.push(['curveTo', pt1, pt2, pt3]);
    }
    
    return SegmentPen;
});
