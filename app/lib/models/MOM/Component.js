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
        baseGlyphName:           '_baseGlyphName'
      , originalTransformation:  '_transformation'
    };
    //inherit from parent
    (function(source) {
        for(var k in source) if(!this.hasOwnProperty(k)) this[k] = source[k];
    }).call(_p._cps_whitelist, Parent.prototype._cps_whitelist);

    Object.defineProperty(_p, 'baseGlyphName', {
        get: function() {
            return this._baseGlyphName;
        }
    });
    Object.defineProperty(_p, 'transformation', {
        get: function() {
            return this._transformation;
        }
    });

    Object.defineProperty(_p, 'MOMType', {
        value: 'MOM Component'
    })
    
    Object.defineProperty(_p, 'type', {
        /* this is used for CPS selectors*/
        value: 'component'
    })
    
    _p._acceptedChildren = [];
    
    return Component;
})

