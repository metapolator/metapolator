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
    function Master(fontinfo) {
        Parent.call(this);
        // FIXME: the data of fontinfo should be available via CPS
        // this can be done similar to PointData
        // MAYBE >> import fontinfo as CPS ???
        // some concepts are still unclear :-/
        Object.defineProperty(this, 'fontinfo', {
            value: fontinfo
        });
    }
    var _p = Master.prototype = Object.create(Parent.prototype);
    _p.constructor = Master;

    _p.clone = function(cloneElementProperties) {
        var clone = new this.constructor(this.fontinfo), i,l;
        this._cloneProperties(clone, cloneElementProperties);
        for(i=0,l=this._children.length;i<l;i++)
            clone.add(this._children[i].clone(cloneElementProperties));
        return clone;
    };

    Object.defineProperty(_p, 'MOMType', {
        value: 'MOM Master'
    });

    Object.defineProperty(_p, 'type', {
        /* this is used for CPS selectors*/
        value: 'master'
    });

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
    };

     /**
     * As long as there is just one univers, we don't need to display
     * the multivers and univers selectors
     */
    Object.defineProperty(_p, 'particulars', {
        get: function() {
            return [
                    this._parent ? '' : '(no parent)'
                  , ' '
                  , this.type
                  , (this.id ? '#' + this.id : '')
                  , (this._parent
                        ? ':i(' + this.index + ')'
                        : '')
                ].join('');
        }
    });

    _p._acceptedChildren = [Glyph];

    return Master;
});
