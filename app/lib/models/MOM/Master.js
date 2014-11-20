define([
    './_Node'
  , './Glyph'
], function(
    Parent
  , Glyph
) {
    "use strict";
    /**
     * This Element is the container of all glyphs of a master.
     * It will have some metadata and contain children of type MOM Glyph.
     */
    function Master() {
        Parent.call(this);
    }
    var _p = Master.prototype = Object.create(Parent.prototype);
    _p.constructor = Master;
    
    Object.defineProperty(_p, 'MOMType', {
        value: 'MOM Master'
    })
    
    Object.defineProperty(_p, 'type', {
        /* this is used for CPS selectors*/
        value: 'master'
    })

    /**
     * TODO: make indexed lookup for _Node.id
     */
    _p.findGlyph = function( glyphName ) {
        var col = this.children
        , i = 0
        , glyph
        ;
        for( i=0; i<col.length; i++ ) {
            glyph = col[i];
            if( glyph.id == glyphName ) {
                return glyph;
            }
        }
        return null;
    }
    
     /**
     * As long as there is just one univers, we don't need to display
     * the multivers and univers selectors
     */
    Object.defineProperty(_p, 'particulars', {
        get: function() {
            return [
                    this.parent ? '' : '(no parent)'
                  , ' '
                  , this.type,
                  , (this.id ? '#' + this.id : '')
                  , (this.parent
                        ? ':i(' + this.parent.find(this) + ')'
                        : '')
                ].join('');
        }
    })
    
    _p._acceptedChildren = [Glyph];
    
    return Master;
})
