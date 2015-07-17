define([
    './_ElementModel'
  , './PenstrokeModel'
], function(
    Parent
  , PenstrokeModel
){
    "use strict";
    function GlyphModel(name, baseParameters, baseOperators, parent, MOMelement) {
        this.level = "glyph";
        this.type = "master";
        this.name = name;
        this.edit = false;
        this.children = [];

        // cps properties
        this.parameters = [];
        this.measured = false; // only the initial parameter values are measured for glyphs when they appear in the view
        this.master = parent;
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
    
    var _p = GlyphModel.prototype = Object.create(Parent.prototype);

    _p.getSelector = function() {
        return "master glyph#" + this.name;
    };

    _p.getMasterName = function() {
        return this.parent.name;
    };
    
    _p.addPenstroke = function(name, MOMelement) {
        var penstroke = new PenstrokeModel(name, this.baseParameters, this.baseOperators, this, MOMelement);
        this.children.push(penstroke);
        return penstroke;
    };
    
    _p.measureGlyph = function () {
        for (var i = this.baseParameters.length - 1; i >= 0; i--) {
            // get all the elements for the specific parameter. Eg: "weight" has
            // its effecitve level at point level, so for weight the effected
            // elements are all "points" of this glyph
            var baseParameter = this.baseParameters[i]
              , effectedElements;
            // some glyphs don't have children (like 'space'). For these glyphs
            // we only have to set the parameters on with effectiveLevel 'glyph'
            if (this.children.length > 0 || baseParameter.effectiveLevel === "glyph") {
                if (baseParameter.effectiveLevel === "glyph") {
                    effectedElements = [this];
                } else {
                    effectedElements = this.findLevelOffspring(baseParameter.effectiveLevel);
                }
                for (var j = 0, jl = effectedElements.length; j < jl; j++) {
                    var effectedElement = effectedElements[j]
                        , elementParameter = effectedElement.getParameterByName(baseParameter.name)
                        , MOMelement = effectedElement.MOMelement;
                    elementParameter.setInitial(MOMelement);
                }
            }

        }
        this.measured = true;
    };    
    
    return GlyphModel;
});
