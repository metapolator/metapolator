define([
    '../_BaseModel'
], function(
    _BaseModel
){
    "use strict";
    function AxisModel(master, axisValue, metapolationValue) {
        this.master = master;
        this.axisValue = axisValue;
        this.metapolationValue = metapolationValue;
    }
    
    var _p = AxisModel.prototype = Object.create(_BaseModel.prototype);
    
    return AxisModel;
});
