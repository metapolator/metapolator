define([
    './CompoundVector'
], function(
    Parent
) {
    "use strict";
    function CompoundPoint(xy /*, ... vector components */) {
        Parent.apply(this, Array.prototype.slice.call(arguments));
    }
    
    var _p = CompoundPoint.prototype = Object.create(Parent.prototype);
    _p.constructor = CompoundPoint;
    
    return CompoundPoint;
});
