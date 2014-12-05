define([
    './_Node'
  , './_Contour'
  , 'metapolator/models/CPS/whitelistProxies'
], function(
    Parent
  , _Contour
  , whitelistProxies
) {
    "use strict";
    /**
     * This Element is the container of all contours of a glyph.
     * It will have some metadata and contain children of type MOM _Contour.
     * 
     * Possible candiates for other children would be everything else
     * found in a UFO-Glyph. But, we can make properties about that stuff,
     * too. Guidelines would make a good candidate for further children,
     * because we might actually want to access these via CPS.
     * 
     * In the first version we the only child of MOM _Contour is
     * MOM PenStroke.
     */
    function Glyph() {
        Parent.call(this);
        this._advanceWidth  = 0;
        this._advanceHeight = 0;
        this._ufoData = {};
        this.cps_proxy = whitelistProxies.generic(this, this._cps_whitelist);
    }
    var _p = Glyph.prototype = Object.create(Parent.prototype);
    _p.constructor = Glyph;

    _p._cps_whitelist = {
        originalAdvanceWidth:  '_advanceWidth'
      , originalAdvanceHeight: '_advanceHeight'
    };
    //inherit from parent
    (function(source) {
        for(var k in source) if(!this.hasOwnProperty(k)) this[k] = source[k];
    }).call(_p._cps_whitelist, Parent.prototype._cps_whitelist);

    
    Object.defineProperty(_p, 'MOMType', {
        value: 'MOM Glyph'
    })
    
    Object.defineProperty(_p, 'type', {
        /* this is used for CPS selectors */
        value: 'glyph'
    })
    
    _p.setUFOData = function(ufoGlyph) {
        var i=0, keys = Object.keys(ufoGlyph);
        for(;i<keys.length;i++)
            this._ufoData[keys[i]] = ufoGlyph[keys[i]];
        if( ufoGlyph['width'] ) {
            this._advanceWidth = ufoGlyph['width'];
        }
        if( ufoGlyph['height'] ) {
            this._advanceHeight = ufoGlyph['height'];
        }
    }
    _p.getUFOData = function() {
        this._ufoData['width']  = this._advanceWidth;
        this._ufoData['height'] = this._advanceHeight;
        // Should be immutable or a copy, but we would have to make
        // a deep copy for this, because we don't want the contents to
        // be changed without us knowing, either.
        // Instead, we are going to invent more interfaces for UFO data
        // for a glyph in the future.
        return this._ufoData;
    }
    
    _p._acceptedChildren = [_Contour];
    
    return Glyph;
})
