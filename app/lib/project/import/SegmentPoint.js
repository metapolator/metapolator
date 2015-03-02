define([
    'metapolator/errors'
  , 'metapolator/math/Vector'
], function(
    errors
  , Parent
) {
    "use strict";
    var DeprecatedError = errors.Deprecated;

    function SegmentPoint(xy, smooth, name, kwargs) {
        Parent.apply(this, xy);

        this.smooth = smooth;
        this.name = name;

        // I expect the 'identifier' keyword here, but that kwds syntax
        // could bring in even more names.
        this.kwargs = kwargs || {};
    }

    SegmentPoint.factory = function(xy, smooth, name, kwargs) {
        return new SegmentPoint(xy, smooth, name, kwargs);
    };

    var _p = SegmentPoint.prototype = Object.create(Parent.prototype);

    _p.toString = function() {
        return '<SegmentPoint'
            + (this.name ? ' ' + this.name : '')
            + ' ' + this.valueOf() +'>';
    };

    Object.defineProperty(_p, 'vector', {
        get: function() {
            throw new DeprecatedError('SegmentPoint is now a subclass of '
                +' metapolator/math/Vector don\'t use this property.');
        }
    });

    return SegmentPoint;
});
