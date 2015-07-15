define([
    './_ElementModel'
  , './PenstrokeModel'
], function(
    Parent
  , PenstrokeModel
){
    "use strict";
    function GlyphModel(name, masterName, baseParameters, baseOperators, parent, masterPanel, MOMelement) {
        this.level = "glyph";
        this.type = "master";
        this.masterName = masterName;
        this.MOMelement = MOMelement;
        this.name = name;
        this.edit = false;
        this.children = [];
        this.parameters = [];
        // only the initial parameter values are measured for glyphs when they appear in the view
        this.measured = false;
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
    
    var _p = GlyphModel.prototype = Object.create(Parent.prototype);
    
    _p.addPenstroke = function(name, MOMelement) {
        var penstroke = new PenstrokeModel(name, this.baseParameters, this.baseOperators, this, this.masterPanel, MOMelement);
        this.children.push(penstroke);
        return penstroke;
    };
    
    _p.measureGlyph = function () {
        window.logCall("measureGlyph");
        for (var i = this.baseParameters.length - 1; i >= 0; i--) {
            // get all the elements for the specific parameter. Eg: "weight" has
            // its effecitve level at point level, so for weight the effected
            // elements are all "points" of this glyph
            var baseParameter = this.baseParameters[i]
              , effectedElements = this.findLevelOffspring(baseParameter.effectiveLevel);
            for (var j = 0, jl = effectedElements.length; j < jl; j++) {
                var effectedElement = effectedElements[j]
                  , elementParameter = effectedElement.getParameterByName(baseParameter.name)
                  , MOMelement = effectedElement.MOMelement;
                elementParameter.setInitial(MOMelement);
            }
        }
        this.measured = true;
    };    
    
    return GlyphModel;
});
