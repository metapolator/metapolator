define([
    './_Node'
  , './_PenStrokePointChild'
  , './PenStrokePointLeft'
  , './PenStrokePointCenter'
  , './PenStrokePointRight'
], function(
    Parent
  , _PenStrokePointChild
  , PenStrokePointLeft
  , PenStrokePointCenter
  , PenStrokePointRight
) {
    "use strict";
    /**
     * This Element represents a point of a of a MoM PenStroke contour.
     * It's properties are the absolute coordinates of an on-curve point
     * of the centerline of a contour.
     * 
     * Eventually it may have a name and an identifier etc.
     * 
     * It has three children, in order: left, center, right
     * It doesn't accept add or removal of children.
     */
    function PenStrokePoint(vector) {
        Parent.call(this);
        this._vector = vector;
        
        this.add(new PenStrokePointLeft());  // 0
        this.add(new PenStrokePointCenter());// 1
        this.add(new PenStrokePointRight()); // 2
        Object.freeze(this._children)
    }
    var _p = PenStrokePoint.prototype = Object.create(Parent.prototype);
    _p.constructor = PenStrokePoint;
    
    Object.defineProperty(_p, 'MOMType', {
        value: 'MOM PenStrokePoint'
    })
    
    Object.defineProperty(_p, 'type', {
        /* this is used for CPS selectors */
        value: 'point'
    })
    
    Object.defineProperty(_p, 'skeleton', {
        get: function() {
            return this._vector;
        }
    })
    
    Object.defineProperty(_p, 'left', {
        get: function() {
            return this._children[0];
        }
    })
    
    Object.defineProperty(_p, 'center', {
        get: function() {
            return this._children[1];
        }
    })
    
    Object.defineProperty(_p, 'right', {
        get: function() {
            return this._children[2];
        }
    })
    
    _p._acceptedChildren = [_PenStrokePointChild];
    
    return PenStrokePoint;
})
