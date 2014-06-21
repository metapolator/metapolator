define([
    './_Node'
], function(
    Parent
) {
    "use strict";
    /**
     * This Element represents a point of a of a MoM PenStroke contour.
     * It's properties are the absolute coordinates of an on-curve point
     * of the centerline of a contour. All the other Parameters needed
     * to draw the contour should be defiend by 
     * Eventually it may have a name and an identifier etc.
     */
    function PenStrokePoint(vector) {
        Parent.call(this);
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
    
    return PenStrokePoint;
})
