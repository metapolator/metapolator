define([
    './_Contour'
  , 'metapolator/models/CPS/whitelistProxies'
], function(
    Parent
  , whitelistProxies
) {
    "use strict";
    /**
     * This is a UFO component reference.
     */
    function Component( baseGlyphName, transformation ) {
        Parent.call(this);
        this._baseGlyphName  = baseGlyphName;
        this._transformation = transformation;
        Object.freeze(this._children);
        this.cps_proxy = whitelistProxies.generic(this, this._cps_whitelist);
    }
    var _p = Component.prototype = Object.create(Parent.prototype);
    _p.constructor = Component;

    _p._cps_whitelist = {
        parent:          'parent'
      , children:        'children'
      , baseGlyphName:   'baseGlyphName'
      , transformation:  'transformation'
      , type:            'type'
    }

    Object.defineProperty(_p, 'baseGlyphName', {
        get: function() {
            return this._baseGlyphName;
        }
//        , set: function(v) { this._baseGlyphName = v; }
    })

    Object.defineProperty(_p, 'transformation', {
        get: function() {
            return this._transformation;
        }
//        , set: function(v) { this._transformation = v; }
    })

    
    Object.defineProperty(_p, 'MOMType', {
        value: 'MOM Component'
    })
    
    Object.defineProperty(_p, 'type', {
        /* this is used for CPS selectors*/
        value: 'Component'
    })
    
    _p._acceptedChildren = [];
    
    return Component;
})

