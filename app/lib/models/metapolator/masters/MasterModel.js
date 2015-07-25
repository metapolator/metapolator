define([
    './_ElementModel'
  , './GlyphModel'
], function(
    Parent
  , GlyphModel
){
    "use strict";
    function MasterModel(name, parent, MOMelement, cpsFile, sequenceId, masterId) {
        this.level = "master";
        this.id = masterId;
        this.sequenceId = sequenceId;
        this.name = name;
        this.displayName = name;
        this.display = false;
        this.edit = true;
        this.ag = "Ag";
        this.parent = parent;
        this.children = [];

        // cps properties
        this.parameters = [];
        this.master = this;
        this.cpsFile = cpsFile;
        this.MOMelement = MOMelement;
        this.ruleIndex = 3;

        this.setInitialParameters();
    }
    
    var _p = MasterModel.prototype = Object.create(Parent.prototype);

    _p.getSelector = function() {
        return "master";
    };
    
    _p.addGlyph = function(name, MOMelement) {
        var glyph = new GlyphModel(name, this, MOMelement);
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
   
    // after cloning, we need to reset the master property
    _p.setMaster = function(master) {
        this.master = master;
        if (this.children) {
            for (var i = 0, l = this.children.length; i < l; i++) {
                var child = this.children[i];
                child.setMaster(master);
            }
        }
    };
    
    
    return MasterModel;
});
