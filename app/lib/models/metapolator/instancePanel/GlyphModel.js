define([
    '../_BaseModel'
], function(
    _BaseModel
){
    "use strict";
    function GlyphModel(name, instanceName, parent) {
        this.level = "glyph";
        this.type = "instance";
        this.name = name;
        // this is called masterName, to keep masters and instances in sync, 
        // concerning passing its parent name for the drawing of the svg and for 
        // putting the parent name on the glyph to detect a mouseover
        this.masterName = instanceName;
        this.edit = false;
        
        Object.defineProperty(this, 'parent', {
            value: parent,
            enumerable: false,
            writable: true,
            configurable: true
        });
    }
    
    var _p = GlyphModel.prototype = Object.create(_BaseModel.prototype);
    
    
    return GlyphModel;
});
