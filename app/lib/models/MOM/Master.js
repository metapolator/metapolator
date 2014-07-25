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
     * As long as there is just one, we don't need to display the multivers
     * and univers selectors
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
