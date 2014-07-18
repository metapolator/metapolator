define([
    './_PenStrokePointChild'
], function(
    Parent
) {
    "use strict";
    function PenStrokePointCenter() {
        Parent.call(this);
    }
    var _p = PenStrokePointCenter.prototype = Object.create(Parent.prototype);
    _p.constructor = PenStrokePointCenter;
    
    Object.defineProperty(_p, 'MOMType', {
        value: 'MOM PenStrokePointCenter'
    })
    
    Object.defineProperty(_p, 'type', {
        /* this is used for CPS selectors */
        value: 'center'
    })
    
    return PenStrokePointCenter;
})
