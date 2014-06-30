define([
    './_Node'
  , './_Contour'
], function(
    Parent
  , _Contour
) {
    "use strict";
    /**
     * This Element is the container of all contours of a glyph.
     * It will have some metadata and contain children of type MOM _Contour.
     * 
     * Possible candiates for other children would be everything else
     * found in a UFO-Glyph. But, we can make properties about that stuff,
     * too. Guidelines would make a good candidate for further children,
     * because we might actually wan't to access these via CPS.
     * 
     * In the first version we the only child of MOM _Contour is
     * MOM PenStroke.
     */
    function Glyph() {
        Parent.call(this);
    }
    var _p = Glyph.prototype = Object.create(Parent.prototype);
    _p.constructor = Glyph;
    
    Object.defineProperty(_p, 'MOMType', {
        value: 'MOM Glyph'
    })
    
    Object.defineProperty(_p, 'type', {
        /* this is used for CPS selectors */
        value: 'glyph'
    })
    
    _p._acceptedChildren = [_Contour];
    
    return Glyph;
})
