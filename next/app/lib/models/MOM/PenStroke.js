define([
    './_Contour'
  , './PenStrokePoint'
], function(
    Parent
  , PenStrokePoint
) {
    "use strict";
    /**
     * This Element is the container of all points of a pen stroke contour.
     * It may have some metadata (like an identifier) and contain children
     * of type MOM PenStrokePoint.
     */
    function PenStroke() {
        Parent.call(this);
    }
    var _p = PenStroke.prototype = Object.create(Parent.prototype);
    _p.constructor = PenStroke;
    
    Object.defineProperty(_p, 'MOMType', {
        value: 'MOM PenStroke'
    })
    
    Object.defineProperty(_p, 'type', {
        /* this is used for CPS selectors*/
        value: 'penstroke'
    })
    
    _p._acceptedChildren = [PenStrokePoint];
    
    return PenStroke;
})

