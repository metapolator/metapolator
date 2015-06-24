define([
    './_ElementModel'
], function(
    _ElementModel
){
    "use strict";
    function PointModel(name, baseParameters, baseOperators, parent, masterPanel) {
        this.level = "point";
        this.name = name;
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
    
    var _p = PointModel.prototype = Object.create(_ElementModel.prototype);

    return PointModel;
});
