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
    
    
    return GlyphModel;
});
