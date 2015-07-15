define([
    './_ElementModel'
  , './PenstrokeModel'
], function(
    Parent
  , PenstrokeModel
){
    "use strict";
    function GlyphModel(name, masterName, baseParameters, baseOperators, parent, masterPanel) {
        this.level = "glyph";
        this.type = "master";
        this.masterName = masterName;
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
    
    _p.addPenstroke = function(name) {
        var penstroke = new PenstrokeModel(name, this.baseParameters, this.baseOperators, this, this.masterPanel);
        this.children.push(penstroke);
        return penstroke;
    };
    
    _p.measureGlyph = function () {
        window.logCall("measureGlyph");
        for (var i = this.baseParameters.length - 1; i >= 0; i--) {
            var baseParameter = this.baseParameters[i];
            console.log("if you see this, then the penstrokes and points are not there yet");
            /*
            var effectedElements = self.findLevelOffspring(baseParameter.effectiveLevel);
            angular.forEach(effectedElements, function(effectedElement) {
                var elementParameter = effectedElement.getParameterByName(baseParameter.name);
                elementParameter.setInitial();   
            });
            */
        }
        this.measured = true;
    };    
    
    return GlyphModel;
});
