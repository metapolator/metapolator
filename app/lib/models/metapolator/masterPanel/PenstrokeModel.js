define([
    './_ElementModel'
  , './PointModel'
], function(
    Parent
  , PointModel
){
    "use strict";
    function PenstrokeModel(name, baseParameters, baseOperators, parent, masterPanel, MOMelement) {
        this.level = "penstroke";
        this.name = name;
        this.MOMelement = MOMelement;
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
    
    var _p = PenstrokeModel.prototype = Object.create(Parent.prototype);
    
    _p.addPoint = function(name, MOMelement) {
        this.children.push(
            new PointModel(name, this.baseParameters, this.baseOperators, this, this.masterPanel, MOMelement)
        );
    };

    return PenstrokeModel;
});
