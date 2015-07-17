define([
    './_ElementModel'
  , './PointModel'
], function(
    Parent
  , PointModel
){
    "use strict";
    function PenstrokeModel(name, baseParameters, baseOperators, parent, MOMelement) {
        this.level = "penstroke";
        this.name = name;
        this.children = [];

        // cps properties
        this.parameters = [];
        this.master = parent.master;
        this.selector = "master#" + parent.masterName + " " + "glyph#" + parent.name + " > " + name;
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
    
    var _p = PenstrokeModel.prototype = Object.create(Parent.prototype);
    
    _p.addPoint = function(name, MOMelement) {
        this.children.push(
            new PointModel(name, this.baseParameters, this.baseOperators, this, MOMelement)
        );
    };

    return PenstrokeModel;
});
