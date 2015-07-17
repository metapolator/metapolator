define([
    './_ElementModel'
  , './GlyphModel'
], function(
    Parent
  , GlyphModel
){
    "use strict";
    function MasterModel(name, baseParameters, baseOperators, parent, MOMelement, cpsFile, sequenceId, masterId) {
        this.level = "master";
        this.id = masterId;
        this.sequenceId = sequenceId;
        this.name = name;
        this.displayName = name;
        this.display = false;
        this.edit = true;
        this.ag = "Ag";
        this.children = [];

        // cps properties
        this.parameters = [];
        this.master = this;
        this.cpsFile = cpsFile;
        this.MOMelement = MOMelement;
        this.ruleIndex = null;

        this.addBaseModels(baseParameters, baseOperators);

        
        Object.defineProperty(this, 'parent', {
            value: parent,
            enumerable: false,
            writable: true,
            configurable: true
        });
    }
    
    var _p = MasterModel.prototype = Object.create(Parent.prototype);

    _p.getSelector = function() {
        return "master#" + this.name;
    };
    
    _p.addGlyph = function(name, MOMelement) {
        var glyph = new GlyphModel(name, this.baseParameters, this.baseOperators, this, MOMelement);
        this.children.push(glyph);
        return glyph;
    };
   
   _p.findGlyphByName = function(glyphName) {
       for (var i = 0, l = this.children.length; i < l; i++) {
           var glyph = this.children[i];
           if (glyph.name === glyphName) {
               return glyph;
           }
       }
       return false;
   };
    
    
    return MasterModel;
});
