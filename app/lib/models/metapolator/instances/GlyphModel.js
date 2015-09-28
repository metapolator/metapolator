define([
    '../_BaseModel'
], function(
    Parent
){
    'use strict';
    function GlyphModel(name, parent) {
        this.level = 'glyph';
        this.type = 'instance';
        this.name = name;
        this.edit = false;
        
        Object.defineProperty(this, 'parent', {
            value: parent,
            enumerable: false,
            writable: true,
            configurable: true
        });
    }
    
    var _p = GlyphModel.prototype = Object.create(Parent.prototype);

    _p.getMasterName = function() {
        return this.parent.name;
    };

    // this returns the glyphs - from the master this instance is based upon -
    // with the same name as this glyph
    _p.getMasterGlyphs = function(glyphName) {
        var glyphs = [];
        for (var i = this.parent.axes.length - 1; i >= 0; i--) {
            var axis =  this.parent.axes[i]
              , master = axis.master;
            glyphs.push(master.findGlyphByName(this.name));
        }
        return glyphs;
    };
    
    
    return GlyphModel;
});
