define([
    './_Node'
  , './_PenStrokePointChild'
  , './PenStrokePointLeft'
  , './PenStrokePointCenter'
  , './PenStrokePointRight'
  , 'metapolator/models/CPS/whitelistProxies'
], function(
    Parent
  , _PenStrokePointChild
  , PenStrokePointLeft
  , PenStrokePointCenter
  , PenStrokePointRight
  , whitelistProxies
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
     *
     * skeleton is expected to be a structure with three readable keys:
     * {
     *      in: Vector || undefined
     *    , on: Vector // must be set
     *    , out: Vector || undefined
     * }
     * These are the absolute coordinates of the skeleton.
     *
     */
    function PenStrokePoint(skeleton) {
        Parent.call(this);
        this._skeleton = skeleton;

        this.add(new PenStrokePointLeft());  // 0
        this.add(new PenStrokePointCenter());// 1
        this.add(new PenStrokePointRight()); // 2
        Object.freeze(this._children);
    }
    var _p = PenStrokePoint.prototype = Object.create(Parent.prototype);
    _p.constructor = PenStrokePoint;

    PenStrokePoint.SkeletonDataConstructor = function(obj) {
        for(var k in obj) this[k] = obj[k];
        this.cps_proxy = whitelistProxies.generic(this, this._cps_whitelist);
    };
    PenStrokePoint.SkeletonDataConstructor.prototype._cps_whitelist = {
        on: 'on'
      , in: 'in'
      , out: 'out'
    };

    //inherit from parent
    _p._cps_whitelist = {
        skeleton: 'skeleton'
      , left: 'left'
      , center: 'center'
      , right: 'right'
    };
    //inherit from parent
    (function(source) {
        for(var k in source) if(!this.hasOwnProperty(k)) this[k] = source[k];
    }).call(_p._cps_whitelist, Parent.prototype._cps_whitelist);

    Object.defineProperty(_p, 'MOMType', {
        value: 'MOM PenStrokePoint'
    })

    Object.defineProperty(_p, 'type', {
        /* this is used for CPS selectors */
        value: 'point'
    })

    /**
     * This is the on curve point of the skeleton.
     * I thought about calling it origin, maybe.
     */
    Object.defineProperty(_p, 'skeleton', {
        get: function() {
            return this._skeleton;
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
