define([
    './_Node'
], function(
    Parent
) {
    "use strict";
    /**
     * This Element represents a child of a of a MoM PenStrokePoint
     */
    function _PenStrokePointChild() {
        Parent.call(this);
    }
    var _p = _PenStrokePointChild.prototype = Object.create(Parent.prototype);
    _p.constructor = _PenStrokePointChild;
    
    return _PenStrokePointChild;
})
