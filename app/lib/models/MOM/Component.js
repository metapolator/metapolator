define([
    './_Contour'
], function(
    Parent
) {
    "use strict";
    /**
     * This is a UFO component reference.
     */
    function Component() {
        Parent.call(this);
    }
    var _p = Component.prototype = Object.create(Parent.prototype);
    _p.constructor = Component;

    Object.defineProperty(_p, 'baseGlyphName', {
        get: function() {
            return this._baseGlyphName;
        },
        set: function(v) { this._baseGlyphName = v; }
    })

    Object.defineProperty(_p, 'transformation', {
        get: function() {
            return this._transformation;
        },
        set: function(v) { this._transformation = v; }
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

