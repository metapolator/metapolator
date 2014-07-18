define([
    './_PenStrokePointChild'
], function(
    Parent
) {
    "use strict";
    function PenStrokePointLeft() {
        Parent.call(this);
    }
    var _p = PenStrokePointLeft.prototype = Object.create(Parent.prototype);
    _p.constructor = PenStrokePointLeft;
    
    Object.defineProperty(_p, 'MOMType', {
        value: 'MOM PenStrokePointLeft'
    })
    
    Object.defineProperty(_p, 'type', {
        /* this is used for CPS selectors */
        value: 'left'
    })
    
    return PenStrokePointLeft;
})
