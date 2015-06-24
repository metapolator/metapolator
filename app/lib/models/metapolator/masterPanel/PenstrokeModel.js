define([
    './_ElementModel'
  , './PointModel'
], function(
    _ElementModel
  , PointModel
){
    "use strict";
    function PenstrokeModel(name, baseParameters, baseOperators, parent, masterPanel) {
        this.level = "penstroke";
        this.name = name;
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
        
        //add a fake point, untill engine is connected
        this.addPoint("i:0");
    }
    
    var _p = PenstrokeModel.prototype = Object.create(_ElementModel.prototype);
    
    _p.addPoint = function(name) {
        this.children.push(
            new PointModel(name, this.baseParameters, this.baseOperators, this, this.masterPanel)
        );
    };

    return PenstrokeModel;
});
