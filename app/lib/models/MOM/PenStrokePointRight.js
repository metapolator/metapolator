define([
    './_PenStrokePointChild'
], function(
    Parent
) {
    "use strict";
    function PenStrokePointRight() {
        Parent.call(this);
    }
    var _p = PenStrokePointRight.prototype = Object.create(Parent.prototype);
    _p.constructor = PenStrokePointRight;
    
    Object.defineProperty(_p, 'MOMType', {
        value: 'MOM PenStrokePointRight'
    })
    
    Object.defineProperty(_p, 'type', {
        /* this is used for CPS selectors */
        value: 'right'
    })
    
    return PenStrokePointRight;
})
