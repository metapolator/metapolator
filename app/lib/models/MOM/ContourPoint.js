define([
    './_Node'
  , './PointData'
  , 'metapolator/models/CPS/whitelistProxies'
], function(
    Parent
  , PointData
  , whitelistProxies
) {
    "use strict";
    /**
     * This Element represents a point of a of a MoM Contour (outline).
     * Its properties are the absolute coordinates of an on-curve point
     * of the outline of a contour.
     *
     * It doesn't accept add or removal of children.
     *
     * pointData is expected to be a PointData instance with three readable keys:
     * {
     *      in: Vector // must be set
     *    , on: Vector // must be set
     *    , out: Vector // must be set
     * }
     *
     * These are the absolute coordinates of the skeleton.
     *
     */
    function ContourPoint(pointData) {
        Parent.call(this);
        if(!(pointData instanceof PointData))
            throw new TypeError('Expected an instance of PointData.');
        this._skeleton = pointData;
        Object.freeze(this._children);
    }
    var _p = ContourPoint.prototype = Object.create(Parent.prototype);
    _p.constructor = ContourPoint;

    //inherit from parent
    _p._cps_whitelist = {
        skeleton: 'skeleton'
    };//inherit from parent
    (function(source) {
        for(var k in source) if(!this.hasOwnProperty(k)) this[k] = source[k];
    }).call(_p._cps_whitelist, Parent.prototype._cps_whitelist);


    _p.clone = function() {
        var clone = new this.constructor(new PointData(this._skeleton));
        this._cloneProperties(clone);
        return clone;
    };

    Object.defineProperty(_p, 'MOMType', {
        value: 'MOM ContourPoint'
    });

    Object.defineProperty(_p, 'type', {
        /* this is used for CPS selectors */
        value: 'p'
    });

    /**
     * This is the Original data from the glif-file
     * I thought about calling it origin, maybe.
     */
    Object.defineProperty(_p, 'skeleton', {
        get: function() {
            return this._skeleton;
        }
    });

    _p._acceptedChildren = [];

    return ContourPoint;
});
