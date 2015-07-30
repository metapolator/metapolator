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

    _p.remove = function() { 
        // todo: get rid of this.parent.parent._project
        var project = this.parent.parent._project
          , index;
        project.deleteMaster(this.name);
        // empty cps file to prevent caching issues
        project.ruleController.write(false, this.cpsFile, '');
        index = this._getIndex();
        this.parent.parent.removeMasterFromDesignSpaces(this);
        this.parent.children.splice(index, 1);
    };
    
    _p._getIndex = function() {
        for (var i = this.parent.children.length - 1; i >= 0; i--) {
            var master = this.parent.children[i];
            if (master === this) {
                return i;
            }
        }
    };
    
    return MasterModel;
});
