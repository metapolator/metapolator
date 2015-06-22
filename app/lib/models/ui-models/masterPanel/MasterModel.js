define([
    './_ElementModel'
  , './GlyphModel'
], function(
    _ElementModel
  , GlyphModel
){
    "use strict";
    function MasterModel(name, baseParameters, baseOperators, parent, masterPanel) {
        this.level = "master";
        this.name = name;
        this.displayName = name;
        this.display = false;
        this.edit = [true, true];
        this.ag = "Ag";
        this.children = [];
        this.parameters = [];
        this.addBaseModels(baseParameters, baseOperators);
        
        Object.defineProperty(this, 'parent', {
            value: parent,
            enumerable: false,
            writable: true,
            configurable: true
        });
        Object.defineProperty(this, 'masterPanel', {
            value: masterPanel,
            enumerable: false,
            writable: true,
            configurable: true
        });
    }
    
    var _p = MasterModel.prototype = Object.create(_ElementModel.prototype);
    
    _p.addGlyph = function(name) {
        this.children.push(
            new GlyphModel(name, this.name, this.baseParameters, this.baseOperators, this, this.masterPanel)
        );
    };
   
   _p.findGlyphByName = function(glyphName) {
       window.logCall("findGlyphByName");
       var found = null;
       angular.forEach(this.children, function(glyph) {
           if (glyph.name == glyphName) {
               found = glyph;
           }
       });
       return found;
   };
    
    
    return MasterModel;
});
